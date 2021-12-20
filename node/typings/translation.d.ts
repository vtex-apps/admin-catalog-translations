interface TranslationRequest<T> {
  requestId: string
  translations?: Array<GraphQLResponse<T>> | null
  requestedBy: string
  categoryId?: string
  error?: boolean
  createdAt: Date
  locale: string
  completedAt?: Date
  estimatedTime: number
}
interface TranslateEntry<T> {
  entry: T
  locale: string
}

interface EntryParams {
  requestId: string
  locale?: string
}

interface EntryTranslationParams<T> extends EntryParams {
  entry: T
}

interface ParamsTranslationsToVBase extends EntryParams {
  bucket: string
}

interface InterfaceTranslationsEntriesToVBase<T> {
  entries: T[]
  params: ParamsTranslationsToVBase
  getEntryTranslation: (
    params: EntryTranslationParams
  ) => Promise<GraphQLResponse<Serializable>>
}
