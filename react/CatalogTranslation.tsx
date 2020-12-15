import React, { FC } from 'react'
import { FormattedMessage } from 'react-intl'
import { Layout, PageBlock, PageHeader } from 'vtex.styleguide'

const CatalogTranslation: FC = () => {
  return (
    <Layout
      pageHeader={
        <PageHeader
          title={<FormattedMessage id="catalog-translation.header" />}
        />
      }
    >
      <PageBlock variation="full">
        <div>Hello World</div>
      </PageBlock>
    </Layout>
  )
}

export default CatalogTranslation
