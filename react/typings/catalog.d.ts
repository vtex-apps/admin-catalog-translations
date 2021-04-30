interface CategoriesData {
  category: Category
}

interface Category extends CategoryInputTranslation {
  id: string
}

interface CategoryInputTranslation {
  description: string
  linkId: string
  name: string
  title: string
}
interface SKUData {
  sku: SKU
}
interface SKU extends SKUInputTranslation {
  id: string
}
interface SKUInputTranslation {
  name: string
}
interface BrandData {
  brand: Brand
}
interface Brand extends BrandInputTranslation {
  id: string
}
interface BrandInputTranslation {
  name: string
  text: string
  siteTitle: string
}

interface ProductData {
  product: Product
}

interface Product extends ProductInputTranslation {
  id: string
}

interface ProductInputTranslation {
  name: string
  description: string
  shortDescription: string
  metaTagDescription: string
  title: string
  linkId: string
}

interface SpecificationsData {
  field: Specifications
}
interface Specifications extends FieldInputTranslation {
  fieldId: string
}
interface FieldInputTranslation {
  name: string
  description: string
  fieldTypeId: string
  fieldTypeName: string
}
interface SpecificationFieldValuesData {
  fieldValues: SpecificationFieldValues[]
}

interface SpecificationFieldValues extends FieldValueInputTranslation {
  fieldId: string
}

interface FieldValueInputTranslation {
  fieldValueId: string
  value: string
}

interface FieldValueArgsMutation {
  fieldId: string
  fieldValuesNames: {
    id: string
    name: string
  }
}
interface CategoriesNameAndId {
  getCategoriesName: Array<{ id: string; name: string }>
}

interface ProductTranslations {
  productTranslations: Array<{
    id: string
    name: string
    description: string
    shortDescription: string
    title: string
    locale: string
  }>
}
