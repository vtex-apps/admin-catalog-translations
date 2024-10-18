import React, { FC, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { Tabs, Tab, Layout, PageHeader } from 'vtex.styleguide'

import CatalogTranslationWrapper from './components/CatalogTranslationWrapper'
import SpecificationsTranslation from './components/SpecificationsTranslation/SpecificationsTranslation'
import SpecificationsTranslationValues from './components/SpecificationsTranslation/SpecificationsTranslationValues'

const SpecificationsTranslationWrapped: FC = () => {
  const [currentTab, setCurrentTab] = useState<number>(1)
  return (
    <Layout className="pd10">
      <Tabs>
        <Tab
          label="Specifications"
          active={currentTab === 1}
          onClick={() => setCurrentTab(1)}>
            <CatalogTranslationWrapper
              titleComponent={
                <FormattedMessage id="admin/catalog-translation.specifications.header" />
              }
              hasExport
              hasImport
            >
                  <SpecificationsTranslation />
            </CatalogTranslationWrapper>
        </Tab>
        <Tab
          label="Specification Values"
          active={currentTab === 2}
          onClick={() => setCurrentTab(2)}>
            <CatalogTranslationWrapper
              titleComponent={
                <FormattedMessage id="admin/catalog-translation.specifications.header" />
              }
              hasExport={false}
              hasImport={false}
            >
              <SpecificationsTranslationValues />
            </CatalogTranslationWrapper>
        </Tab>
      </Tabs>
    </Layout>
  )
}

export default SpecificationsTranslationWrapped
