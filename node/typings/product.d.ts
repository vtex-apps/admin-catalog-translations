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
