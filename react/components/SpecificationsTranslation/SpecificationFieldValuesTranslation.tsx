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
  const { selectedLocale } = useLocaleSelector()
  const [selectedFieldValue, setSelectedFieldValue] = useState('')
  const [selectedFieldValueId, setSelectedFieldValueId] = useState('')
  const [selectedField, setSelectedField] = useState<
    FieldValueInputTranslation
  >({} as FieldValueInputTranslation)

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
  const findSelectedFieldValueId = () => {
    entryInfo?.fieldValues.map((fieldItem) => {
      if (fieldItem.value === selectedFieldValue) {
        setSelectedFieldValueId(fieldItem.fieldValueId)
      }
    })
    setSelectedField({
      fieldValueId: selectedFieldValueId,
      value: selectedFieldValue,
    })
  }
  const handleSelectionChange = async (e: SyntheticEvent) => {
    const target = e.target as HTMLSelectElement
    setSelectedFieldValue(target.value)
    findSelectedFieldValueId()
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
              <select
                onChange={handleSelectionChange}
                value={selectedFieldValue}
              >
                {entryInfo?.fieldValues.map((fieldItem) => {
                  return (
                    <option
                      value={fieldItem.value}
                      key={fieldItem.fieldValueId}
                    >
                      {fieldItem.value}
                    </option>
                  )
                })}
              </select>
              <SpecificationFieldValuesForm
                specificationValuesInfo={selectedField}
                specificationValuesID={selectedFieldValueId}
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
