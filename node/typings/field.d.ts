interface Field {
  fieldId: string
  name?: string
}
// TODO: remove this ?
interface FieldResponse {
  fields: {
    items: Field[]
    paging: {
      pages: number
    }
  }
}

interface FieldTranslationResponse {
  field: Field
}

interface FieldTranslationInput {
  fieldId: string
  name?: string
}
