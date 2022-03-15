import React, { SyntheticEvent } from 'react'
import { InputSearch, PageBlock, Spinner } from 'vtex.styleguide'

import { useLocaleSelector } from '../LocaleSelector'
import getProductQuery from './graphql/getProduct.gql'
import ProductForm from './ProductForm'
import ErrorHandler from '../ErrorHandler'
import useCatalogQuery from '../../hooks/useCatalogQuery'
import ProductExportModal from './ProductExportModal'
import ProductImportModal from './ProductImportModal'

const ProductTranslation = ({
  isExportOpen = false,
  handleOpenExport = () => {},
  isImportOpen = false,
  handleOpenImport = () => {},
}: ComponentProps) => {
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

  const { selectedLocale } = useLocaleSelector()

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
      <ProductExportModal
        isExportOpen={isExportOpen}
        setIsExportOpen={handleOpenExport}
      />
      <ProductImportModal
        isImportOpen={isImportOpen}
        handleOpenImport={handleOpenImport}
      />
    </>
  )
}

export default ProductTranslation
