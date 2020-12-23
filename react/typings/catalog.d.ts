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
