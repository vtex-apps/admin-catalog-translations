import React, { FC } from 'react'

import CategoryTranslation from './components/CategoryTranslation/CategoryTranslation'
import CatalogTranslationWrapper from './components/CatalogTranslationWrapper'

const CategoryTranslationWrapped: FC = () => {
  return (
    <CatalogTranslationWrapper titleId="catalog-translation.header">
      <CategoryTranslation />
    </CatalogTranslationWrapper>
  )
}

export default CategoryTranslationWrapped
