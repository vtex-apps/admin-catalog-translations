import React, { FC, ReactElement } from 'react'
import { Layout, PageHeader } from 'vtex.styleguide'

import ProviderWrapper from '../providers'
import LocaleSelector from './LocaleSelector'

interface CatalogTranslationWrapperProps {
  titleComponent: ReactElement
}

const CatalogTranslationWrapper: FC<CatalogTranslationWrapperProps> = ({
  titleComponent,
  children,
}) => (
  <ProviderWrapper>
    <Layout pageHeader={<PageHeader title={titleComponent} />}>
      <LocaleSelector />
      {children}
    </Layout>
  </ProviderWrapper>
)

export default CatalogTranslationWrapper
