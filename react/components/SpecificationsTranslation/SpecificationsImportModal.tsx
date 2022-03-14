import React from 'react'

import uploadMutationFile from './graphql/uploadFieldTranslationsImport.gql'
import entryQueryFile from './graphql/fieldTranslationsUploadRequests.gql'
import ImportEntriesModal from '../ImportEntriesModal'

const bucket = 'field-translation'
const entryHeaders: EntryHeadersSpecifications[] = ['fieldId', 'name']
const entryQueryName = 'fieldTranslationsUploadRequests'
const entryName = 'Specification'
const fileName = 'specification_translate_model'
const paramEntryName = 'fields'
const sheetHeaders = ['fieldId']
const sheetName = 'specification_data'
const uploadMutationName = 'uploadFieldTranslationsImport'

const settings: ImportEntriesSettings = {
  bucket,
  entryHeaders,
  entryQueryFile,
  entryQueryName,
  entryName,
  fileName,
  paramEntryName,
  sheetHeaders,
  sheetName,
  uploadMutationFile,
  uploadMutationName,
}
const SpecificationImportModal = ({
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

export default SpecificationImportModal
