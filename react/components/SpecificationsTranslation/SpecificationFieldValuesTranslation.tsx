import React, { FC, SyntheticEvent } from 'react'
import { InputSearch, PageBlock, Spinner, Button } from 'vtex.styleguide'

import useCatalogQuery from '../../hooks/useCatalogQuery'
import { useLocaleSelector } from '../LocaleSelector'
import ErrorHandler from '../ErrorHandler'
import SpecificationFieldValuesForm from './SpecificationFieldValuesForm'
import getSpecificationFieldValuesById from '../../graphql/getSpecificationsValues.gql'

interface SpecificationFieldValuesProps {
  searchedId: string
}

const SpecificationFieldValues: FC<SpecificationFieldValuesProps> = ({
  searchedId,
}) => {
  const {
    entryInfo,
    isLoadingOrRefetching,
    entryId,
    handleEntryIdInput,
    handleCleanSearch,
    fetchEntry,
    setMemoEntries,
    errorMessage,
  } = useCatalogQuery<SpecificationFieldValuesData, { fieldId: number }>(
    getSpecificationFieldValuesById
  )
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

  return (
    <main>
      <InputSearch
        value={entryId}
        placeHolder="Search Specification..."
        label="Specification ID"
        size="regular"
        onChange={handleEntryIdInput}
        onSubmit={handleSubmitSpecification}
        onClear={handleCleanSearch}
      />
      {entryInfo?.fieldValues.length ||
      isLoadingOrRefetching ||
      errorMessage ? (
        <PageBlock
          variation="full"
          title={`Specification field values info- ${selectedLocale}`}
        >
          {errorMessage ? (
            <ErrorHandler
              errorMessage={errorMessage}
              entryId={entryId}
              entry="Specification field values"
            />
          ) : isLoadingOrRefetching ? (
            <Spinner />
          ) : (
            <SpecificationFieldValuesForm
              specificationValuesInfo={entryInfo?.fieldValues}
              specificationValuesID={entryId}
              updateMemoSpecifications={setMemoEntries}
            />
          )}
        </PageBlock>
      ) : null}
    </main>
  )
}
export default SpecificationFieldValues
