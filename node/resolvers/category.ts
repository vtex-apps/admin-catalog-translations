const fakeData = [
  {
    id: 1,
    name: 'name-category1',
    title: 'title-category1',
    description: 'desc-category1',
  },
  {
    id: 2,
    name: 'name-category2',
    title: 'title-category2',
    description: 'desc-category2',
  },
  {
    id: 3,
    name: 'name-category3',
    title: 'title-category3',
    description: 'desc-category3',
  },
]

export const Category = {
  locale: (_root: unknown, _args: unknown, ctx: Context) => {
    return ctx.state.locale
  },
}

const categoryTranslations = (
  _root: unknown,
  args: { locale: string; active?: boolean },
  ctx: Context
) => {
  ctx.state.locale = args.locale

  return fakeData
}

export const queries = {
  categoryTranslations,
}
