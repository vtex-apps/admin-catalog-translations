import {
  BUCKET_NAME,
  ALL_TRANSLATIONS_FILES,
  calculateExportProcessTime,
  CALLS_PER_MINUTE,
  saveTranslationsEntriesToVBase,
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
  const bucket = BUCKET_NAME
  const {
    clients: { catalog, catalogGQL, vbase, licenseManager },
    vtex: { adminUserAuthToken, requestId },
  } = ctx

  const {
    profile: { email },
  } = await licenseManager.getTopbarData(adminUserAuthToken as string)

  const { locale, categoryId } = args

  const productIdCollection = await catalog.getAllProducts(categoryId)

  const allTranslationRequest = await vbase.getJSON<string[]>(
    bucket,
    ALL_TRANSLATIONS_FILES,
    true
  )

  const updateRequests = allTranslationRequest
    ? [requestId, ...allTranslationRequest]
    : [requestId]

  await vbase.saveJSON<string[]>(bucket, ALL_TRANSLATIONS_FILES, updateRequests)

  const requestInfo: TranslationRequest<ProductTranslationResponse> = {
    requestId,
    requestedBy: email,
    categoryId,
    locale,
    createdAt: new Date(),
    estimatedTime: calculateExportProcessTime(
      productIdCollection.length,
      CALLS_PER_MINUTE
    ),
  }

  await vbase.saveJSON<TranslationRequest<ProductTranslationResponse>>(
    bucket,
    requestId,
    requestInfo
  )

  const params: ParamsTranslationsToVBase = {
    locale,
    requestId,
    bucket,
  }
  saveTranslationsEntriesToVBase<string, ProductTranslationResponse>(
    {
      entries: productIdCollection,
      params,
      getEntryTranslation: catalogGQL.getProductTranslation,
    },
    {
      catalogGQLClient: catalogGQL,
      vbase,
    }
  )

  return requestInfo
}

const productTranslationRequests = (
  _root: unknown,
  _args: unknown,
  ctx: Context
) => ctx.clients.vbase.getJSON(BUCKET_NAME, ALL_TRANSLATIONS_FILES, true)

const productTranslationRequestInfo = (
  _root: unknown,
  args: { requestId: string },
  ctx: Context
) => ctx.clients.vbase.getJSON(BUCKET_NAME, args.requestId)

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
  >(BUCKET_NAME, args.requestId, true)

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
