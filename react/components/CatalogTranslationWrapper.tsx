import React, { FC } from 'react'
import { Layout, PageHeader } from 'vtex.styleguide'
import { FormattedMessage } from 'react-intl'

import ProviderWrapper from '../providers'
import LocaleSelector from './LocaleSelector'

interface CatalogTranslationWrapperProps {
  titleId: string
}

const CatalogTranslationWrapper: FC<CatalogTranslationWrapperProps> = ({
  titleId,
  children,
}) => (
  <ProviderWrapper>
    <Layout
      pageHeader={<PageHeader title={<FormattedMessage id={titleId} />} />}
    >
      <LocaleSelector />
      {children}
    </Layout>
  </ProviderWrapper>
)

export default CatalogTranslationWrapper
