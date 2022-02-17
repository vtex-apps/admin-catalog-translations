import { Category, queries as categoryQueries } from './category'
import {
  Collection,
  queries as collectionQueries,
  mutations as collectionMutations,
} from './collection'
import {
  Product,
  queries as productQueries,
  mutations as productMutations,
} from './product'
import { SKU, queries as skuQueries } from './sku'
import {
  Brand,
  queries as brandQueries,
  mutations as brandMutations,
} from './brand'
import {
  Field,
  queries as fieldsQueries,
  mutations as fieldMutations,
} from './field'
import { queries as translationUploadRequestInfo } from './translation'

export const queries = {
  ...categoryQueries,
  ...productQueries,
  ...skuQueries,
  ...brandQueries,
  ...translationUploadRequestInfo,
  ...collectionQueries,
  ...fieldsQueries,
}

export const resolvers = {
  Category,
  Product,
  SKU,
  Brand,
  Collection,
  Field,
}

export const mutations = {
  ...productMutations,
  ...brandMutations,
  ...collectionMutations,
  ...fieldMutations,
}
