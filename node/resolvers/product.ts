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
}

const productTranslations = async (
  _root: unknown,
  args: { locale: string; categoryId: string },
  ctx: Context
) => {
  const {
    clients: { catalog, catalogGQL },
  } = ctx

  const { locale, categoryId } = args

  ctx.state.locale = locale

  const productIdCollection = await catalog.getAllProducts(categoryId)

  const productTranslationPromises = []

  for (const productId of productIdCollection) {
    const translationPromise = catalogGQL.getProductTranslation(productId)
    productTranslationPromises.push(translationPromise)
  }

  return productTranslationPromises
}

export const queries = {
  productTranslations,
}
