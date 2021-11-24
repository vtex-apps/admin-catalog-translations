import { AppGraphQLClient, InstanceOptions, IOContext } from '@vtex/api'

import { statusToError } from '../utils'

const CATALOG_GRAPHQL_APP = 'vtex.catalog-graphql@1.x'

const CATEGORIES_QUERY = `
  query GetCategories ($active: Boolean, $page: Int!) {
    categories(term:"*", page: $page, pageSize: 50, active: $active) {
      items {
        id
        name
      }
      paging {
        pages
      }
    }
  }
`

const GET_CATEGORY_TRANSLATION_QUERY = `
  query getTranslation($id:ID!) {
    category(id: $id) {
      id
      name
      title
      description
      linkId
    }
  }
`

const GET_PRODUCT_TRANSLATION_QUERY = `
  query getProductTranslation($identifier: ProductUniqueIdentifier) {
    product(identifier: $identifier) {
      id
      name
      description
      shortDescription
      title
      linkId
    }
  }
`

const GET_SKU_TRANSLATION_QUERY = `
  query getSKUTranslation($identifier: SKUUniqueIdentifier) {
    sku(identifier: $identifier) {
      id
      name
    }
  }
`

const TRANSLATE_PRODUCT = `mutation translateProduct($product:ProductInputTranslation!, $locale: Locale!) {
  translateProduct(product: $product, locale: $locale)
}`

const COLLECTIONS_QUERY = `
  query GetCollections ($page: Int!) {
    collections(searchKey:"", page: $page, pageSize: 50) {
      items {
        id
        name
        status
      }
      paging {
        pages
      }
    }
  }
`

const GET_COLLECTION_TRANSLATION_QUERY = `
  query getTranslation($id:ID!) {
    collection(id: $id) {
      id
      name
      description
      status
    }
  }
`

export class CatalogGQL extends AppGraphQLClient {
  constructor(ctx: IOContext, opts?: InstanceOptions) {
    super(CATALOG_GRAPHQL_APP, ctx, opts)
  }

  public getCategories = async (active = true) => {
    try {
      const response = await this.getCategoriesPerPage({ active, page: 1 })
      const {
        items,
        paging: { pages },
      } = (response.data as CategoryResponse).categories
      const collectItems = items
      const responsePromises = []

      for (let i = 2; i <= pages; i++) {
        const promise = this.getCategoriesPerPage({ active, page: i })
        responsePromises.push(promise)
      }

      const resolvedPromises = await Promise.all(responsePromises)

      const flattenResponse = resolvedPromises.reduce((acc, curr) => {
        return [...acc, ...(curr.data as CategoryResponse).categories.items]
      }, collectItems)

      return flattenResponse
    } catch (error) {
      return statusToError(error)
    }
  }

  private getCategoriesPerPage = ({
    active = true,
    page,
  }: {
    active: boolean
    page: number
  }) =>
    this.graphql.query<CategoryResponse, { active: boolean; page: number }>({
      query: CATEGORIES_QUERY,
      variables: {
        active,
        page,
      },
    })

  public getCategoryTranslation = (id: string, locale: string) => {
    return this.graphql.query<CategoryTranslationResponse, { id: string }>(
      {
        query: GET_CATEGORY_TRANSLATION_QUERY,
        variables: {
          id,
        },
      },
      {
        headers: {
          'x-vtex-locale': `${locale}`,
        },
      }
    )
  }

  public getProductTranslation = (id: string, locale: string) =>
    this.graphql.query<
      ProductTranslationResponse,
      { identifier: { value: string; field: 'id' } }
    >(
      {
        query: GET_PRODUCT_TRANSLATION_QUERY,
        variables: {
          identifier: {
            field: 'id',
            value: id,
          },
        },
      },
      {
        headers: {
          'x-vtex-locale': `${locale}`,
        },
      }
    )

  public getSKUTranslation = (id: string, locale: string) =>
    this.graphql.query<
      SKUTranslationsResponse,
      { identifier: { value: string; field: 'id' } }
    >(
      {
        query: GET_SKU_TRANSLATION_QUERY,
        variables: {
          identifier: {
            field: 'id',
            value: id,
          },
        },
      },
      {
        headers: {
          'x-vtex-locale': `${locale}`,
        },
      }
    )

  public translateProduct = (
    translateProduct: ProductTranslationInput,
    locale: string
  ) => {
    return this.graphql.query({
      query: TRANSLATE_PRODUCT,
      variables: {
        product: translateProduct,
        locale,
      },
    })
  }

  public getCollections = async () => {
    try {
      const response = await this.getCollectionsPerPage({ page: 1 })
      const {
        items,
        paging: { pages },
      } = (response.data as CollectionResponse).collections
      const collectItems = items
      const responsePromises = []

      for (let i = 2; i <= pages; i++) {
        const promise = this.getCollectionsPerPage({ page: i })
        responsePromises.push(promise)
      }

      const resolvedPromises = await Promise.all(responsePromises)

      const flattenResponse = resolvedPromises.reduce((acc, curr) => {
        return [...acc, ...(curr.data as CollectionResponse).collections.items]
      }, collectItems)

      return flattenResponse
    } catch (error) {
      return statusToError(error)
    }
  }

  private getCollectionsPerPage = ({
    page,
  }: {
    page: number
  }) =>
    this.graphql.query<CollectionResponse, { page: number }>({
      query: COLLECTIONS_QUERY,
      variables: {
        page,
      },
    })

  public getCollectionTranslation = (id: string, locale: string) => {
    return this.graphql.query<CollectionTranslationResponse, { id: string }>(
      {
        query: GET_COLLECTION_TRANSLATION_QUERY,
        variables: {
          id,
        },
      },
      {
        headers: {
          'x-vtex-locale': `${locale}`,
        },
      }
    )
  }
}
