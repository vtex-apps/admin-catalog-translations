import { ReadStream } from 'fs'

import {
  CATEGORY_NAME,
  calculateExportProcessTime,
  CATEGORY_TRANSLATION_UPLOAD,
  CALLS_PER_MINUTE,
  parseStreamToJSON,
  uploadEntriesAsync,
} from '../../utils'

const uploadCategoryTranslations = async (
  _root: unknown,
  {
    categories,
    locale,
  }: { categories: UploadFile<ReadStream>; locale: string },
  ctx: Context
) => {
  const {
    clients: { catalogGQL, licenseManager, vbase },
    vtex: { adminUserAuthToken, requestId },
  } = ctx

  const { createReadStream } = await categories

  const categoryStream = createReadStream()

  const categoriesParsed = await parseStreamToJSON<CategoryTranslationInput>(
    categoryStream
  )

  const {
    profile: { email },
  } = await licenseManager.getTopbarData(adminUserAuthToken as string)

  const allTranslationsMade = await vbase.getJSON<string[]>(
    CATEGORY_NAME,
    CATEGORY_TRANSLATION_UPLOAD,
    true
  )

  const updateRequests = allTranslationsMade
    ? [requestId, ...allTranslationsMade]
    : [requestId]

  await vbase.saveJSON<string[]>(
    CATEGORY_NAME,
    CATEGORY_TRANSLATION_UPLOAD,
    updateRequests
  )

  const requestInfo = {
    requestId,
    locale,
    translatedBy: email,
    createdAt: new Date(),
    estimatedTime: calculateExportProcessTime(
      categoriesParsed.length,
      CALLS_PER_MINUTE
    ),
  }

  await vbase.saveJSON<UploadRequest>(CATEGORY_NAME, requestId, requestInfo)

  uploadEntriesAsync<CategoryTranslationInput>(
    {
      entries: categoriesParsed,
      requestId,
      locale,
      bucket: CATEGORY_NAME,
      translateEntry: catalogGQL?.translateCategory,
    },
    { vbase }
  )

  return requestId
}

const categoryTranslationsUploadRequests = async (
  _root: unknown,
  _args: unknown,
  ctx: Context
) =>
  ctx.clients.vbase.getJSON<string[]>(
    CATEGORY_NAME,
    CATEGORY_TRANSLATION_UPLOAD,
    true
  )

export const mutations = {
  uploadCategoryTranslations,
}

export const queries = {
  categoryTranslationsUploadRequests,
}
