import {
  mutations as uploadMutations,
  queries as uploadQueries,
} from './upload'

export const Brand = {
  locale: (
    _root: ResolvedPromise<BrandTranslationResponse>,
    _args: unknown,
    ctx: Context
  ) => {
    return ctx.state.locale
  },
  id: (root: ResolvedPromise<BrandTranslationResponse>) => root.data.brand.id,
  name: (root: ResolvedPromise<BrandTranslationResponse>) =>
    root.data.brand.name,
  text: (root: ResolvedPromise<BrandTranslationResponse>) =>
    root.data.brand.text,
  siteTitle: (root: ResolvedPromise<BrandTranslationResponse>) =>
    root.data.brand.siteTitle,
  active: (root: ResolvedPromise<BrandTranslationResponse>) =>
    root.data.brand.active,
}

const brandTranslations = async (
  _root: unknown,
  args: { locale: string; active?: boolean },
  ctx: Context
) => {
  const {
    clients: { catalogGQL },
  } = ctx

  const { active, locale } = args

  ctx.state.locale = locale

  const brands = await catalogGQL.getBrands(active)
  const translationsP = []

  for (const { id } of brands) {
    const promise = catalogGQL.getBrandTranslation(id, locale)
    translationsP.push(promise)
  }

  const translations = await Promise.all(translationsP)

  return translations
}

export const queries = {
  brandTranslations,
  ...uploadQueries,
}

export const mutations = {
  ...uploadMutations,
}
