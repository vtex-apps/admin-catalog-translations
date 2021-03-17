import React, { FC, SyntheticEvent, useState } from 'react'
import {
  PageBlock,
  Spinner,
  InputSearch,
  ButtonWithIcon,
  IconDownload,
  ModalDialog,
  Checkbox,
} from 'vtex.styleguide'

import getCategory from '../../graphql/getCategory.gql'
import { useLocaleSelector } from '../LocaleSelector'
import ErrorHandler from '../ErrorHandler'
import CategoryForm from './CategoryForm'
import useCatalogQuery from '../../hooks/useCatalogQuery'

const CategoryTranslation: FC = () => {
  const [isExportOpen, setisExportOpen] = useState(false)
  const [onlyActive, setOnlyActive] = useState(true)
  const [downloading, setDownloading] = useState(false)

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

  const { id, ...categoryInfo } = entryInfo?.category || ({} as Category)

  const downloadCategories = async () => {
    setDownloading(true)
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve('done')
      }, 5000)
    })
    setDownloading(false)
    setisExportOpen(false)
  }

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
        onClose={() => setisExportOpen(false)}
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
        </div>
      </ModalDialog>
    </>
  )
}

export default CategoryTranslation
