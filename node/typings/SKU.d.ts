interface SKUTranslationsResponse {
  sku: {
    id: string
    name: string
  }
}

interface SKUTranslationRequest {
  requestId: string
  translations?: Array<GraphQLResponse<SKUTranslationsResponse>> | null
  requestedBy: string
  categoryId: string
  error?: boolean
  createdAt: Date
  locale: string
  completedAt?: Date
  estimatedTime: number
}
