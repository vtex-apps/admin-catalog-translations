import React, { FC } from 'react'
import { FormattedMessage } from 'react-intl'

import CatalogTranslationWrapper from './components/CatalogTranslationWrapper'
import CollectionsTranslation from './components/CollectionsTranslation/CollectionsTranslation'

const CollectionsTranslationWrapped: FC = () => {
  return (
    <CatalogTranslationWrapper
      titleComponent={
        <FormattedMessage id="catalog-translation.collections.header" />
      }
    >
      <CollectionsTranslation />
    </CatalogTranslationWrapper>
  )
}

export default CollectionsTranslationWrapped
