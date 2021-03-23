import { AppGraphQLClient, InstanceOptions, IOContext } from '@vtex/api'

const CATALOG_GRAPHQL_APP = 'vtex.catalog-graphql@1.x'

const CATEGORIES_QUERY = `
  query GetCategoriesId ($active: Boolean, $page: Int!) {
    categories(term:"*", page: $page, pageSize: 50, active: $active) {
      items {
        id
      }
      paging {
        pages
      }
    }
  }
`

const GET_TRANSLATION_QUERY = `
  query getTranslation($id:ID!) {
    category(id: $id) {
      id
      name
      title
      description
    }
  }
`

export class Catalog extends AppGraphQLClient {
  constructor(ctx: IOContext, opts?: InstanceOptions) {
    super(CATALOG_GRAPHQL_APP, ctx, opts)
  }

  public getCategoriesId = async (active = true) => {
    const response = await this.getCategoriesIdPerPage({ active, page: 1 })
    const {
      items,
      paging: { pages },
    } = (response.data as CategoryIdsResponse).categories

    const collectItems = items
    const responsePromises = []

    for (let i = 2; i <= pages; i++) {
      const promise = this.getCategoriesIdPerPage({ active, page: i })
      responsePromises.push(promise)
    }

    const resolvedPromises = await Promise.all(responsePromises)

    const flattenResponse = resolvedPromises.reduce((acc, curr) => {
      return [...acc, ...(curr.data as CategoryIdsResponse).categories.items]
    }, collectItems)

    return flattenResponse
  }

  private getCategoriesIdPerPage = ({
    active = true,
    page,
  }: {
    active: boolean
    page: number
  }) =>
    this.graphql.query<CategoryIdsResponse, { active: boolean; page: number }>({
      query: CATEGORIES_QUERY,
      variables: {
        active,
        page,
      },
    })

  public getTranslation = (id: string) =>
    this.graphql.query<TranslationResponse, { id: string }>({
      query: GET_TRANSLATION_QUERY,
      variables: {
        id,
      },
    })
}
