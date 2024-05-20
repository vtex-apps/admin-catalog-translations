import { ReadStream } from 'fs'

import {
  SKU_BUCKET,
  SKU_TRANSLATION_UPLOAD,
  uploadTranslations,
} from '../../utils'

const uploadSkuTranslations = async (
  _root: unknown,
  { skus, locale }: { skus: UploadFile<ReadStream>; locale: string },
  ctx: Context
) => {
  const params: UploadTranslations<SkuTranslationInput> = {
    entries: skus,
    locale,
    bucket: SKU_BUCKET,
    path: SKU_TRANSLATION_UPLOAD,
    translateEntry: ctx?.clients?.catalogGQL?.translateSku,
  }

  return uploadTranslations(params, ctx)
}

const skuTranslationsUploadRequests = async (
  _root: unknown,
  _args: unknown,
  ctx: Context
) =>
  ctx.clients.vbase.getJSON<string[]>(
    SKU_BUCKET,
    SKU_TRANSLATION_UPLOAD,
    true
  )

export const mutations = { uploadSkuTranslations }

export const queries = {
  skuTranslationsUploadRequests,
}
