import React, { FC, ReactElement, useState } from 'react'
import { Layout, PageHeader } from 'vtex.styleguide'

import ProviderWrapper from '../providers'
import ExportButton from './ExportButton'
import ImportButton from './ImportButton'
import LocaleSelector from './LocaleSelector'

interface CatalogTranslationWrapperProps {
  titleComponent: ReactElement
  hasExport?: boolean
  hasImport?: boolean
}

const CatalogTranslationWrapper: FC<CatalogTranslationWrapperProps> = ({
  titleComponent,
  hasExport,
  children,
  hasImport,
}) => {
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)

  const handleOpenExport = (open: boolean) => {
    setIsExportOpen(open)
  }

  const handleOpenImport = (open: boolean) => {
    setIsImportOpen(open)
  }

  return (
    <ProviderWrapper>
      <Layout pageHeader={<PageHeader title={titleComponent} />}>
        <div className="flex items-end">
          <LocaleSelector />
          {hasExport ? <ExportButton openExport={handleOpenExport} /> : null}
          {hasImport ? <ImportButton openImport={handleOpenImport} /> : null}
        </div>
        
        {React.Children.map(children, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(child, {
                isExportOpen,
                handleOpenExport,
                isImportOpen,
                handleOpenImport,
              })
            : null
        )}
      </Layout>
    </ProviderWrapper>
  )
}

export default CatalogTranslationWrapper
