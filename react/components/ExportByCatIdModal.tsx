import React, { useCallback, useEffect, useRef, useState } from 'react'
import { FormattedMessage, useIntl, defineMessages } from 'react-intl'
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
import { DOWNLOAD_LIST_SIZE, filterSearchCategories } from '../utils'
import { useLocaleSelector } from './LocaleSelector'
import ExportListItem from './ExportListItem'

const AUTOCOMPLETE_LIST_SIZE = 6

interface AutocompleteValue {
  label: string
  value: string
}

interface Options {
  variables: {
    requestId: string
  }
}

type typeItem = 'product' | 'sku'

interface Props {
  isExportOpen: boolean
  setIsExportOpen: (open: boolean) => void
  translationRequests: string[]
  startDownload: (categoryId: string) => void
  errorTranslation?: ApolloError
  loadingTranslations: boolean
  hasNewRequest: boolean
  download: (options: Options) => void
  downloadJson: any
  downloadError?: ApolloError
  type: typeItem
}

export const ExportByCategoryIdModal = ({
  isExportOpen,
  setIsExportOpen,
  translationRequests = [],
  startDownload,
  errorTranslation,
  loadingTranslations,
  hasNewRequest,
  type,
  ...props
}: Props) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [hasError, setHasError] = useState(false)
  const [showMissingCatId, setShowMissingCatId] = useState(false)
  const { selectedLocale } = useLocaleSelector()
  const [tabSelected, setTabSelected] = useState<1 | 2>(1)
  const intl = useIntl()

  const headerEntityMessage = defineMessages({
    product: {
      id: 'catalog-translation.export.modal.header-product',
    },
    sku: {
      id: 'catalog-translation.export.modal.header-sku',
    },
  })

  const confirmationButtonLabel = defineMessages({
    product: {
      id: 'catalog-translation.export.modal.confirmation-products',
    },
    sku: {
      id: 'catalog-translation.export.modal.confirmation-skus',
    },
  })

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
        label: (
          <FormattedMessage id="admin/catalog-translation.export.modal.cancelation" />
        ),
        onClick: handleClose,
      }}
      confirmation={{
        label: intl.formatMessage(confirmationButtonLabel[type]),
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
              <FormattedMessage id="admin/catalog-translation.export.modal.missing-category-id" />
            </Alert>
          </div>
        </div>
      ) : null}
      <div style={{ minHeight: '420px' }}>
        <h3>
          <FormattedMessage
            id="admin/catalog-translation.export.modal.header"
            values={{
              selectedLocale,
              entry: intl.formatMessage(headerEntityMessage[type]),
            }}
          />
        </h3>
        {loadingCategoryInfo ? (
          <Spinner />
        ) : (
          <Tabs>
            <Tab
              label={
                <FormattedMessage id="admin/catalog-translation.export.modal.export-tab" />
              }
              active={tabSelected === 1}
              onClick={() => setTabSelected(1)}
            >
              <div>
                <h4>
                  <FormattedMessage id="admin/catalog-translation.export.modal.search-header" />
                </h4>
                <AutocompleteInput
                  input={{
                    placeholder: intl.formatMessage({
                      id:
                        'catalog-translation.export.modal.category-search-placeholder',
                    }),
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
                    <FormattedMessage id="admin/catalog-translation.export.modal.error-exporting" />
                  </p>
                ) : null}
              </div>
            </Tab>
            <Tab
              label={
                <FormattedMessage id="admin/catalog-translation.export.modal.see-files-tab" />
              }
              active={tabSelected === 2}
              onClick={() => setTabSelected(2)}
            >
              <p className="i f7 tr">
                <FormattedMessage id="admin/catalog-translation.export.modal.long-process.warning" />
              </p>
              <table className="w-100 mt7 tc">
                <thead>
                  <tr>
                    <th>
                      <FormattedMessage id="admin/catalog-translation.export.modal.table-header.catId" />
                    </th>
                    <th>
                      <FormattedMessage id="admin/catalog-translation.export.modal.table-header.locale" />
                    </th>
                    <th>
                      <FormattedMessage id="admin/catalog-translation.export.modal.table-header.requested.by" />
                    </th>
                    <th>
                      <FormattedMessage id="admin/catalog-translation.export.modal.table-header.requested.at" />
                    </th>
                    <th>
                      <FormattedMessage id="admin/catalog-translation.export.modal.table-header.download" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {translationRequests
                    .slice(0, DOWNLOAD_LIST_SIZE)
                    .map((requestId) => (
                      <ExportListItem
                        key={requestId}
                        requestId={requestId}
                        type={type}
                        {...props}
                      />
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
