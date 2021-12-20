import React, { SyntheticEvent } from 'react'
import { InputSearch, PageBlock, Spinner } from 'vtex.styleguide'

import useCatalogQuery from '../../hooks/useCatalogQuery'
import { useLocaleSelector } from '../LocaleSelector'
import getSpecificationById from '../../graphql/getSpecification.gql'
import ErrorHandler from '../ErrorHandler'
import SpecificationsForm from './SpecificationsForm'
import SpecificationExportModal from './SpecificationsExportModal'
import SpecificationImportModal from './SpecificationsImportModal'

const SpecificationsTranslation = ({
  isExportOpen = false,
  handleOpenExport = () => {},
  isImportOpen = false,
  handleOpenImport = () => {},
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
  } = useCatalogQuery<FieldsData, { fieldId: number }>(getSpecificationById)
  const { selectedLocale } = useLocaleSelector()

  const handleSubmitSpecification = (e: SyntheticEvent) => {
    e.preventDefault()
    if (!entryId) {
      return
    }
    setMemoEntries({})
    fetchEntry({
      variables: { fieldId: Number(entryId) },
    })
  }
  const { fieldId, ...specificationInfo } = entryInfo?.field || ({} as Field)

  return (
    <>
      <main>
        <div style={{ maxWidth: '340px' }} className="mv7">
          <InputSearch
            value={entryId}
            placeHolder="Search Specification..."
            label="Specification ID"
            size="regular"
            onChange={handleEntryIdInput}
            onSubmit={handleSubmitSpecification}
            onClear={handleCleanSearch}
          />
        </div>
        {fieldId || isLoadingOrRefetching || errorMessage ? (
          <PageBlock
            variation="full"
            title={`Specification info- ${selectedLocale}`}
          >
            {errorMessage ? (
              <ErrorHandler
                errorMessage={errorMessage}
                entryId={entryId}
                entry="Specification"
              />
            ) : isLoadingOrRefetching ? (
              <Spinner />
            ) : (
              <SpecificationsForm
                specificationInfo={specificationInfo}
                specificationId={entryId}
                updateMemoSpecifications={setMemoEntries}
              />
            )}
          </PageBlock>
        ) : null}
      </main>
      <SpecificationExportModal
        isExportOpen={isExportOpen}
        handleOpenExport={handleOpenExport}
      />
      <SpecificationImportModal
        isImportOpen={isImportOpen}
        handleOpenImport={handleOpenImport}
      />
    </>
  )
}

export default SpecificationsTranslation
