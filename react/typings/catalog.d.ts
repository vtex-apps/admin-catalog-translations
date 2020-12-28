interface CategoriesData {
  category: Category
}

interface Category extends CategoryInputTranslation {
  keywords: string[]
  id: string
}

interface CategoryInputTranslation {
  description: string
  linkId: string
  name: string
  title: string
}

interface ProductData {
  product: Product
}

interface Product extends ProductInputTranslation {
  id: string
  keywords: string[]
}

interface ProductInputTranslation {
  name: string
  description: string
  shortDescription: string
  metaTagDescription: string
  title: string
  linkId: string
}
