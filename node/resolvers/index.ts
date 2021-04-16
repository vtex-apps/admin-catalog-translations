import { Category, queries as categoryQueries } from './category'
import { queries as productQueries } from './product'

export const queries = {
  ...categoryQueries,
  ...productQueries,
}

export const resolvers = {
  Category,
}
