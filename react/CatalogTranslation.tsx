import React, { FC, useEffect, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import {
  Layout,
  PageBlock,
  PageHeader,
  Spinner,
  Divider,
} from 'vtex.styleguide'
import { useQuery } from 'react-apollo'

import accountLocalesQuery from './graphql/accountLocales.gql'
import { filterLocales } from './utils'

const CatalogTranslation: FC = () => {
  const [bindings, setBindings] = useState<Binding[]>([])
  const { data, loading } = useQuery<BindingsData>(accountLocalesQuery)

  useEffect(() => {
    if (data) {
      setBindings(filterLocales(data.tenantInfo.bindings))
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
          <div className="flex">
            {bindings.map(({ id, defaultLocale }, index) => {
              return (
                <div className="flex" key={id}>
                  <div style={{ textAlign: 'center', minWidth: '160px' }}>
                    <p className="f4 mt0 mb1">{defaultLocale}</p>
                    {index === 0 ? (
                      <p
                        style={{ fontStyle: 'italic' }}
                        className="mt0 gray mb1"
                      >
                        x-vtex-tenant
                      </p>
                    ) : null}
                  </div>
                  {index !== bindings.length - 1 ? (
                    <div className="ph6 flex">
                      <Divider orientation="vertical" />
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
      </PageBlock>
    </Layout>
  )
}

export default CatalogTranslation
