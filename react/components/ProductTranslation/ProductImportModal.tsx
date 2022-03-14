import React from 'react'

import uploadMutationFile from './graphql/uploadProductTranslation.gql'
import entryQueryFile from './graphql/productUploadRequests.gql'
import ImportEntriesModal from '../ImportEntriesModal'

const bucket = 'product_translation'
const entryHeaders: EntryHeadersProduct[] = [
  'id',
  'name',
  'title',
  'description',
  'shortDescription',
  'linkId',
]
const entryQueryName = 'productTranslationsUploadRequests'
const entryName = 'Product'
const fileName = 'product_translate_model'
const paramEntryName = 'products'
const sheetName = 'product_data'
const uploadMutationName = 'uploadProductTranslations'

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

const ProductImportModal = ({
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

export default ProductImportModal
