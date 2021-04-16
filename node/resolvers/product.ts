export const productTranslations = async (
  _root: unknown,
  args: { locale: string; categoryId: string },
  ctx: Context
) => {
  const {
    clients: { catalog },
  } = ctx

  const { locale, categoryId } = args

  ctx.state.locale = locale

  const productIdCollection = catalog.getAllProducts(categoryId)

  return productIdCollection
}
