import { VBase } from '@vtex/api'

import { CatalogGQL } from '../../clients/catalogGQL'
import {
  pacer,
  PRODUCT_BUCKET,
  ALL_TRANSLATIONS_FILES,
  calculateExportProcessTime,
  CALLS_PER_MINUTE,
} from '../../utils'
import {
  mutations as uploadMutations,
  queries as uploadQueries,
} from './upload'

export const Product = {
  locale: (
    _root: ResolvedPromise<ProductTranslationResponse>,
    _args: unknown,
    ctx: Context
  ) => {
    return ctx.state.locale
  },
  id: (root: ResolvedPromise<ProductTranslationResponse>) =>
    root.data.product.id,
  name: (root: ResolvedPromise<ProductTranslationResponse>) =>
    root.data.product.name,
  description: (root: ResolvedPromise<ProductTranslationResponse>) =>
    root.data.product.description,
  shortDescription: (root: ResolvedPromise<ProductTranslationResponse>) =>
    root.data.product.shortDescription,
  title: (root: ResolvedPromise<ProductTranslationResponse>) =>
    root.data.product.title,
  linkId: (root: ResolvedPromise<ProductTranslationResponse>) =>
    root.data.product.linkId,
}

const saveTranslationsToVBase = async (
  {
    productIds,
    locale,
    requestId,
  }: { productIds: string[]; locale: string; requestId: string },
  { catalogGQLClient, vbase }: { catalogGQLClient: CatalogGQL; vbase: VBase }
): Promise<void> => {
  const translationRequest = await vbase.getJSON<ProductTranslationRequest>(
    PRODUCT_BUCKET,
    requestId,
    true
  )
  const productTranslationPromises = []
  try {
    for (const productId of productIds) {
      const translationPromise = catalogGQLClient.getProductTranslation(
        productId,
        locale
      )
      productTranslationPromises.push(translationPromise)
      // eslint-disable-next-line no-await-in-loop
      await pacer(CALLS_PER_MINUTE)
    }

    const translations = await Promise.all(productTranslationPromises)

    const updateTranslation = {
      ...translationRequest,
      translations,
      completedAt: new Date(),
    }

    await vbase.saveJSON<ProductTranslationRequest>(
      PRODUCT_BUCKET,
      requestId,
      updateTranslation
    )
  } catch {
    const addError = {
      ...translationRequest,
      error: true,
    }
    await vbase.saveJSON<ProductTranslationRequest>(
      PRODUCT_BUCKET,
      requestId,
      addError
    )
  }
}

const productTranslations = async (
  _root: unknown,
  args: { locale: string; categoryId: string },
  ctx: Context
) => {
  const {
    clients: { catalog, catalogGQL, vbase, licenseManager },
    vtex: { adminUserAuthToken, requestId },
  } = ctx

  const {
    profile: { email },
  } = await licenseManager.getTopbarData(adminUserAuthToken as string)

  const { locale, categoryId } = args

  const productIdCollection = await catalog.getAllProducts(categoryId)

  const allTranslationRequest = await vbase.getJSON<string[]>(
    PRODUCT_BUCKET,
    ALL_TRANSLATIONS_FILES,
    true
  )

  const updateRequests = allTranslationRequest
    ? [requestId, ...allTranslationRequest]
    : [requestId]

  await vbase.saveJSON<string[]>(
    PRODUCT_BUCKET,
    ALL_TRANSLATIONS_FILES,
    updateRequests
  )

  const requestInfo: ProductTranslationRequest = {
    requestId,
    requestedBy: email,
    categoryId,
    locale,
    createdAt: new Date(),
    estimatedTime: calculateExportProcessTime(
      productIdCollection.length,
      CALLS_PER_MINUTE
    ),
  }

  await vbase.saveJSON<ProductTranslationRequest>(
    PRODUCT_BUCKET,
    requestId,
    requestInfo
  )

  saveTranslationsToVBase(
    { productIds: productIdCollection, locale, requestId },
    {
      catalogGQLClient: catalogGQL,
      vbase,
    }
  )

  return requestInfo
}

const productTranslationRequests = (
  _root: unknown,
  _args: unknown,
  ctx: Context
) => ctx.clients.vbase.getJSON(PRODUCT_BUCKET, ALL_TRANSLATIONS_FILES, true)

const productTranslationRequestInfo = (
  _root: unknown,
  args: { requestId: string },
  ctx: Context
) => ctx.clients.vbase.getJSON(PRODUCT_BUCKET, args.requestId)

const downloadProductTranslation = async (
  _root: unknown,
  args: { requestId: string },
  ctx: Context
) => {
  const {
    clients: { vbase },
  } = ctx

  const { translations, locale } = await vbase.getJSON<
    ProductTranslationRequest
  >(PRODUCT_BUCKET, args.requestId, true)

  ctx.state.locale = locale

  return translations
}

export const mutations = {
  ...uploadMutations,
}

export const queries = {
  productTranslations,
  productTranslationRequests,
  productTranslationRequestInfo,
  downloadProductTranslation,
  ...uploadQueries,
}
