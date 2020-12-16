import React, { FC, useEffect, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { Layout, PageBlock, PageHeader, Spinner } from 'vtex.styleguide'
import { useQuery } from 'react-apollo'

import accountLocalesQuery from './graphql/accountLocales.gql'

interface Binding {
  id: string
  defaultLocale: string
}

interface BindingsData {
  tenantInfo: {
    bindings: Binding[]
  }
}

const CatalogTranslation: FC = () => {
  const [bindings, setBindings] = useState<Binding[]>([])
  const { data, loading } = useQuery<BindingsData>(accountLocalesQuery)

  useEffect(() => {
    if (data) {
      setBindings(data.tenantInfo.bindings)
    }
  }, [data])

  return (
    <Layout
      pageHeader={
        <PageHeader
          title={<FormattedMessage id="catalog-translation.header" />}
        />
      }
    >
      <PageBlock variation="full">
        {loading ? (
          <Spinner />
        ) : (
          bindings.map(({ id, defaultLocale }) => {
            return (
              <div key={id}>
                <p>{defaultLocale}</p>
              </div>
            )
          })
        )}
      </PageBlock>
    </Layout>
  )
}

export default CatalogTranslation
