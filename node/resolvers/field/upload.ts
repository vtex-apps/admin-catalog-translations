import { ReadStream } from 'fs'

import {
  FIELD_BUCKET,
  FIELD_TRANSLATION_EXPORT_UPLOAD,
  parseStreamToJSON,
  uploadTranslations,
  FIELD_TRANSLATION_IMPORT_UPLOAD,
  entryTranslations,
} from '../../utils'

const fieldTranslations = async (
  _root: unknown,
  { fields, locale }: { fields: UploadFile<ReadStream>; locale: string },
  ctx: Context
) => {
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

  const params: EntryTranslations<string> = {
    entries: entryIdCollection,
    requestId: ctx?.vtex?.requestId,
    locale,
    bucket: FIELD_BUCKET,
    path: FIELD_TRANSLATION_EXPORT_UPLOAD,
    translateEntry: ctx?.clients?.catalogGQL.getFieldTranslation,
  }
  return entryTranslations<string, FieldTranslationResponse>(params, ctx)
}

const fieldTranslationsRequests = async (
  _root: unknown,
  _args: unknown,
  ctx: Context
) =>
  ctx.clients.vbase.getJSON<string[]>(
    FIELD_BUCKET,
    FIELD_TRANSLATION_EXPORT_UPLOAD,
    true
  )

const uploadFieldTranslationsImport = async (
  _root: unknown,
  { fields, locale }: { fields: UploadFile<ReadStream>; locale: string },
  ctx: Context
) => {
  const params: UploadTranslations<FieldTranslationInput> = {
    entries: fields,
    locale,
    bucket: FIELD_BUCKET,
    path: FIELD_TRANSLATION_IMPORT_UPLOAD,
    translateEntry: ctx?.clients?.catalogGQL?.translateField,
  }
  return uploadTranslations(params, ctx)
}

const fieldTranslationsUploadRequests = async (
  _root: unknown,
  _args: unknown,
  ctx: Context
) =>
  ctx.clients.vbase.getJSON<string[]>(
    FIELD_BUCKET,
    FIELD_TRANSLATION_IMPORT_UPLOAD,
    true
  )

export const mutations = {
  uploadFieldTranslationsImport,
}

export const queries = {
  fieldTranslations,
  fieldTranslationsRequests,
  fieldTranslationsUploadRequests,
}
