import React, { FC } from 'react'
import { FormattedMessage } from 'react-intl'

import CatalogTranslationWrapper from './components/CatalogTranslationWrapper'
import ProductTranslation from './components/ProductTranslation/ProductTranslation'

const ProductTranslationWrapped: FC = () => {
  return (
    <CatalogTranslationWrapper
      titleComponent={
        <FormattedMessage id="catalog-translation.product.header" />
      }
      hasExport
    >
      <ProductTranslation />
    </CatalogTranslationWrapper>
  )
}

export default ProductTranslationWrapped
