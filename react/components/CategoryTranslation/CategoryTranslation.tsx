import React, { FC, SyntheticEvent, useEffect, useState } from 'react'
import {
  PageBlock,
  Spinner,
  InputSearch,
  ButtonWithIcon,
  IconDownload,
  ModalDialog,
  Checkbox,
} from 'vtex.styleguide'
import { useLazyQuery } from 'react-apollo'

import getCategory from '../../graphql/getCategory.gql'
import { useLocaleSelector } from '../LocaleSelector'
import ErrorHandler from '../ErrorHandler'
import CategoryForm from './CategoryForm'
import useCatalogQuery from '../../hooks/useCatalogQuery'
import getAllCategories from '../../graphql/getAllCategories.gql'
import { parseJSONToXLS } from '../../utils'

interface CategoryTranslations {
  categoryTranslations: Category[]
}

const CategoryTranslation: FC = () => {
  const [isExportOpen, setisExportOpen] = useState(false)
  const [onlyActive, setOnlyActive] = useState(true)
  const [downloading, setDownloading] = useState(false)
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
  } = useCatalogQuery<CategoriesData, { id: number }>(getCategory)

  const { selectedLocale, isXVtexTenant } = useLocaleSelector()

  const [fetchCategories, { data, error }] = useLazyQuery<
    CategoryTranslations,
    { locale: string; active?: boolean }
  >(getAllCategories)

  const handleSubmitCategoryId = (e: SyntheticEvent) => {
    e.preventDefault()
    if (!entryId) {
      return
    }
    setMemoEntries({})
    fetchEntry({ variables: { id: Number(entryId) } })
  }

  const { id, ...categoryInfo } = entryInfo?.category || ({} as Category)

  const downloadCategories = () => {
    setDownloading(true)
    fetchCategories({
      variables: { active: onlyActive, locale: selectedLocale },
    })
  }

  useEffect(() => {
    // eslint-disable-next-line vtex/prefer-early-return
    if (data) {
      parseJSONToXLS(data.categoryTranslations, {
        fileName: 'category-data',
        sheetName: 'category_data',
      })

      setDownloading(false)
      setisExportOpen(false)
    }
  }, [data, error])

  useEffect(() => {
    // eslint-disable-next-line vtex/prefer-early-return
    if (error) {
      setDownloading(false)
      setHasError(true)
    }
  }, [error])

  return (
    <>
      <main>
        <div className="flex">
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
          {isXVtexTenant ? null : (
            <div className="mv7 self-end ml7">
              <ButtonWithIcon
                name="export-category"
                type="button"
                icon={<IconDownload />}
                variation="primary"
                onClick={() => setisExportOpen(true)}
              >
                Export
              </ButtonWithIcon>
            </div>
          )}
        </div>
        {id || isLoadingOrRefetching || errorMessage ? (
          <PageBlock
            variation="full"
            title={`Category Info - ${selectedLocale}`}
          >
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
                updateMemoCategories={setMemoEntries}
              />
            )}
          </PageBlock>
        ) : null}
      </main>
      <ModalDialog
        loading={downloading}
        cancelation={{
          label: 'Cancel',
          onClick: () => setisExportOpen(false),
        }}
        confirmation={{
          label: 'Export Categories',
          onClick: downloadCategories,
        }}
        isOpen={isExportOpen}
        onClose={() => {
          setisExportOpen(false)
          setHasError(false)
        }}
      >
        <div>
          <h3>Export Category Data for {selectedLocale}</h3>
          <Checkbox
            label="Export only Active Categories"
            name="active-selection"
            value={onlyActive}
            checked={onlyActive}
            onChange={() => setOnlyActive(!onlyActive)}
          />
          {hasError ? <p>There was an error</p> : null}
        </div>
      </ModalDialog>
    </>
  )
}

export default CategoryTranslation
