import React, { FC, SyntheticEvent } from 'react'
import { PageBlock, Spinner, InputSearch } from 'vtex.styleguide'

import getBrand from '../../graphql/getBrand.gql'
import { useLocaleSelector } from '../LocaleSelector'
import ErrorHandler from '../ErrorHandler'
import BrandForm from './BrandForm'
import useCatalogQuery from '../../hooks/useCatalogQuery'
import BrandExportModal from './BrandExportModal'

const BrandTranslation = ({
  isExportOpen = false,
  handleOpenExport = () => {},
  isImportOpen = false,
  handleOpenImport = () => {},
}: ComponentProps) => {
  const {
    entryInfo,
    isLoadingOrRefetching,
    entryId,
    handleCleanSearch,
    handleEntryIdInput,
    fetchEntry,
    setMemoEntries,
    errorMessage,
  } = useCatalogQuery<BrandData, { id: number }>(getBrand)

  const { selectedLocale } = useLocaleSelector()

  const handleSubmitBrandId = (e: SyntheticEvent) => {
    e.preventDefault()
    if (!entryId) {
      return
    }
    setMemoEntries({})
    fetchEntry({ variables: { id: Number(entryId) } })
  }

  const { id, ...brandInfo } = entryInfo?.brand || ({} as Brand)

  return (
    <>
      <main>
        <div style={{ maxWidth: '340px' }} className="mv7">
          <InputSearch
            value={entryId}
            placeholder="Search Brand..."
            label="Brand ID"
            size="regular"
            onChange={handleEntryIdInput}
            onSubmit={handleSubmitBrandId}
            onClear={handleCleanSearch}
          />
        </div>
        {id || isLoadingOrRefetching || errorMessage ? (
          <PageBlock variation="full" title={`Brand Info - ${selectedLocale}`}>
            {errorMessage ? (
              <ErrorHandler
                errorMessage={errorMessage}
                entryId={entryId}
                entry="Brand"
              />
            ) : isLoadingOrRefetching ? (
              <Spinner />
            ) : (
              <BrandForm
                BrandInfo={brandInfo}
                BrandId={id}
                updateMemoBrands={setMemoEntries}
              />
            )}
          </PageBlock>
        ) : null}
      </main>
      <BrandExportModal
        isExportOpen={isExportOpen}
        handleOpenExport={handleOpenExport}
      />
      <BrandExportModal
        isImportOpen={isImportOpen}
        handleOpenImport={handleOpenImport}
      />
    </>
  )
}

export default BrandTranslation
