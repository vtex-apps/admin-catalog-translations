import React from 'react'

import uploadMutationFile from './graphql/uploadBrandTranslation.gql'
import entryQueryFile from './graphql/brandUploadRequests.gql'
import ImportEntriesModal from '../ImportEntriesModal'

const bucket = 'brand_translation'
const entryHeaders: EntryHeadersCategory[] = [
  'id',
  'name',
  'description',
  'linkId',
  'title',
]
const entryQueryName = 'brandTranslationsUploadRequests'
const entryName = 'Brand'
const fileName = 'brand_translate_model'
const paramEntryName = 'brands'
const sheetName = 'brands_data'
const uploadMutationName = 'uploadBrandTranslations'

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

const BrandImportModal = ({
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

export default BrandImportModal
