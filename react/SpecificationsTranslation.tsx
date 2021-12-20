import React, { FC } from 'react'
import { FormattedMessage } from 'react-intl'

import CatalogTranslationWrapper from './components/CatalogTranslationWrapper'
import SpecificationsTranslation from './components/SpecificationsTranslation/SpecificationsTranslation'

const SpecificationsTranslationWrapped: FC = () => {
  return (
    <CatalogTranslationWrapper
      titleComponent={
        <FormattedMessage id="catalog-translation.specifications.header" />
      }
      hasExport
      hasImport
    >
      <SpecificationsTranslation />
    </CatalogTranslationWrapper>
  )
}

export default SpecificationsTranslationWrapped
