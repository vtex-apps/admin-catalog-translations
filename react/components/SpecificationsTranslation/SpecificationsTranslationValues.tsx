import React, { SyntheticEvent, useEffect, useState } from 'react'
import { InputSearch, PageBlock, Spinner, PageHeader } from 'vtex.styleguide'
import { useLazyQuery } from 'react-apollo'

import useCatalogQuery from '../../hooks/useCatalogQuery'
import { useLocaleSelector } from '../LocaleSelector'
import getSpecificationById from './graphql/getSpecification.gql'
import GetSpecificationValues from './graphql/getSpecificationValues.gql'
import ErrorHandler from '../ErrorHandler'
import SpecificationsValuesForm from './SpecificationsValuesForm'
import SpecificationExportModal from './SpecificationsExportModal'
import SpecificationImportModal from './SpecificationsImportModal'

interface Specification {
  value: string;
  fieldValueId: string;
  isActive: boolean;
}

const SpecificationsTranslationValues = ({
  isExportOpen = false,
  handleOpenExport = () => {},
  isImportOpen = false,
  handleOpenImport = () => {},
}: ComponentProps) => {
  const {
    entryInfo,
    entryId,
    handleEntryIdInput,
    handleCleanSearch,
    errorMessage,
  } = useCatalogQuery<FieldsData, { fieldId: number }>(getSpecificationById)
  const [specificationValues, setSpecificationValues] = useState<Specification[]>()
  const { selectedLocale, xVtexTenant } = useLocaleSelector()

  const [getData, { loading, data }] = useLazyQuery(GetSpecificationValues,{
    context: {
      headers: {
        'x-vtex-tenant': `${xVtexTenant}`,
        'x-vtex-locale': `${selectedLocale}`,
      },
    },
    fetchPolicy: 'no-cache',
    notifyOnNetworkStatusChange: true,
    onError: (e) => {
      console.log("Error context")
    },
  })

  const handleSubmitSpecification = (e: SyntheticEvent) => {
    e.preventDefault()
    if (!entryId) {
      return
    }

    getData({
      variables: {
        fieldId: entryId
      },
    })
  }

  useEffect(() => {
    if (!data) {
      return
    }
    setSpecificationValues(data.fieldValues)
    
  }, [data])

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
        {specificationValues ? (
          <PageBlock
          variation="full"
          title={`Specification info- ${selectedLocale}`}
        >
          <ul>
          {errorMessage ? (
            <ErrorHandler
              errorMessage={errorMessage}
              entryId={entryId}
              entry="Specification"
            />
          ) : loading ? (
            <Spinner />
          ) : (
              <SpecificationsValuesForm
                specificationInfo={specificationInfo}
                specificationValues={specificationValues}
                specificationId={entryId}
              />
            )}
          </ul>
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

export default SpecificationsTranslationValues
