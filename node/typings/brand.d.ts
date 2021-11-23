interface BrandResponse {
  brands: {
    items: Array<{ id: string; name: string ; active: boolean }>
    paging: {
      pages: number
    }
  }
}

interface BrandTranslationResponse {
  brand: {
    id:	string
    name:	string
    text: string
    siteTitle: string
    active: boolean
  }
}

interface ResolvedPromise<Response> {
  data: Response
}
