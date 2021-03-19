export const Category = {
  locale: (_root: unknown, _args: unknown, ctx: Context) => {
    return ctx.state.locale
  },
  name: (_root: { id: string }, _args: unknown) => {
    return `name-${_root.id}`
  },
  title: (_root: { id: string }, _args: unknown) => {
    return `title-${_root.id}`
  },
  description: (_root: { id: string }, _args: unknown) => {
    return `description-${_root.id}`
  },
}

const categoryTranslations = (
  _root: unknown,
  args: { locale: string; active?: boolean },
  ctx: Context
) => {
  const {
    clients: { catalog },
  } = ctx

  ctx.state.locale = args.locale

  return catalog.getCategoriesId()
}

export const queries = {
  categoryTranslations,
}
