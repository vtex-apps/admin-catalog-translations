import React, { FC } from 'react'
import { FormattedMessage } from 'react-intl'

import CatalogTranslationWrapper from './components/CatalogTranslationWrapper'
import SKUTranslation from './components/SKUTranslation/SKUTranslation'

const SKUTranslationWrapped: FC = () => {
  return (
    <CatalogTranslationWrapper
      titleComponent={<FormattedMessage id="catalog-translation.sku.header" />}
      hasExport
    >
      <SKUTranslation />
    </CatalogTranslationWrapper>
  )
}
export default SKUTranslationWrapped
