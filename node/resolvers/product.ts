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

// const sleep = () =>
//   new Promise((resolve) => {
//     setTimeout(() => {
//       resolve('done')
//     }, 40)
//   })

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
    if (counter === 2000) {
      break
    }
    const translationPromise = catalogGQL.getProductTranslation(productId)
    productTranslationPromises.push(translationPromise)
    counter++
    // eslint-disable-next-line no-await-in-loop
    // await sleep()
  }
  return productTranslationPromises
}

export const queries = {
  productTranslations,
}
