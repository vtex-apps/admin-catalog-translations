export const CATEGORIES_QUERY = `
  query GetCategories ($active: Boolean, $page: Int!) {
    categories(term:"*", page: $page, pageSize: 50, active: $active) {
      items {
        id
        name
      }
      paging {
        pages
      }
    }
  }
`

export const GET_CATEGORY_TRANSLATION_QUERY = `
  query getTranslation($id:ID!) {
    category(id: $id) {
      id
      name
      title
      description
      linkId
    }
  }
`
export const TRANSLATE_CATEGORY = `mutation translateCategory($category:CategoryInputTranslation!, $locale: Locale!) {
  translateCategory(category: $category, locale: $locale)
}`

export const GET_PRODUCT_TRANSLATION_QUERY = `
  query getProductTranslation($identifier: ProductUniqueIdentifier) {
    product(identifier: $identifier) {
      id
      name
      description
      shortDescription
      title
      linkId
    }
  }
`

export const GET_SKU_TRANSLATION_QUERY = `
  query getSKUTranslation($identifier: SKUUniqueIdentifier) {
    sku(identifier: $identifier) {
      id
      name
    }
  }
`

export const TRANSLATE_PRODUCT = `mutation translateProduct($product:ProductInputTranslation!, $locale: Locale!) {
  translateProduct(product: $product, locale: $locale)
}`

export const BRAND_QUERY = `
  query GetBrands ($page: Int!) {
    brands(term:"*", page: $page, pageSize: 50) {
      items {
        id
        name
        text
        siteTitle
        active
      }
      paging {
        pages
      }
    }
  }
`

export const TRANSLATE_BRAND = `mutation translateBrand($brand:BrandInputTranslation!, $locale: Locale!) {
  translateBrand(brand: $brand, locale: $locale)
}`

export const COLLECTIONS_QUERY = `
  query GetCollections ($page: Int!) {
    collections(searchKey:"", page: $page, pageSize: 50) {
      items {
        id
        name
        status
      }
      paging {
        pages
      }
    }
  }
`

export const GET_COLLECTION_TRANSLATION_QUERY = `
  query getTranslation($id:ID!) {
    collection(id: $id) {
      id
      name
      status
    }
  }
`
export const GET_FIELD_TRANSLATION_QUERY = `query field($id:ID!) {
  field(id: $id){
    fieldId
    name
  }
}`

export const TRANSLATE_FIELD = `mutation translateField($field: FieldInputTranslation!, $locale: Locale!) {
  translateField(field: $field, locale: $locale)
}`
