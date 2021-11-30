import { Category, queries as categoryQueries } from './category'
import {
  Product,
  queries as productQueries,
  mutations as productMutations,
} from './product'
import { SKU, queries as skuQueries } from './SKU'
import {
  queries as fieldsQueries
}
from './field'

export const queries = {
  ...categoryQueries,
  ...productQueries,
  ...skuQueries,
  ...fieldsQueries
}

export const resolvers = {
  Category,
  Product,
  SKU,
}

export const mutations = {
  ...productMutations,
}
