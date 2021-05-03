import { VBase } from '@vtex/api'

import { CatalogGQL } from '../clients/catalogGQL'

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
  linkId: (root: ResolvedPromise<ProductTranslationResponse>) =>
    root.data.product.linkId,
}

const CALLS_PER_MINUTE = 1600
const ONE_MINUTE = 60 * 1000

const pacer = () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve('done')
    }, ONE_MINUTE / CALLS_PER_MINUTE)
  })

const saveTranslation = async (
  productIds: string[],
  locale: string,
  { catalogGQLClient, _vbase }: { catalogGQLClient: CatalogGQL; _vbase: VBase }
): Promise<void> => {
  // eslint-disable-next-line no-console
  console.log(_vbase)
  const productTranslationPromises = []
  for (const productId of productIds) {
    const translationPromise = catalogGQLClient.getProductTranslation(
      productId,
      locale
    )
    productTranslationPromises.push(translationPromise)
    // eslint-disable-next-line no-await-in-loop
    await pacer()
  }

  const resolvedP = await Promise.all(productTranslationPromises)
  // eslint-disable-next-line no-console
  console.log(resolvedP.length)
}

const productTranslations = async (
  _root: unknown,
  args: { locale: string; categoryId: string },
  ctx: Context
) => {
  const {
    clients: { catalog, catalogGQL, vbase },
  } = ctx

  const { locale, categoryId } = args

  ctx.state.locale = locale

  const productIdCollection = await catalog.getAllProducts(categoryId)

  saveTranslation(productIdCollection, locale, {
    catalogGQLClient: catalogGQL,
    _vbase: vbase,
  })

  return true
}

export const queries = {
  productTranslations,
}
