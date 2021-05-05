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
import { filterSearchCategories, parseJSONToXLS } from '../../utils'
import ExportListItem from './ExportListItem'

const AUTOCOMPLETE_LIST_SIZE = 6

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
    fetchProductTranslations,
    { data: productTranslations, error: prodTranslationError },
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
  // eslint-disable-next-line no-console
  console.log({ productTranslations })

  const { data: translationRequests } = useQuery<ProdTranslationRequests>(
    PROD_TRANSLATION_REQUESTS
  )

  // eslint-disable-next-line no-console
  console.log({ translationRequests })

  const handleClose = useCallback(() => {
    setSelectedCategory({} as AutocompleteValue)
    setIsExportOpen(false)
    setSearchTerm('')
    setHasError(false)
  }, [setIsExportOpen])

  // useEffect(() => {
  //   // eslint-disable-next-line vtex/prefer-early-return
  //   if (productTranslations && downloading) {
  //     parseJSONToXLS(productTranslations.productTranslations, {
  //       fileName: `category-${selectedCategory.value}-product-data-${selectedLocale}`,
  //       sheetName: 'product_data',
  //     })

  //     setDownloading(false)
  //     handleClose()
  //   }
  // }, [
  //   productTranslations,
  //   selectedLocale,
  //   downloading,
  //   selectedCategory,
  //   handleClose,
  // ])

  useEffect(() => {
    // eslint-disable-next-line vtex/prefer-early-return
    if (prodTranslationError || categoryError) {
      setDownloading(false)
      setHasError(true)
    }
  }, [prodTranslationError, categoryError])

  const downloadProducts = () => {
    if (!selectedCategory.value) {
      setShowMissingCatId(true)
      return
    }
    setDownloading(true)
    fetchProductTranslations({
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
        onClick: downloadProducts,
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
                <p className="i f7">
                  Currently, the app allows to export 1.600 products every 3
                  minutes
                </p>
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
                <tr>
                  <th>CategoryId</th>
                  <th>Locale</th>
                  <th>Requested by</th>
                  <th>Requested At</th>
                  <th>Download</th>
                </tr>
                {translationRequests?.productTranslationRequests.map(
                  (requestId) => (
                    <ExportListItem key={requestId} requestId={requestId} />
                  )
                )}
              </table>
            </Tab>
          </Tabs>
        )}
      </div>
    </ModalDialog>
  )
}

export default ProductExportModal
