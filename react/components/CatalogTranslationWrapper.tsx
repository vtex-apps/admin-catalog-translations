import React, { FC, ReactElement, useState } from 'react'
import { Layout, PageHeader } from 'vtex.styleguide'

import ProviderWrapper from '../providers'
import ExportButton from './ExportButton'
import LocaleSelector from './LocaleSelector'

interface CatalogTranslationWrapperProps {
  titleComponent: ReactElement
  hasExport?: boolean
}

const CatalogTranslationWrapper: FC<CatalogTranslationWrapperProps> = ({
  titleComponent,
  hasExport,
  children,
}) => {
  const [isExportOpen, setIsExportOpen] = useState(false)

  const handleOpenExport = () => {
    setIsExportOpen(true)
  }

  return (
    <ProviderWrapper>
      <Layout pageHeader={<PageHeader title={titleComponent} />}>
        <div className="flex items-end">
          <LocaleSelector />
          {hasExport ? <ExportButton openExport={handleOpenExport} /> : null}
        </div>
        {React.Children.map(children, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(child, { isExportOpen })
            : null
        )}
      </Layout>
    </ProviderWrapper>
  )
}

export default CatalogTranslationWrapper
