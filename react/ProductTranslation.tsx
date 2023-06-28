import React, { FC } from 'react'
import { FormattedMessage } from 'react-intl'

import CatalogTranslationWrapper from './components/CatalogTranslationWrapper'
import ProductTranslation from './components/ProductTranslation/ProductTranslation'

const ProductTranslationWrapped: FC = () => {
  return (
    <CatalogTranslationWrapper
      titleComponent={
        <FormattedMessage id="admin/catalog-translation.product.header" />
      }
      hasExport
      hasImport
    >
      <ProductTranslation />
    </CatalogTranslationWrapper>
  )
}

export default ProductTranslationWrapped
