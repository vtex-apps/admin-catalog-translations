export const Brand = {
  locale: (
    _root: ResolvedPromise<BrandTranslationResponse>,
    _args: unknown,
    ctx: Context
  ) => {
    return ctx.state.locale
  },
  id: (root: ResolvedPromise<BrandTranslationResponse>) =>
    root.data.brand.id,
  name: (root: ResolvedPromise<BrandTranslationResponse>) =>
    root.data.brand.name,
  imageUrl: (root: ResolvedPromise<BrandTranslationResponse>) =>
  root.data.brand.imageUrl,
  isActive: (root: ResolvedPromise<BrandTranslationResponse>) =>
    root.data.brand.isActive,
  title: (root: ResolvedPromise<BrandTranslationResponse>) =>
    root.data.brand.title,
  metaTagDescription: (root: ResolvedPromise<BrandTranslationResponse>) =>
    root.data.brand.metaTagDescription,
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
  const translations = await catalogGQL.getBrands(active ?? false)
  return translations
}

export const queries = {
  brandTranslations
}
