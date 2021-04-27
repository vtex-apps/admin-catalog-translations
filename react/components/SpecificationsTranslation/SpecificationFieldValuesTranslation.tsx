import React, { FC, SyntheticEvent, useState } from 'react'
import { InputSearch, PageBlock, Spinner, Dropdown } from 'vtex.styleguide'

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
  const formattedOptions = [{}]
  const { selectedLocale } = useLocaleSelector()
  const [selectedFieldValue, setSelectedFiedValue] = useState('')
  const [selectedFieldValueFormated, setSelectedFieldFormatted] = useState<
    FieldValueInputTranslation
  >({} as FieldValueInputTranslation)

  const convertFieldValuestoDropDown = () => {
    entryInfo?.fieldValues.map((field) => {
      formattedOptions.push({
        label: field.value,
        value: field.value,
        key: field.fieldValueId,
      })
    })
  }
  convertFieldValuestoDropDown()

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

  const handleLocaleSelection = (fieldSelected: string) => {
    const selectedFieldFormatted = entryInfo?.fieldValues.filter(
      (field) => field.value === fieldSelected
    )
    setSelectedFiedValue(fieldSelected)
    setSelectedFieldFormatted(selectedFieldFormatted[0])
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
            <div className="mb5">
              <Dropdown
                label="Field Values"
                placeholder="Select a field"
                value={selectedFieldValue}
                options={formattedOptions}
                onChange={(_: unknown, value: string) =>
                  handleLocaleSelection(value)
                }
              />
              <SpecificationFieldValuesForm
                specificationValuesInfo={selectedFieldValueFormated}
                specificationValuesID={searchedId}
                updateMemoSpecifications={setMemoEntries}
              />
            </div>
          )}
        </PageBlock>
      ) : null}
    </main>
  )
}
export default SpecificationFieldValues
