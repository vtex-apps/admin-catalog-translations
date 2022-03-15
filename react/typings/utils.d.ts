interface Messages {
  errors: Message[]
  warnings: Message[]
}

interface Message {
  line: number
  missingFields: []
}

type EntryHeadersBrand = Extract<keyof Brand, string>
type EntryHeadersCategory = Extract<keyof Category, string>
type EntryHeadersProduct = Extract<keyof Product, string>
type EntryHeadersSpecifications = Extract<keyof Field, string>

type EntryHeaders =
  | EntryHeadersBrand
  | EntryHeadersCategory
  | EntryHeadersProduct
  | EntryHeadersSpecifications
  | 'locale'

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

type typeItem = 'product' | 'sku' | 'field'
