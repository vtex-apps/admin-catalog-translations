import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useQuery } from 'react-apollo'
import { ApolloError } from 'apollo-client'
import {
  ModalDialog,
  Alert,
  AutocompleteInput,
  Spinner,
  Tabs,
  Tab,
} from 'vtex.styleguide'

import GET_CATEGORIES_NAME from '../graphql/getCategoriesName.gql'
import { filterSearchCategories } from '../utils'
import { useLocaleSelector } from './LocaleSelector'
import ExportListItem from './ProductTranslation/ExportListItem'

const AUTOCOMPLETE_LIST_SIZE = 6
const DOWNLOAD_LIST_SIZE = 6

interface AutocompleteValue {
  label: string
  value: string
}

interface Props {
  isExportOpen: boolean
  setIsExportOpen: (open: boolean) => void
  translationRequests: string[]
  startDownload: (categoryId: string) => void
  errorTranslation?: ApolloError
  loadingTranslations: boolean
  hasNewRequest: boolean
}

export const ExportByCategoryIdModal = ({
  isExportOpen,
  setIsExportOpen,
  translationRequests = [],
  startDownload,
  errorTranslation,
  loadingTranslations,
  hasNewRequest,
}: Props) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [hasError, setHasError] = useState(false)
  const [showMissingCatId, setShowMissingCatId] = useState(false)
  const { selectedLocale } = useLocaleSelector()
  const [tabSelected, setTabSelected] = useState<1 | 2>(1)

  const [selectedCategory, setSelectedCategory] = useState<AutocompleteValue>(
    {} as AutocompleteValue
  )

  const {
    data: categoryInfo,
    loading: loadingCategoryInfo,
    error: categoryError,
  } = useQuery<CategoriesNameAndId>(GET_CATEGORIES_NAME)

  const listOfOptions = filterSearchCategories({
    categoryList: categoryInfo?.getCategoriesName ?? [],
    term: searchTerm,
  })

  useEffect(() => {
    // eslint-disable-next-line vtex/prefer-early-return
    if (hasNewRequest) {
      setSearchTerm('')
      setTabSelected(2)
    }
  }, [hasNewRequest])

  const handleClose = useCallback(() => {
    setSelectedCategory({} as AutocompleteValue)
    setIsExportOpen(false)
    setSearchTerm('')
    setHasError(false)
  }, [setIsExportOpen])

  useEffect(() => {
    if (errorTranslation || categoryError) {
      setHasError(true)
    }
  }, [errorTranslation, categoryError])

  const alertRef = useRef<any>()

  useEffect(() => {
    clearTimeout(alertRef.current)
    if (showMissingCatId) {
      alertRef.current = setTimeout(() => {
        setShowMissingCatId(false)
      }, 5000)
    }
  }, [showMissingCatId])

  return (
    <ModalDialog
      isOpen={isExportOpen}
      loading={loadingTranslations}
      cancelation={{
        label: 'Cancel',
        onClick: handleClose,
      }}
      confirmation={{
        label: 'Export Products',
        onClick: () => {
          if (!selectedCategory.value) {
            setShowMissingCatId(true)
            return
          }
          startDownload(selectedCategory.value)
        },
      }}
      onClose={handleClose}
    >
      {showMissingCatId ? (
        <div className="relative">
          <div className="w-100 absolute z-max overflow-hidden top-0 left-0">
            <Alert type="warning" onClose={() => setShowMissingCatId(false)}>
              Please select a Category Id
            </Alert>
          </div>
        </div>
      ) : null}
      <div style={{ minHeight: '420px' }}>
        <h3>Export Product Data for {selectedLocale}</h3>
        {loadingCategoryInfo ? (
          <Spinner />
        ) : (
          <Tabs>
            <Tab
              label="Export"
              active={tabSelected === 1}
              onClick={() => setTabSelected(1)}
            >
              <div>
                <h4>Select a category</h4>
                <AutocompleteInput
                  input={{
                    placeholder: 'Enter category name or id',
                    onChange: (term: string) => setSearchTerm(term),
                    onClear: () => {
                      setSearchTerm('')
                      setSelectedCategory({} as AutocompleteValue)
                    },
                    value: searchTerm,
                  }}
                  options={{
                    onSelect: (selectedItem: AutocompleteValue) =>
                      setSelectedCategory(selectedItem),
                    value: !searchTerm.length
                      ? []
                      : listOfOptions.slice(0, AUTOCOMPLETE_LIST_SIZE),
                    loading:
                      searchTerm.length > 0 &&
                      listOfOptions.length > AUTOCOMPLETE_LIST_SIZE,
                  }}
                />
                {hasError ? (
                  <p className="absolute c-danger i-s bottom-0-m right-0-m mr8">
                    There was an error exporting products. Please try again in a
                    few minutes.
                  </p>
                ) : null}
              </div>
            </Tab>
            <Tab
              label="See Files"
              active={tabSelected === 2}
              onClick={() => setTabSelected(2)}
            >
              <p className="i f7 tr">
                The process to translate can take a while. You can leave the
                page and check it latter.
              </p>
              <table className="w-100 mt7 tc">
                <thead>
                  <tr>
                    <th>CategoryId</th>
                    <th>Locale</th>
                    <th>Requested by</th>
                    <th>Requested At</th>
                    <th>Download</th>
                  </tr>
                </thead>
                <tbody>
                  {translationRequests
                    .slice(0, DOWNLOAD_LIST_SIZE)
                    .map((requestId) => (
                      <ExportListItem key={requestId} requestId={requestId} />
                    ))}
                </tbody>
              </table>
            </Tab>
          </Tabs>
        )}
      </div>
    </ModalDialog>
  )
}

export default ExportByCategoryIdModal
