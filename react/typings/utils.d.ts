interface Messages {
  errors: Message[]
  warnings: Message[]
}

interface Message {
  line: number
  missingFields: []
}

type EntryHeaders<EntryType> = Extract<keyof EntryType, string> | 'locale'

type typeItem = 'product' | 'sku' | 'field' | 'brand'
