import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  ModalDialog,
  Alert,
  AutocompleteInput,
  Spinner,
  Tabs,
  Tab,
} from 'vtex.styleguide'
import { useLazyQuery, useQuery } from 'react-apollo'

import { useLocaleSelector } from '../LocaleSelector'
import START_PRODUCT_TRANSLATION from '../../graphql/startProductTranslations.gql'
import GET_CATEGORIES_NAME from '../../graphql/getCategoriesName.gql'
import PROD_TRANSLATION_REQUESTS from '../../graphql/getProductTranslationRequests.gql'
import { filterSearchCategories } from '../../utils'
import ExportListItem from './ExportListItem'

const AUTOCOMPLETE_LIST_SIZE = 6
const DOWNLOAD_LIST_SIZE = 6

interface AutocompleteValue {
  label: string
  value: string
}

interface Props {
  isExportOpen: boolean
  setIsExportOpen: (open: boolean) => void
}

const ProductExportModal = ({ isExportOpen, setIsExportOpen }: Props) => {
  const [downloading, setDownloading] = useState(false)
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

  const [
    triggerProductTranslations,
    { data: productTranslationInfo, error: prodTranslationError },
  ] = useLazyQuery<
    ProductTranslationRequest,
    { locale: string; categoryId: string }
  >(START_PRODUCT_TRANSLATION, {
    context: {
      headers: {
        'x-vtex-locale': `${selectedLocale}`,
      },
    },
  })

  const { data: translationRequests, updateQuery } = useQuery<
    ProdTranslationRequests
  >(PROD_TRANSLATION_REQUESTS)

  useEffect(() => {
    const { requestId } = productTranslationInfo?.productTranslations ?? {}

    // eslint-disable-next-line vtex/prefer-early-return
    if (requestId) {
      updateQuery((prevResult) => {
        return {
          productTranslationRequests: [
            requestId,
            ...prevResult.productTranslationRequests,
          ],
        }
      })
      setDownloading(false)
      setTabSelected(2)
    }
  }, [productTranslationInfo, updateQuery])

  const handleClose = useCallback(() => {
    setSelectedCategory({} as AutocompleteValue)
    setIsExportOpen(false)
    setSearchTerm('')
    setHasError(false)
  }, [setIsExportOpen])

  useEffect(() => {
    // eslint-disable-next-line vtex/prefer-early-return
    if (prodTranslationError || categoryError) {
      setDownloading(false)
      setHasError(true)
    }
  }, [prodTranslationError, categoryError])

  const startDownloadProducts = () => {
    if (!selectedCategory.value) {
      setShowMissingCatId(true)
      return
    }
    setDownloading(true)
    triggerProductTranslations({
      variables: { locale: selectedLocale, categoryId: selectedCategory.value },
    })
  }

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
      loading={downloading}
      cancelation={{
        label: 'Cancel',
        onClick: handleClose,
      }}
      confirmation={{
        label: 'Export Products',
        onClick: startDownloadProducts,
        disabled: true,
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
                <h4>Select category</h4>
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
                    loading: listOfOptions.length > AUTOCOMPLETE_LIST_SIZE,
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
                  {translationRequests?.productTranslationRequests
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

export default ProductExportModal
