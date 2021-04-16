import { statusToError } from '../utils'

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
}

const categoryTranslations = async (
  _root: unknown,
  args: { locale: string; active?: boolean },
  ctx: Context
) => {
  const {
    clients: { catalogGQL },
  } = ctx

  const { active } = args

  ctx.state.locale = args.locale

  try {
    const ids = await catalogGQL.getCategories(active)

    const translationsP = []

    for (const { id } of ids) {
      const promise = catalogGQL.getCategoryTranslation(id)
      translationsP.push(promise)
    }

    return translationsP
  } catch (error) {
    return statusToError(error)
  }
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
