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

const PRODUCT_LIMIT = 1600

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

  let counter = 0

  for (const productId of productIdCollection) {
    // Getting a 429 when products list > 2k. Setting threshold a little below it to ensure it works
    if (counter === PRODUCT_LIMIT) {
      break
    }
    const translationPromise = catalogGQL.getProductTranslation(
      productId,
      locale
    )
    productTranslationPromises.push(translationPromise)
    counter++
  }
  return productTranslationPromises
}

export const queries = {
  productTranslations,
}
