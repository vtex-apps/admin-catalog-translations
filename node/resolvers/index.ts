import { Category, queries as categoryQueries } from './category'
import { Product, queries as productQueries } from './product'
import { SKU, queries as skuQueries } from './SKU'

export const queries = {
  ...categoryQueries,
  ...productQueries,
  ...skuQueries,
}

export const resolvers = {
  Category,
  Product,
  SKU,
}
