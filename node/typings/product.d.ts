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

interface ProductTranslationInput {
  id: string
  name?: string
  description?: string
  shortDescription?: string
  title?: string
  linkId?: string
}

interface UploadRequest {
  requestId: string
  translatedBy: string
  createdAt: Date
  estimatedTime: number
  locale: string
  error?: boolean
  progress?: number
}

type UploadFile<T> = Promise<{
  filename: string
  mimetype: string
  enconding: string
  createReadStream: () => T
}>
