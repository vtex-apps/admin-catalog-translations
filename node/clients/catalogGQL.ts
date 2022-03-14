import { AppGraphQLClient, InstanceOptions, IOContext } from '@vtex/api'

import { statusToError } from '../utils'
import {
  CATEGORIES_QUERY,
  GET_CATEGORY_TRANSLATION_QUERY,
  TRANSLATE_CATEGORY,
  GET_PRODUCT_TRANSLATION_QUERY,
  GET_SKU_TRANSLATION_QUERY,
  TRANSLATE_PRODUCT,
  BRAND_QUERY,
  TRANSLATE_BRAND,
  GET_FIELD_TRANSLATION_QUERY,
  TRANSLATE_FIELD,
  COLLECTIONS_QUERY,
  GET_COLLECTION_TRANSLATION_QUERY,
} from './utils/catalogGQLQueries'

const CATALOG_GRAPHQL_APP = 'vtex.catalog-graphql@1.x'

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

  public translateCategory = <T>(params: TranslateEntry<T>) => {
    const { entry: category, locale } = params
    return this.graphql.query({
      query: TRANSLATE_CATEGORY,
      variables: {
        category,
        locale,
      },
    })
  }

  public getProductTranslation = <T>(params: TranslateEntry<T>) => {
    const { entry: id, locale } = params
    return this.graphql.query<
      ProductTranslationResponse,
      { identifier: { value: T; field: 'id' } }
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
  }

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

  public translateProduct = <T>(params: TranslateEntry<T>) => {
    const { entry: product, locale } = params
    return this.graphql.query({
      query: TRANSLATE_PRODUCT,
      variables: {
        product,
        locale,
      },
    })
  }

  private getBrandsPerPage = ({ page }: { page: number }) =>
    this.graphql.query<BrandResponse, { page: number }>({
      query: BRAND_QUERY,
      variables: {
        page,
      },
    })

  private filterAndBuildItemsTranslation = (
    items: Brand[],
    active: boolean
  ) => {
    const filterItems = []
    if (items?.length > 0) {
      for (const a in items) {
        if (!active || active === items[a]?.active) {
          filterItems.push({
            data: {
              brand: items[a],
            },
          })
        }
      }
    }
    return filterItems
  }

  public getBrands = async (active = true) => {
    try {
      const response = await this.getBrandsPerPage({ page: 1 })
      const {
        items,
        paging: { pages },
      } = (response.data as BrandResponse).brands
      const responsePromises = []

      for (let i = 2; i <= pages; i++) {
        const promise = this.getBrandsPerPage({ page: i })
        responsePromises.push(promise)
      }

      const resolvedPromises = await Promise.all(responsePromises)

      let translations = [
        ...this.filterAndBuildItemsTranslation(items ?? [], active),
      ]
      for (const i in resolvedPromises) {
        const { data } = resolvedPromises[i]
        translations = [
          ...translations,
          ...this.filterAndBuildItemsTranslation(
            data?.brands?.items ?? [],
            active
          ),
        ]
      }

      return translations
    } catch (error) {
      return statusToError(error)
    }
  }

  public translateBrand = <T>(params: TranslateEntry<T>) => {
    const { entry: brand, locale } = params
    return this.graphql.query({
      query: TRANSLATE_BRAND,
      variables: {
        brand,
        locale,
      },
    })
  }

  public getFields = async (fields: FieldTranslationInput[]) => {
    try {
      return [`fields${fields.length}`]
    } catch (error) {
      return statusToError(error)
    }
  }

  public getFieldTranslation = <T>(params: TranslateEntry<T>) => {
    const { entry: id, locale } = params
    return this.graphql.query<FieldTranslationResponse, { id: T }>(
      {
        query: GET_FIELD_TRANSLATION_QUERY,
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

  public translateField = <T>(params: TranslateEntry<T>) => {
    const { entry: field, locale } = params
    return this.graphql.query({
      query: TRANSLATE_FIELD,
      variables: {
        field,
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

  private getCollectionsPerPage = ({ page }: { page: number }) =>
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
