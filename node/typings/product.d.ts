interface GetProductAndSkuIds {
  data: {
    [productId: string]: number[]
  }
  range: {
    total: number
    from: number
    to: number
  }
}

interface ProductTranslationResponse {
  product: {
    id: string
    name: string
    description: string
    shortDescription: string
    title: string
    linkId: string
  }
}
