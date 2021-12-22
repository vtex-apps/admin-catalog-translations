import React, { SyntheticEvent, useEffect, useMemo, useState } from 'react'
import {
  InputSearch,
  PageBlock,
  Spinner,
  ModalDialog,
  Checkbox,
} from 'vtex.styleguide'
import { useLazyQuery, useQuery } from 'react-apollo'
import { MessageListV2, IndexedMessages } from 'vtex.messages'
import { FormattedMessage, useIntl } from 'react-intl'

import useCatalogQuery from '../../hooks/useCatalogQuery'
import { useLocaleSelector } from '../LocaleSelector'
import ErrorHandler from '../ErrorHandler'
import getCollectionById from '../../graphql/getCollections.gql'
import getAllCollections from '../../graphql/getAllCollections.gql'
import CollectionsForm from './CollectionForm'
import QUERY_MESSAGES from '../../graphql/messages.gql'
import { formatCollectionFromMessages, parseJSONToXLS } from '../../utils'
import CollectionImportModal from './CollectionImportModal'

interface CollectionTranslations {
  collectionTranslations: Collection[]
}

const CollectionsTranslation = ({
  isExportOpen = false,
  isImportOpen = false,
  handleOpenExport = () => {},
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
  } = useCatalogQuery<CollectionsData, { fieldId: number }>(getCollectionById)

  const { selectedLocale, xVtexTenant } = useLocaleSelector()
  const [fetchMessages, setFetchMessages] = useState(false)
  const [messagesTranslations, setMessagesTranslations] = useState(
    {} as { userTranslations: MessageListV2[] }
  )
  const intl = useIntl()
  /* Transfer Modal */
  const [onlyActive, setOnlyActive] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [hasError, setHasError] = useState(false)

  const handleSubmitSpecification = (e: SyntheticEvent) => {
    e.preventDefault()
    if (!entryId) {
      return
    }
    setMemoEntries({})
    fetchEntry({
      variables: { fieldId: Number(entryId) },
    })
    setFetchMessages(true)
  }

  const { refetch, loading: loadingMessages, error: errorMessages } = useQuery<
    { userTranslations: MessageListV2[] },
    { args: IndexedMessages }
  >(QUERY_MESSAGES, {
    ssr: false,
    skip: !entryId || !entryInfo?.collection.name || !fetchMessages,
    onCompleted: (data) => {
      setMessagesTranslations(data)
      setFetchMessages(false)
    },
    fetchPolicy: 'no-cache',
    variables: {
      args: {
        from: xVtexTenant,
        messages: [
          {
            content: entryInfo?.collection.name,
            context: entryId,
          },
        ],
      },
    },
  })

  const translatedCollectionNames = useMemo(() => {
    // eslint-disable-next-line vtex/prefer-early-return
    if (messagesTranslations.userTranslations && entryInfo) {
      const [userFormTranslation] = messagesTranslations.userTranslations
      const { translations, context, srcLang } = userFormTranslation
      return formatCollectionFromMessages({
        translations,
        context: context ?? '',
        srcLang,
        originalMessage: entryInfo.collection.name,
      })
    }
    return {}
  }, [messagesTranslations, entryInfo])

  const collectionInfo =
    translatedCollectionNames[selectedLocale] ??
    translatedCollectionNames[xVtexTenant] ??
    {}

  const handleUpdateMessage = async () => {
    const { data } = await refetch({
      args: {
        from: xVtexTenant,
        messages: [
          {
            content: entryInfo?.collection.name,
            context: entryId,
          },
        ],
      },
    })
    setMessagesTranslations(data)
  }

  const [fetchCollections, { data, error }] = useLazyQuery<
    CollectionTranslations,
    { locale: string; active?: boolean }
  >(getAllCollections, {
    context: {
      headers: {
        'x-vtex-locale': `${selectedLocale}`,
      },
    },
    fetchPolicy: 'no-cache',
  })

  const downloadCollections = () => {
    setHasError(false)
    setDownloading(true)
    fetchCollections({
      variables: { active: onlyActive, locale: selectedLocale },
    })
  }

  useEffect(() => {
    // eslint-disable-next-line vtex/prefer-early-return
    if (data && downloading) {
      parseJSONToXLS(data.collectionTranslations, {
        fileName: `collection-data-${selectedLocale}`,
        sheetName: 'collection_data',
      })

      setDownloading(false)
      handleOpenExport(false)
    }
  }, [data, selectedLocale, downloading, handleOpenExport])

  useEffect(() => {
    // eslint-disable-next-line vtex/prefer-early-return
    if (error) {
      setDownloading(false)
      setHasError(true)
    }
  }, [error])

  return (
    <>
      <main>
        <div style={{ maxWidth: '340px' }} className="mv7">
          <InputSearch
            value={entryId}
            placeholder="Search collections..."
            label={
              <FormattedMessage id="catalog-translation.collections.search-label" />
            }
            size="regular"
            onChange={handleEntryIdInput}
            onSubmit={handleSubmitSpecification}
            onClear={handleCleanSearch}
          />
        </div>
        {collectionInfo.name ||
        isLoadingOrRefetching ||
        loadingMessages ||
        errorMessage ||
        errorMessages ? (
          <PageBlock
            variation="full"
            title={
              <FormattedMessage
                id="catalog-translation.collections.block-header"
                values={{ selectedLocale }}
              />
            }
          >
            {errorMessage ? (
              <ErrorHandler
                errorMessage={errorMessage || (errorMessages?.message ?? '')}
                entryId={entryId}
                entry={intl.formatMessage({
                  id: 'catalog-translation.entry-type.collection',
                })}
              />
            ) : isLoadingOrRefetching || loadingMessages ? (
              <Spinner />
            ) : (
              <CollectionsForm
                collectionInfo={collectionInfo}
                srcMessage={translatedCollectionNames[xVtexTenant]?.name ?? ''}
                updateMemoCollections={handleUpdateMessage}
              />
            )}
          </PageBlock>
        ) : null}
      </main>
      <ModalDialog
        loading={downloading}
        cancelation={{
          label: 'Cancel',
          onClick: () => {
            handleOpenExport(false)
            setHasError(false)
          },
        }}
        confirmation={{
          label: 'Export Collections',
          onClick: downloadCollections,
        }}
        isOpen={isExportOpen}
        onClose={() => {
          handleOpenExport(false)
          setHasError(false)
        }}
      >
        <div>
          <h3>Export Collections Data for {selectedLocale}</h3>
          <Checkbox
            label="Export only active collections"
            name="active-selection"
            value={onlyActive}
            checked={onlyActive}
            onChange={() => setOnlyActive(!onlyActive)}
          />
        </div>
        {hasError ? (
          <p className="absolute c-danger i-s bottom-0-m right-0-m mr8">
            There was an error exporting collections. Please try again.
          </p>
        ) : null}
      </ModalDialog>
      <CollectionImportModal
        isImportOpen={isImportOpen}
        handleOpenImport={handleOpenImport}
      />
    </>
  )
}

export default CollectionsTranslation
