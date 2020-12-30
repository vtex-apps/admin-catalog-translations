import { DocumentNode } from 'graphql'
import { FormEvent, useEffect, useState } from 'react'
import { useLazyQuery } from 'react-apollo'

import { useLocaleSelector } from '../components/LocaleSelector'

function useCatalogQuery<QueryReturn, Variables>(query: DocumentNode) {
  const { selectedLocale, xVtexTenant } = useLocaleSelector()
  const [memoEntries, setMemoEntries] = useState<{
    [Identifier: string]: QueryReturn
  }>({})
  const [entryId, setEntryId] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const [
    fetchEntry,
    { refetch, loading: LoadingEntry, networkStatus },
  ] = useLazyQuery<QueryReturn, Variables>(query, {
    context: {
      headers: {
        'x-vtex-tenant': `${xVtexTenant}`,
        'x-vtex-locale': `${selectedLocale}`,
      },
    },
    fetchPolicy: 'no-cache',
    notifyOnNetworkStatusChange: true,
    onError: (e) => {
      setErrorMessage(e.message)
    },
  })

  useEffect(() => {
    async function refetchAndUpdate() {
      try {
        const { data } = await refetch()
        setMemoEntries({
          ...memoEntries,
          ...{ [selectedLocale]: data },
        })
      } catch (err) {
        setErrorMessage(err.message)
      }
    }

    if (!memoEntries[selectedLocale] && refetch && entryId) {
      refetchAndUpdate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memoEntries, refetch, selectedLocale])

  const handleEntryIdInput = (e: FormEvent<HTMLInputElement>) => {
    if (errorMessage) {
      setErrorMessage('')
    }
    const inputValue = e.currentTarget.value
    const onlyNumberRegex = /^\d{0,}$/
    if (onlyNumberRegex.test(inputValue)) {
      setEntryId(inputValue)
    }
  }

  const handleCleanSearch = () => {
    setEntryId('')
    setMemoEntries({})
  }

  const isLoadingOrRefetching = LoadingEntry || networkStatus === 4

  return {
    entryInfo: memoEntries[selectedLocale],
    entryId,
    setMemoEntries,
    isLoadingOrRefetching,
    handleCleanSearch,
    handleEntryIdInput,
    fetchEntry,
    errorMessage,
  }
}

export default useCatalogQuery
