interface BrandResponse {
  categories: {
    items: Array<{ id: string; name: string }>
    paging: {
      pages: number
    }
  }
}

interface BrandTranslationResponse {
  brand: {
    id:	number
    name:	string
    imageUrl:	string
    isActive:	boolean
    title:	string
    metaTagDescription:	string
  }
}
