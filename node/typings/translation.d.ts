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

interface ParamsTranslationsToVBase extends EntryParams {
  bucket: UploadBucket
  requestId: string
  locale: string
}

interface InterfaceTranslationsEntriesToVBase<T> {
  entries: T[]
  params: ParamsTranslationsToVBase
  getEntryTranslation: (
    params: EntryTranslationParams
  ) => Promise<GraphQLResponse<Serializable>>
}

interface UploadEntriesAsync<T> {
  entries: T[]
  requestId: string
  locale: string
  bucket: UploadBucket
  translateEntry: <T>(
    params: TranslateEntry<T>
  ) => Promise<GraphQLResponse<Serializable>>
}

interface UploadTranslations<T> {
  entries: UploadFile<ReadStream>
  locale: string
  bucket: UploadBucket
  path: string
  translateEntry: <T>(
    params: TranslateEntry<T>
  ) => Promise<GraphQLResponse<Serializable>>
}
interface EntryTranslations<T> extends UploadEntriesAsync<T> {
  path: string
  categoryId?: string
}

type UploadBucket =
  | 'brand_translation'
  | 'product_translation'
  | 'collection_transl'
  | 'field_translation'
  | 'category_transl'

type DownloadBucket =
  | 'product_translation'
  | 'field_translation'
  | 'sku_translation'
