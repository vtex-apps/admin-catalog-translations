interface Field {
  fieldId: string
  name?: string
}

interface FieldResponse {
  fields: {
    items: Array<Field>
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