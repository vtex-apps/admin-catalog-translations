import {
  PRODUCT_BUCKET,
  ALL_TRANSLATIONS_FILES,
  entryTranslations,
} from '../../utils'
import {
  mutations as uploadMutations,
  queries as uploadQueries,
} from './upload'

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

const productTranslations = async (
  _root: unknown,
  args: { locale: string; categoryId: string },
  ctx: Context
) => {
  const {
    clients: { catalog, catalogGQL },
    vtex: { requestId },
  } = ctx

  const { locale, categoryId } = args

  const productIdCollection = await catalog.getAllProducts(categoryId)

  const params: EntryTranslations<string> = {
    entries: productIdCollection,
    requestId,
    categoryId,
    locale,
    bucket: PRODUCT_BUCKET,
    path: ALL_TRANSLATIONS_FILES,
    translateEntry: catalogGQL.getProductTranslation,
  }
  return entryTranslations<string, ProductTranslationResponse>(params, ctx)
}

const productTranslationRequests = (
  _root: unknown,
  _args: unknown,
  ctx: Context
) => ctx.clients.vbase.getJSON(PRODUCT_BUCKET, ALL_TRANSLATIONS_FILES, true)

const productTranslationRequestInfo = (
  _root: unknown,
  args: { requestId: string },
  ctx: Context
) => ctx.clients.vbase.getJSON(PRODUCT_BUCKET, args.requestId)

const downloadProductTranslation = async (
  _root: unknown,
  args: { requestId: string },
  ctx: Context
) => {
  const {
    clients: { vbase },
  } = ctx

  const { translations, locale } = await vbase.getJSON<
    TranslationRequest<ProductTranslationResponse>
  >(PRODUCT_BUCKET, args.requestId, true)

  ctx.state.locale = locale

  return translations
}

export const mutations = {
  ...uploadMutations,
}

export const queries = {
  productTranslations,
  productTranslationRequests,
  productTranslationRequestInfo,
  downloadProductTranslation,
  ...uploadQueries,
}
