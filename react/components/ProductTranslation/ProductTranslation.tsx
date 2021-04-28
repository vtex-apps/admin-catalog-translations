import React, { FC, SyntheticEvent, useEffect, useState, useRef } from 'react'
import {
  InputSearch,
  PageBlock,
  Spinner,
  ButtonWithIcon,
  IconDownload,
  ModalDialog,
  AutocompleteInput,
  Alert,
} from 'vtex.styleguide'
import { useLazyQuery, useQuery } from 'react-apollo'

import { useLocaleSelector } from '../LocaleSelector'
import getProductQuery from '../../graphql/getProduct.gql'
import ProductForm from './ProductForm'
import ErrorHandler from '../ErrorHandler'
import useCatalogQuery from '../../hooks/useCatalogQuery'
import GET_CATEGORIES_NAME from '../../graphql/getCategoriesName.gql'
import { filterSearchCategories, parseJSONToXLS } from '../../utils'
import GET_PRODUCT_TRANSLATION from '../../graphql/getProductTranslations.gql'

const AUTOCOMPLETE_LIST_SIZE = 6

interface AutocompleteValue {
  label: string
  value: string
}

const ProductTranslation: FC = () => {
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<AutocompleteValue>(
    {} as AutocompleteValue
  )
  const [downloading, setDownloading] = useState(false)
  const [showMissingCatId, setShowMissingCatId] = useState(false)
  const [hasError, setHasError] = useState(false)

  const {
    entryInfo,
    isLoadingOrRefetching,
    entryId,
    handleCleanSearch,
    handleEntryIdInput,
    fetchEntry,
    setMemoEntries,
    errorMessage,
  } = useCatalogQuery<
    ProductData,
    { identifier: { value: string; field: 'id' } }
  >(getProductQuery)

  const { selectedLocale, isXVtexTenant } = useLocaleSelector()

  const [
    fetchProductTranslations,
    { data: productTranslations, error: prodTranslationError },
  ] = useLazyQuery<ProductTranslations, { locale: string; categoryId: string }>(
    GET_PRODUCT_TRANSLATION,
    {
      context: {
        headers: {
          'x-vtex-locale': `${selectedLocale}`,
        },
      },
    }
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

  const handleSubmitProductId = (e: SyntheticEvent) => {
    e.preventDefault()
    if (!entryId) {
      return
    }
    setMemoEntries({})
    fetchEntry({
      variables: { identifier: { field: 'id', value: entryId } },
    })
  }

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

  const handleClose = () => {
    setSelectedCategory({} as AutocompleteValue)
    setIsExportOpen(false)
    setSearchTerm('')
    setHasError(false)
  }

  useEffect(() => {
    // eslint-disable-next-line vtex/prefer-early-return
    if (productTranslations && downloading) {
      parseJSONToXLS(productTranslations.productTranslations, {
        fileName: `category-${selectedCategory.value}-product-data-${selectedLocale}`,
        sheetName: 'product_data',
      })

      setDownloading(false)
      handleClose()
    }
  }, [productTranslations, selectedLocale, downloading, selectedCategory])

  const alertRef = useRef<any>()

  useEffect(() => {
    clearTimeout(alertRef.current)
    if (showMissingCatId) {
      alertRef.current = setTimeout(() => {
        setShowMissingCatId(false)
      }, 5000)
    }
  }, [showMissingCatId])

  useEffect(() => {
    // eslint-disable-next-line vtex/prefer-early-return
    if (prodTranslationError || categoryError) {
      setDownloading(false)
      setHasError(true)
    }
  }, [prodTranslationError, categoryError])

  const { id, ...productInfo } = entryInfo?.product || ({} as Product)

  return (
    <>
      <main>
        <div className="flex">
          <div style={{ maxWidth: '340px' }} className="mv7">
            <InputSearch
              value={entryId}
              placehoder="Search product..."
              label="Product Id"
              size="regular"
              onChange={handleEntryIdInput}
              onSubmit={handleSubmitProductId}
              onClear={handleCleanSearch}
            />
          </div>
        </div>
        {id || isLoadingOrRefetching || errorMessage ? (
          <PageBlock
            variation="full"
            title={`Product Info - ${selectedLocale}`}
          >
            {errorMessage ? (
              <ErrorHandler
                errorMessage={errorMessage}
                entryId={entryId}
                entry="Product"
              />
            ) : isLoadingOrRefetching ? (
              <Spinner />
            ) : (
              <ProductForm
                productInfo={productInfo}
                productId={entryId}
                updateMemoProducts={setMemoEntries}
              />
            )}
          </PageBlock>
        ) : null}
      </main>
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
          )}
        </div>
      </ModalDialog>
    </>
  )
}

export default ProductTranslation
