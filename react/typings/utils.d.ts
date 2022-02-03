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

type EntryHeaders =
  | EntryHeadersBrand
  | EntryHeadersCategory
  | EntryHeadersProduct
  | 'locale'
