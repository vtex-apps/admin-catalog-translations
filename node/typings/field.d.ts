interface Field {
  fieldId: string
  name?: string
}

interface FieldTranslationResponse {
  field: Field
}

interface FieldTranslationInput {
  fieldId: string
  name?: string
}
