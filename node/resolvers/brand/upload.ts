import { ReadStream } from 'fs'

import { VBase } from '@vtex/api'

import { CatalogGQL } from '../../clients/catalogGQL'
import {
  pacer,
  BRAND_NAME,
  calculateExportProcessTime,
  BRAND_TRANSLATION_UPLOAD,
  calculateBreakpoints,
  CALLS_PER_MINUTE,
  parseStreamToJSON,
} from '../../utils'

const uploadBrandAsync = async (
  {
    brands,
    requestId,
    locale,
  }: { brands: BrandTranslationInput[]; requestId: string; locale: string },
  { catalogGQL, vbase }: { catalogGQL: CatalogGQL; vbase: VBase }
) => {
  const translationRequest = await vbase.getJSON<UploadRequest>(
    BRAND_NAME,
    requestId,
    true
  )

  try {
    const totalEntries = brands.length

    const breakPointsProgress = calculateBreakpoints(totalEntries)

    let promiseController = []

    for (let i = 0; i < totalEntries; i++) {
      promiseController.push(catalogGQL.translateBrand(brands[i], locale))
      // eslint-disable-next-line no-await-in-loop
      await pacer(CALLS_PER_MINUTE)
      if (breakPointsProgress.includes(i)) {
        // eslint-disable-next-line no-await-in-loop
        await Promise.all(promiseController)

        // eslint-disable-next-line no-await-in-loop
        await vbase.saveJSON<UploadRequest>(BRAND_NAME, requestId, {
          ...translationRequest,
          progress: Math.ceil((i / totalEntries) * 100),
        })
        promiseController = []
      }
    }

    await Promise.all(promiseController)
    await vbase.saveJSON<UploadRequest>(BRAND_NAME, requestId, {
      ...translationRequest,
      progress: 100,
    })
  } catch (error) {
    const translationRequestUpdated = await vbase.getJSON<UploadRequest>(
      BRAND_NAME,
      requestId,
      true
    )
    await vbase.saveJSON<UploadRequest>(BRAND_NAME, requestId, {
      ...translationRequestUpdated,
      error: true,
    })
  }
}

const uploadBrandTranslations = async (
  _root: unknown,
  { brands, locale }: { brands: UploadFile<ReadStream>; locale: string },
  ctx: Context
) => {
  const {
    clients: { catalogGQL, licenseManager, vbase },
    vtex: { adminUserAuthToken, requestId },
  } = ctx

  const { createReadStream } = await brands

  const brandStream = createReadStream()

  const brandsParsed = await parseStreamToJSON<BrandTranslationInput>(
    brandStream
  )

  const {
    profile: { email },
  } = await licenseManager.getTopbarData(adminUserAuthToken as string)

  const allTranslationsMade = await vbase.getJSON<string[]>(
    BRAND_NAME,
    BRAND_TRANSLATION_UPLOAD,
    true
  )

  const updateRequests = allTranslationsMade
    ? [requestId, ...allTranslationsMade]
    : [requestId]

  await vbase.saveJSON<string[]>(
    BRAND_NAME,
    BRAND_TRANSLATION_UPLOAD,
    updateRequests
  )

  const requestInfo = {
    requestId,
    locale,
    translatedBy: email,
    createdAt: new Date(),
    estimatedTime: calculateExportProcessTime(
      brandsParsed.length,
      CALLS_PER_MINUTE
    ),
  }

  await vbase.saveJSON<UploadRequest>(BRAND_NAME, requestId, requestInfo)

  uploadBrandAsync(
    { brands: brandsParsed, requestId, locale },
    { catalogGQL, vbase }
  )

  return requestId
}

const brandTranslationsUploadRequests = async (
  _root: unknown,
  _args: unknown,
  ctx: Context
) =>
  ctx.clients.vbase.getJSON<string[]>(
    BRAND_NAME,
    BRAND_TRANSLATION_UPLOAD,
    true
  )

const translationUploadRequestInfo = (
  _root: unknown,
  args: { requestId: string },
  ctx: Context
) => ctx.clients.vbase.getJSON<UploadRequest>(BRAND_NAME, args.requestId)

export const mutations = { uploadBrandTranslations }

export const queries = {
  brandTranslationsUploadRequests,
  translationUploadRequestInfo,
}
