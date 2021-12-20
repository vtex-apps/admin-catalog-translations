export const Category = {
  locale: (
    _root: ResolvedPromise<CategoryTranslationResponse>,
    _args: unknown,
    ctx: Context
  ) => {
    return ctx.state.locale
  },
  name: (root: ResolvedPromise<CategoryTranslationResponse>) =>
    root.data.category.name,
  title: (root: ResolvedPromise<CategoryTranslationResponse>) =>
    root.data.category.title,
  description: (root: ResolvedPromise<CategoryTranslationResponse>) =>
    root.data.category.description,
  id: (root: ResolvedPromise<CategoryTranslationResponse>) =>
    root.data.category.id,
  linkId: (root: ResolvedPromise<CategoryTranslationResponse>) =>
    root.data.category.linkId,
}

const categoryTranslations = async (
  _root: unknown,
  args: { locale: string; active?: boolean },
  ctx: Context
) => {
  const {
    clients: { catalogGQL },
  } = ctx

  const { active, locale } = args

  ctx.state.locale = locale

  const ids = await catalogGQL.getCategories(active)

  const translationsP = []

  for (const { id } of ids) {
    const promise = catalogGQL.getCategoryTranslation(id, locale)
    translationsP.push(promise)
  }

  const translations = await Promise.all(translationsP)

  return translations
}

const getCategoriesName = async (
  _root: unknown,
  _args: unknown,
  ctx: Context
) => {
  const {
    clients: { catalogGQL },
  } = ctx

  return catalogGQL.getCategories(false)
}

export const queries = {
  categoryTranslations,
  getCategoriesName,
}
