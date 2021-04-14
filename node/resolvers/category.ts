import { statusToError } from '../utils'

export const Category = {
  locale: (
    _root: ResolvedPromise<TranslationResponse>,
    _args: unknown,
    ctx: Context
  ) => {
    return ctx.state.locale
  },
  name: (root: ResolvedPromise<TranslationResponse>) => root.data.category.name,
  title: (root: ResolvedPromise<TranslationResponse>) =>
    root.data.category.title,
  description: (root: ResolvedPromise<TranslationResponse>) =>
    root.data.category.description,
  id: (root: ResolvedPromise<TranslationResponse>) => root.data.category.id,
}

const categoryTranslations = async (
  _root: unknown,
  args: { locale: string; active?: boolean },
  ctx: Context
) => {
  const {
    clients: { catalog },
  } = ctx

  const { active } = args

  ctx.state.locale = args.locale

  try {
    const ids = await catalog.getCategories(active)

    const translationsP = []

    for (const { id } of ids) {
      const promise = catalog.getTranslation(id)
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
    // @ts-
    clients: { catalog },
  } = ctx

  return catalog.getCategories(false)
}

export const queries = {
  categoryTranslations,
  getCategoriesName,
}
