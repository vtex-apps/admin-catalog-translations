import { ReadStream } from 'fs'

import {
  FIELD_NAME,
  calculateExportProcessTime,
  FIELD_TRANSLATION_UPLOAD,
  CALLS_PER_MINUTE,
  parseStreamToJSON,
  saveTranslationsEntriesToVBase,
} from '../../utils'

const uploadFieldTranslationsExport = async (
  _root: unknown,
  { fields, locale }: { fields: UploadFile<ReadStream>; locale: string },
  ctx: Context
) => {
  const bucket = FIELD_NAME
  const path = FIELD_TRANSLATION_UPLOAD
  const {
    clients: { catalogGQL, vbase, licenseManager },
    vtex: { adminUserAuthToken, requestId },
  } = ctx

  const {
    profile: { email },
  } = await licenseManager.getTopbarData(adminUserAuthToken as string)

  const { createReadStream } = await fields
  const fieldStream = createReadStream()
  const fieldsParsed = await parseStreamToJSON<FieldTranslationInput>(
    fieldStream
  )

  let entryIdCollection: string[] = []
  for (let i = 0; i < fieldsParsed?.length; i++) {
    if (fieldsParsed) {
      entryIdCollection = [...entryIdCollection, fieldsParsed[i].fieldId]
    }
  }

  const allTranslationRequest = await vbase.getJSON<string[]>(
    bucket,
    path,
    true
  )

  const updateRequests = allTranslationRequest
    ? [requestId, ...allTranslationRequest]
    : [requestId]

  await vbase.saveJSON<string[]>(bucket, path, updateRequests)

  const requestInfo: TranslationRequest<Field> = {
    requestId,
    requestedBy: email,
    locale,
    createdAt: new Date(),
    estimatedTime: calculateExportProcessTime(
      entryIdCollection.length,
      CALLS_PER_MINUTE
    ),
  }

  await vbase.saveJSON<TranslationRequest<Field>>(
    bucket,
    requestId,
    requestInfo
  )

  const params: ParamsTranslationsToVBase = {
    locale,
    requestId,
    bucket,
  }

  saveTranslationsEntriesToVBase<string, FieldTranslationResponse>(
    {
      entries: entryIdCollection,
      params,
      getEntryTranslation: catalogGQL.getFieldTranslation,
    },
    {
      catalogGQLClient: catalogGQL,
      vbase,
    }
  )

  return requestInfo
}

const uploadSpecificationTranslationsImport = async (
  _root: unknown,
  { fields, locale }: { fields: UploadFile<ReadStream>; locale: string },
  ctx: Context
) => {
  const {
    clients: { licenseManager, vbase },
    vtex: { adminUserAuthToken, requestId },
  } = ctx

  const { createReadStream } = await fields

  const fieldStream = createReadStream()

  const fieldsParsed = await parseStreamToJSON<FieldTranslationInput>(
    fieldStream
  )

  const {
    profile: { email },
  } = await licenseManager.getTopbarData(adminUserAuthToken as string)

  const allTranslationsMade = await vbase.getJSON<string[]>(
    FIELD_NAME,
    FIELD_TRANSLATION_UPLOAD,
    true
  )

  const updateRequests = allTranslationsMade
    ? [requestId, ...allTranslationsMade]
    : [requestId]

  await vbase.saveJSON<string[]>(
    FIELD_NAME,
    FIELD_TRANSLATION_UPLOAD,
    updateRequests
  )

  const requestInfo = {
    requestId,
    locale,
    translatedBy: email,
    createdAt: new Date(),
    estimatedTime: calculateExportProcessTime(
      fieldsParsed.length,
      CALLS_PER_MINUTE
    ),
  }

  await vbase.saveJSON<UploadRequest>(FIELD_NAME, requestId, requestInfo)

  // uploadEntriesAsync<FieldTranslationInput>(
  //   {
  //     entries: fieldsParsed,
  //     requestId,
  //     locale,
  //     bucket: FIELD_NAME,
  //     translateEntry: catalogGQL?.getFieldTranslation,
  //   },
  //   { vbase }
  // )

  return requestId
}

const fieldTranslationsUploadRequests = async (
  _root: unknown,
  _args: unknown,
  ctx: Context
) =>
  ctx.clients.vbase.getJSON<string[]>(
    FIELD_NAME,
    FIELD_TRANSLATION_UPLOAD,
    true
  )

export const mutations = {
  uploadSpecificationTranslationsImport,
}

export const queries = {
  uploadFieldTranslationsExport,
  fieldTranslationsUploadRequests,
}
