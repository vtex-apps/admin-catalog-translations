interface Catalog {
  category: Category
}

interface Category {
  description: string
  id: string
  keywords: string[]
  linkId: string
  name: string
  parentCategoryId: string
  stockKeepingUnitSelectionMode: string
  title: string
}
