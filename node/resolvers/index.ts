import { Category, queries as categoryQueries } from './category'
import { Product, queries as productQueries } from './product'

export const queries = {
  ...categoryQueries,
  ...productQueries,
}

export const resolvers = {
  Category,
  Product,
}
