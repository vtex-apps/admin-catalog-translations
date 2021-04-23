interface CategoryResponse {
  categories: {
    items: Array<{ id: string; name: string }>
    paging: {
      pages: number
    }
  }
}

interface CategoryTranslationResponse {
  category: {
    id: string
    name: string
    title: string
    description: string
    linkId: string
  }
}

interface ResolvedPromise<Response> {
  data: Response
}
