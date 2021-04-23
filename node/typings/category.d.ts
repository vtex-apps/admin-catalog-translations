interface CategoryIdsResponse {
  categories: {
    items: Array<{ id: string }>
    paging: {
      pages: number
    }
  }
}

interface TranslationResponse {
  category: {
    id: string
    name: string
    title: string
    description: string
  }
}

interface ResolvedPromise<Response> {
  data: Response
}
