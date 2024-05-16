import { ReadStream } from 'fs'

import {
  PRODUCT_BUCKET,
  PRODUCT_TRANSLATION_UPLOAD,
  uploadTranslations,
} from '../../utils'

const uploadProductTranslations = async (
  _root: unknown,
  { products, locale }: { products: UploadFile<ReadStream>; locale: string },
  ctx: Context
) => {
  const params: UploadTranslations<ProductTranslationInput> = {
    entries: products,
    locale,
    bucket: PRODUCT_BUCKET,
    path: PRODUCT_TRANSLATION_UPLOAD,
    translateEntry: ctx?.clients?.catalogGQL?.translateProduct,
  }

  return uploadTranslations(params, ctx)
}

const productTranslationsUploadRequests = async (
  _root: unknown,
  _args: unknown,
  ctx: Context
) =>
  ctx.clients.vbase.getJSON<string[]>(
    PRODUCT_BUCKET,
    PRODUCT_TRANSLATION_UPLOAD,
    true
  )

export const mutations = { uploadProductTranslations }

export const queries = {
  productTranslationsUploadRequests,
}
