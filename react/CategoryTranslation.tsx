import React, { FC } from 'react'
import { FormattedMessage } from 'react-intl'

import CategoryTranslation from './components/CategoryTranslation/CategoryTranslation'
import CatalogTranslationWrapper from './components/CatalogTranslationWrapper'

const CategoryTranslationWrapped: FC = () => {
  return (
    <CatalogTranslationWrapper
      titleComponent={
        <FormattedMessage id="catalog-translation.category.header" />
      }
      hasExport
      hasImport
    >
      <CategoryTranslation />
    </CatalogTranslationWrapper>
  )
}

export default CategoryTranslationWrapped
