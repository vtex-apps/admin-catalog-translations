import React from 'react'

import ImportEntriesModal from '../ImportEntriesModal'
import uploadMutationFile from '../../graphql/uploadCategoryTranslations.gql'
import entryQueryFile from '../../graphql/categoryTranslationsUploadRequests.gql'

const bucket = 'category-transl'
const entryHeaders: EntryHeadersCategory[] = [
  'id',
  'name',
  'description',
  'linkId',
  'title',
]
const entryQueryName = 'categoryTranslationsUploadRequests'
const entryName = 'Category'
const fileName = 'category_translate_model'
const paramEntryName = 'categories'
const sheetName = 'category_data'
const uploadMutationName = 'uploadCategoryTranslations'

const settings: ImportEntriesSettings = {
  bucket,
  entryHeaders,
  entryQueryFile,
  entryQueryName,
  entryName,
  fileName,
  paramEntryName,
  sheetName,
  uploadMutationFile,
  uploadMutationName,
}

const CategoryImport = ({
  isImportOpen = false,
  handleOpenImport = () => {},
}: ComponentProps) => {
  return (
    <>
      <ImportEntriesModal
        isImportOpen={isImportOpen}
        handleOpenImport={handleOpenImport}
        settings={settings}
      />
    </>
  )
}

export default CategoryImport
