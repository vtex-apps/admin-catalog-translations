import { VBase } from '@vtex/api'

import { CatalogGQL } from '../../clients/catalogGQL'
import {
  pacer,
  BUCKET_NAME,
  calculateExportProcessTime,
  PRODUCT_TRANSLATION_UPLOAD,
} from '../../utils'

const CALLS_PER_MINUTE = 1600

const calculateBreakpoints = (size: number): number[] => {
  return [
    Math.ceil(size * 0.25),
    Math.ceil(size * 0.5),
    Math.ceil(size * 0.75),
  ].filter((num, idx, self) => self.indexOf(num) === idx)
}

const uploadProductAsync = async (
  {
    products,
    requestId,
    locale,
  }: { products: ProductTranslationInput[]; requestId: string; locale: string },
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
      promiseController.push(catalogGQL.translateProduct(products[i], locale))
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
  { products, locale }: { products: ProductTranslationInput[]; locale: string },
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
    locale,
    translatedBy: email,
    createdAt: new Date(),
    estimatedTime: calculateExportProcessTime(
      products.length,
      CALLS_PER_MINUTE
    ),
  }

  await vbase.saveJSON<UploadRequest>(BUCKET_NAME, requestId, requestInfo)

  uploadProductAsync({ products, requestId, locale }, { catalogGQL, vbase })

  return requestId
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
  productTranslationsUploadRequests,
  translationUploadRequestInfo,
}
