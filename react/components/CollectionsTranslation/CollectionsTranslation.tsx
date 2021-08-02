import React, { SyntheticEvent, useMemo, useState } from 'react'
import { InputSearch, PageBlock, Spinner } from 'vtex.styleguide'
import { useQuery } from 'react-apollo'
import { MessageListV2, IndexedMessages } from 'vtex.messages'
import { FormattedMessage, useIntl } from 'react-intl'

import useCatalogQuery from '../../hooks/useCatalogQuery'
import { useLocaleSelector } from '../LocaleSelector'
import ErrorHandler from '../ErrorHandler'
import getCollectionById from '../../graphql/getCollections.gql'
import CollectionsForm from './CollectionsForm'
import QUERY_MESSAGES from '../../graphql/messages.gql'
import { formatCollectionFromMessages } from '../../utils'

const CollectionsTranslation = () => {
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

  return (
    <main>
      <div style={{ maxWidth: '340px' }} className="mv7">
        <InputSearch
          value={entryId}
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
  )
}

export default CollectionsTranslation
