interface Brand {
  id: string
  name: string
  text: string
  siteTitle: string
  active: boolean
}

interface BrandResponse {
  brands: {
    items: Brand[]
    paging: {
      pages: number
    }
  }
}

interface BrandTranslationResponse {
  brand: Brand
}

interface BrandTranslationInput {
  id: string
  name?: string
  text?: string
  siteTitle?: string
}
