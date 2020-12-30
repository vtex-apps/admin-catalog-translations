import React, { FC, SyntheticEvent } from 'react'
import { PageBlock, Spinner, InputSearch } from 'vtex.styleguide'

import getCategory from '../../graphql/getCategory.gql'
import { useLocaleSelector } from '../LocaleSelector'
import ErrorHandler from '../ErrorHandler'
import CategoryForm from './CategoryForm'
import useCatalogQuery from '../../hooks/useCatalogQuery'

const CategoryTranslation: FC = () => {
  const {
    entryInfo,
    isLoadingOrRefetching,
    entryId,
    handleCleanSearch,
    handleEntryIdInput,
    fetchEntry,
    setMemoEntries,
    errorMessage,
  } = useCatalogQuery<CategoriesData, { id: number }>(getCategory)

  const { selectedLocale } = useLocaleSelector()

  const handleSubmitCategoryId = (e: SyntheticEvent) => {
    e.preventDefault()
    if (!entryId) {
      return
    }
    setMemoEntries({})
    fetchEntry({ variables: { id: Number(entryId) } })
  }

  const { id, keywords, ...categoryInfo } =
    entryInfo?.category || ({} as Category)

  return (
    <main>
      <div style={{ maxWidth: '340px' }} className="mv7">
        <InputSearch
          value={entryId}
          placeholder="Search category..."
          label="Category Id"
          size="regular"
          onChange={handleEntryIdInput}
          onSubmit={handleSubmitCategoryId}
          onClear={handleCleanSearch}
        />
      </div>
      {id || isLoadingOrRefetching || errorMessage ? (
        <PageBlock variation="full" title={`Category Info - ${selectedLocale}`}>
          {errorMessage ? (
            <ErrorHandler
              errorMessage={errorMessage}
              entryId={entryId}
              entry="Category"
            />
          ) : isLoadingOrRefetching ? (
            <Spinner />
          ) : (
            <CategoryForm
              categoryInfo={categoryInfo}
              categoryId={id}
              keywords={keywords}
              updateMemoCategories={setMemoEntries}
            />
          )}
        </PageBlock>
      ) : null}
    </main>
  )
}

export default CategoryTranslation
