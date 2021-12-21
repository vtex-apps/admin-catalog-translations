import { ReadStream } from 'fs'

import {
  BRAND_NAME,
  BRAND_TRANSLATION_UPLOAD,
  uploadTranslations,
} from '../../utils'

const uploadBrandTranslations = async (
  _root: unknown,
  { brands, locale }: { brands: UploadFile<ReadStream>; locale: string },
  ctx: Context
) => {
  const params: UploadTranslations<BrandTranslationInput> = {
    entries: brands,
    locale,
    bucket: BRAND_NAME,
    path: BRAND_TRANSLATION_UPLOAD,
    translateEntry: ctx?.clients?.catalogGQL?.translateBrand,
  }
  return uploadTranslations(params, ctx)
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

export const mutations = { uploadBrandTranslations }

export const queries = {
  brandTranslationsUploadRequests,
}
