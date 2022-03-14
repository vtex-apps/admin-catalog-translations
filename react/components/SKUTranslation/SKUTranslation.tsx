import React, { SyntheticEvent } from 'react'
import { InputSearch, PageBlock, Spinner } from 'vtex.styleguide'

import useCatalogQuery from '../../hooks/useCatalogQuery'
import { useLocaleSelector } from '../LocaleSelector'
import getSKUQuery from './graphql/getSKU.gql'
import ErrorHandler from '../ErrorHandler'
import SKUForm from './SKUForm'
import SKUExportModal from './SKUExportModal'

const SKUTranslation = ({
  isExportOpen = false,
  handleOpenExport = () => {},
}: ComponentProps) => {
  const {
    entryInfo,
    isLoadingOrRefetching,
    entryId,
    handleEntryIdInput,
    handleCleanSearch,
    fetchEntry,
    setMemoEntries,
    errorMessage,
  } = useCatalogQuery<SKUData, { identifier: { field: 'id'; value: string } }>(
    getSKUQuery
  )

  const { selectedLocale } = useLocaleSelector()

  const handleSubmitSKUId = (e: SyntheticEvent) => {
    e.preventDefault()
    if (!entryId) {
      return
    }
    setMemoEntries({})
    fetchEntry({
      variables: { identifier: { field: 'id', value: entryId } },
    })
  }
  const { id, ...SKUInfo } = entryInfo?.sku || ({} as SKU)

  return (
    <>
      <main>
        <div style={{ maxWidth: '340px' }} className="mv7">
          <InputSearch
            value={entryId}
            placeHolder="Search SKU..."
            label="SKU ID"
            size="regular"
            onChange={handleEntryIdInput}
            onSubmit={handleSubmitSKUId}
            onClear={handleCleanSearch}
          />
        </div>
        {id || isLoadingOrRefetching || errorMessage ? (
          <PageBlock variation="full" title={`SKU info- ${selectedLocale}`}>
            {errorMessage ? (
              <ErrorHandler
                errorMessage={errorMessage}
                entryId={entryId}
                entry="SKU"
              />
            ) : isLoadingOrRefetching ? (
              <Spinner />
            ) : (
              <SKUForm
                SKUInfo={SKUInfo}
                SKUId={entryId}
                updateMemoSKU={setMemoEntries}
              />
            )}
          </PageBlock>
        ) : null}
      </main>
      <SKUExportModal
        isExportOpen={isExportOpen}
        setIsExportOpen={handleOpenExport}
      />
    </>
  )
}

export default SKUTranslation
