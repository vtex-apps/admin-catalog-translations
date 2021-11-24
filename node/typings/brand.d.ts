interface Brand {
  id:	string
  name:	string
  text: string
  siteTitle: string
  active: boolean
}

interface BrandResponse {
  brands: {
    items: Array<Brand>
    paging: {
      pages: number
    }
  }
}

interface BrandTranslationResponse {
  brand: Brand
}
