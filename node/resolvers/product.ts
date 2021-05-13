import { VBase } from '@vtex/api'

import { CatalogGQL } from '../clients/catalogGQL'
import {
  pacer,
  BUCKET_NAME,
  ALL_TRANSLATIONS_FILES,
  calculateExportProcessTime,
} from '../utils'

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

const saveTranslation = async (
  {
    productIds,
    locale,
    requestId,
  }: { productIds: string[]; locale: string; requestId: string },
  { catalogGQLClient, vbase }: { catalogGQLClient: CatalogGQL; vbase: VBase }
): Promise<void> => {
  const translationRequest = await vbase.getJSON<ProductTranslationRequest>(
    BUCKET_NAME,
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
      await pacer()
    }

    const translations = await Promise.all(productTranslationPromises)

    const updateTranslation = {
      ...translationRequest,
      translations,
      completedAt: new Date(),
    }

    await vbase.saveJSON<ProductTranslationRequest>(
      BUCKET_NAME,
      requestId,
      updateTranslation
    )
  } catch {
    const addError = {
      ...translationRequest,
      error: true,
    }
    await vbase.saveJSON<ProductTranslationRequest>(
      BUCKET_NAME,
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
    BUCKET_NAME,
    ALL_TRANSLATIONS_FILES,
    true
  )

  const updateRequests = allTranslationRequest
    ? [requestId, ...allTranslationRequest]
    : [requestId]

  await vbase.saveJSON<string[]>(
    BUCKET_NAME,
    ALL_TRANSLATIONS_FILES,
    updateRequests
  )

  const requestInfo: ProductTranslationRequest = {
    requestId,
    requestedBy: email,
    categoryId,
    locale,
    createdAt: new Date(),
    estimatedTime: calculateExportProcessTime(productIdCollection.length),
  }

  await vbase.saveJSON<ProductTranslationRequest>(
    BUCKET_NAME,
    requestId,
    requestInfo
  )

  saveTranslation(
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
) => ctx.clients.vbase.getJSON(BUCKET_NAME, ALL_TRANSLATIONS_FILES, true)

const productTranslationRequestInfo = (
  _root: unknown,
  args: { requestId: string },
  ctx: Context
) => ctx.clients.vbase.getJSON(BUCKET_NAME, args.requestId)

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
  >(BUCKET_NAME, args.requestId, true)

  ctx.state.locale = locale

  return translations
}

export const queries = {
  productTranslations,
  productTranslationRequests,
  productTranslationRequestInfo,
  downloadProductTranslation,
}
