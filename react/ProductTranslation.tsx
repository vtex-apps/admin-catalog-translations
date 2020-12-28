import React, { FC } from 'react'

import CatalogTranslationWrapper from './components/CatalogTranslationWrapper'
import ProductTranslation from './components/ProductTranslation/ProductTranslation'

const ProductTranslationWrapped: FC = () => {
  return (
    <CatalogTranslationWrapper titleId="catalog-translation.header">
      <ProductTranslation />
    </CatalogTranslationWrapper>
  )
}

export default ProductTranslationWrapped
