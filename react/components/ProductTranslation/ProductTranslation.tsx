import React, { FC, SyntheticEvent, useState } from 'react'
import {
  InputSearch,
  PageBlock,
  Spinner,
  ButtonWithIcon,
  IconDownload,
  ModalDialog,
  AutocompleteInput,
} from 'vtex.styleguide'
import { useQuery } from 'react-apollo'

import { useLocaleSelector } from '../LocaleSelector'
import getProductQuery from '../../graphql/getProduct.gql'
import ProductForm from './ProductForm'
import ErrorHandler from '../ErrorHandler'
import useCatalogQuery from '../../hooks/useCatalogQuery'
import GET_CATEGORIES_NAME from '../../graphql/getCategoriesName.gql'
import { filterSearchCategories } from '../../utils'

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

  const { data: categoryInfo, loading: loadingCategoryInfo, error } = useQuery<
    CategoriesNameAndId
  >(GET_CATEGORIES_NAME)

  // eslint-disable-next-line no-console
  console.log({ error })

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
  const { id, ...productInfo } = entryInfo?.product || ({} as Product)

  const hasCategorySelected = !!selectedCategory.label

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
          {isXVtexTenant ? null : (
            <div className="mv7 self-end ml7">
              <ButtonWithIcon
                name="export-product"
                type="button"
                icon={<IconDownload />}
                variation="primary"
                onClick={() => setIsExportOpen(true)}
              >
                Export
              </ButtonWithIcon>
            </div>
          )}
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
        cancelation={{
          label: 'Cancel',
          onClick: () => {
            setIsExportOpen(false)
            setSearchTerm('')
          },
        }}
        confirmation={{
          label: 'Export Products',
          // eslint-disable-next-line no-console
          onClick: () => console.log('export'),
          disabled: true,
        }}
        onClose={() => {
          setIsExportOpen(false)
          setSearchTerm('')
        }}
      >
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
              {hasCategorySelected ? (
                <div>
                  <p>
                    {`Download product information from category ${selectedCategory.label}`}
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </ModalDialog>
    </>
  )
}

export default ProductTranslation
