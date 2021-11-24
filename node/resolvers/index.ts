import { Category, queries as categoryQueries } from './category'
import { Collection, queries as collectionQueries } from './collection'
import {
  Product,
  queries as productQueries,
  mutations as productMutations,
} from './product'
import { SKU, queries as skuQueries } from './SKU'

export const queries = {
  ...categoryQueries,
  ...productQueries,
  ...skuQueries,
  ...collectionQueries,
}

export const resolvers = {
  Category,
  Product,
  SKU,
  Collection,
}

export const mutations = {
  ...productMutations,
}
