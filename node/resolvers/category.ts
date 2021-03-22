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

  ctx.state.locale = args.locale

  const ids = await catalog.getCategoriesId()

  const translationsP = []

  for (const { id } of ids) {
    const promise = catalog.getTranslation(id)
    translationsP.push(promise)
  }

  return translationsP
}

export const queries = {
  categoryTranslations,
}
