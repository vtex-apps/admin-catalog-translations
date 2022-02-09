import { ReadStream } from 'fs'

import {
  BRAND_BUCKET,
  calculateExportProcessTime,
  BRAND_TRANSLATION_UPLOAD,
  CALLS_PER_MINUTE,
  parseStreamToJSON,
  uploadEntriesAsync,
} from '../../utils'

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
    BRAND_BUCKET,
    BRAND_TRANSLATION_UPLOAD,
    true
  )

  const updateRequests = allTranslationsMade
    ? [requestId, ...allTranslationsMade]
    : [requestId]

  await vbase.saveJSON<string[]>(
    BRAND_BUCKET,
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

  await vbase.saveJSON<UploadRequest>(BRAND_BUCKET, requestId, requestInfo)

  uploadEntriesAsync<BrandTranslationInput>(
    {
      entries: brandsParsed,
      requestId,
      locale,
      bucket: BRAND_BUCKET,
      translateEntry: catalogGQL?.translateBrand,
    },
    { vbase }
  )

  return requestId
}

const brandTranslationsUploadRequests = async (
  _root: unknown,
  _args: unknown,
  ctx: Context
) =>
  ctx.clients.vbase.getJSON<string[]>(
    BRAND_BUCKET,
    BRAND_TRANSLATION_UPLOAD,
    true
  )

export const mutations = { uploadBrandTranslations }

export const queries = {
  brandTranslationsUploadRequests,
}
