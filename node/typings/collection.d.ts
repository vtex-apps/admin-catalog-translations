interface CollectionResponse {
  collections: {
    items: Array<{
      id: string;
      name: string;
      status: string;
    }>
    paging: {
      pages: number
    }
  }
}

interface CollectionTranslationResponse {
  collection: {
    id: string
    name: string
    description: string
    status: string
  }
}

interface ResolvedPromise<Response> {
  data: Response
}

interface CollectionTranslationInput {
  id: string
  name?: string
  description?: string
}
