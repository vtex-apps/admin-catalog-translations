import React from 'react'

import uploadMutationFile from './graphql/uploadSkuTranslation.gql'
import entryQueryFile from './graphql/skuUploadRequests.gql'
import ImportEntriesModal from '../ImportEntriesModal'

const bucket = 'sku_translation'
const entryHeaders: EntryHeadersProduct[] = [
  'id',
  'name'
]
const entryQueryName = 'skuTranslationsUploadRequests'
const entryName = 'Sku'
const fileName = 'sku_translate_model'
const paramEntryName = 'skus'
const sheetName = 'sku_data'
const uploadMutationName = 'uploadSkuTranslations'

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
