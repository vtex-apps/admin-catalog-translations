import React, { FC, SyntheticEvent } from 'react'
import { InputSearch, PageBlock, Spinner } from 'vtex.styleguide'

import useCatalogQuery from '../../hooks/useCatalogQuery'
import { useLocaleSelector } from '../LocaleSelector'
import ErrorHandler from '../ErrorHandler'
import getCollectionById from '../../graphql/getCollections.gql'
import CollectionsForm from './CollectionsForm'

const CollectionsTranslation: FC = () => {
  const {
    entryInfo,
    isLoadingOrRefetching,
    entryId,
    handleEntryIdInput,
    handleCleanSearch,
    fetchEntry,
    setMemoEntries,
    errorMessage,
  } = useCatalogQuery<CollectionsData, { fieldId: number }>(getCollectionById)
  const { selectedLocale, xVtexTenant } = useLocaleSelector()

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
  const { id, ...collectionInfo } = entryInfo?.collection || ({} as Collections)
  const collectionsSaveType = {
    to: selectedLocale,
    messages: {
      srcLang: xVtexTenant,
      srcMessage: collectionInfo.name,
      context: entryId,
      targetMessage: collectionInfo.name,
    },
  }
  return (
    <main>
      <div style={{ maxWidth: '340px' }} className="mv7">
        <InputSearch
          value={entryId}
          placeHolder="Search Collection..."
          label="Collection ID"
          size="regular"
          onChange={handleEntryIdInput}
          onSubmit={handleSubmitSpecification}
          onClear={handleCleanSearch}
        />
      </div>
      {id || isLoadingOrRefetching || errorMessage ? (
        <PageBlock
          variation="full"
          title={`Collection info- ${selectedLocale}`}
        >
          {errorMessage ? (
            <ErrorHandler
              errorMessage={errorMessage}
              entryId={entryId}
              entry="Collection"
            />
          ) : isLoadingOrRefetching ? (
            <Spinner />
          ) : (
            <CollectionsForm
              collectionInfo={collectionInfo}
              collectionId={entryId}
              collectionSaveData={collectionsSaveType}
              updateMemoCollections={setMemoEntries}
            />
          )}
        </PageBlock>
      ) : null}
    </main>
  )
}

export default CollectionsTranslation
