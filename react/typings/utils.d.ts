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

type BucketType =
  | 'brand-translation'
  | 'product-translation'
  | 'collection-transl'
  | 'field-translation'
  | 'category-transl'

type typeItem = 'product' | 'sku' | 'field'
