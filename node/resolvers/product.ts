import { VBase } from '@vtex/api'

import { CatalogGQL } from '../clients/catalogGQL'
import {
  pacer,
  BUCKET_NAME,
  ALL_TRANSLATIONS_FILES,
  calculateExportProcessTime,
  PRODUCT_TRANSLATION_UPLOAD,
} from '../utils'

const CALLS_PER_MINUTE = 1600

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
      await pacer(CALLS_PER_MINUTE)
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
    estimatedTime: calculateExportProcessTime(
      productIdCollection.length,
      CALLS_PER_MINUTE
    ),
  }

  await vbase.saveJSON<ProductTranslationRequest>(
    BUCKET_NAME,
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

const calculateBreakpoints = (size: number): number[] => {
  return [
    Math.ceil(size * 0.25),
    Math.ceil(size * 0.5),
    Math.ceil(size * 0.75),
  ].filter((num, idx, self) => self.indexOf(num) === idx)
}

const uploadProductAsync = async (
  products: ProductTranslationInput[],
  requestId: string,
  { catalogGQL, vbase }: { catalogGQL: CatalogGQL; vbase: VBase }
) => {
  const translationRequest = await vbase.getJSON<UploadRequest>(
    BUCKET_NAME,
    requestId,
    true
  )

  try {
    const totalEntries = products.length

    const breakPointsProgress = calculateBreakpoints(totalEntries)

    let promiseController = []

    for (let i = 0; i < totalEntries; i++) {
      promiseController.push(catalogGQL.translateProduct(products[i]))
      // eslint-disable-next-line no-await-in-loop
      await pacer(CALLS_PER_MINUTE)
      if (breakPointsProgress.includes(i)) {
        // eslint-disable-next-line no-await-in-loop
        await Promise.all(promiseController)

        // eslint-disable-next-line no-await-in-loop
        await vbase.saveJSON<UploadRequest>(BUCKET_NAME, requestId, {
          ...translationRequest,
          progress: Math.ceil((i / totalEntries) * 100),
        })
        promiseController = []
      }
    }

    await Promise.all(promiseController)
    await vbase.saveJSON<UploadRequest>(BUCKET_NAME, requestId, {
      ...translationRequest,
      progress: 100,
    })
  } catch (error) {
    const translationRequestUpdated = await vbase.getJSON<UploadRequest>(
      BUCKET_NAME,
      requestId,
      true
    )
    await vbase.saveJSON<UploadRequest>(BUCKET_NAME, requestId, {
      ...translationRequestUpdated,
      error: true,
    })
  }
}

const uploadProductTranslations = async (
  _root: unknown,
  { products }: { products: ProductTranslationInput[] },
  ctx: Context
) => {
  const {
    clients: { catalogGQL, licenseManager, vbase },
    vtex: { adminUserAuthToken, requestId },
  } = ctx

  const {
    profile: { email },
  } = await licenseManager.getTopbarData(adminUserAuthToken as string)

  const allTranslationsMade = await vbase.getJSON<string[]>(
    BUCKET_NAME,
    PRODUCT_TRANSLATION_UPLOAD,
    true
  )

  const updateRequests = allTranslationsMade
    ? [requestId, ...allTranslationsMade]
    : [requestId]

  await vbase.saveJSON<string[]>(
    BUCKET_NAME,
    PRODUCT_TRANSLATION_UPLOAD,
    updateRequests
  )

  const requestInfo = {
    requestId,
    translatedBy: email,
    createdAt: new Date(),
    estimatedTime: calculateExportProcessTime(
      products.length,
      CALLS_PER_MINUTE
    ),
  }

  await vbase.saveJSON(BUCKET_NAME, requestId, requestInfo)

  uploadProductAsync(products, requestId, { catalogGQL, vbase })

  return true
}

const productTranslationsUploadRequests = async (
  _root: unknown,
  _args: unknown,
  ctx: Context
) =>
  ctx.clients.vbase.getJSON<string[]>(
    BUCKET_NAME,
    PRODUCT_TRANSLATION_UPLOAD,
    true
  )

const translationUploadRequestInfo = (
  _root: unknown,
  args: { requestId: string },
  ctx: Context
) => ctx.clients.vbase.getJSON<UploadRequest>(BUCKET_NAME, args.requestId)

export const mutations = { uploadProductTranslations }

export const queries = {
  productTranslations,
  productTranslationRequests,
  productTranslationRequestInfo,
  downloadProductTranslation,
  productTranslationsUploadRequests,
  translationUploadRequestInfo,
}
