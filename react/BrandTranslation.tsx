import React, { FC } from 'react'
import { FormattedMessage } from 'react-intl'

import CatalogTranslationWrapper from './components/CatalogTranslationWrapper'
import BrandTranslation from './components/BrandTranslation/BrandTranslation'

const BrandTranslationWrapper: FC = () => {
  return (
    <CatalogTranslationWrapper
      titleComponent={
        <FormattedMessage id="catalog-translation.brand.header" />
      }
      hasExport
      hasImport
    >
      <BrandTranslation />
    </CatalogTranslationWrapper>
  )
}
export default BrandTranslationWrapper
