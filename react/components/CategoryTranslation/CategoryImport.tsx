import React from 'react'

import ImportEntriesModal from '../ImportEntriesModal'
import uploadBrandTranslation from '../../graphql/uploadBrandTranslation.gql'
import brandUploadRequests from '../../graphql/brandUploadRequests.gql'

const entryHeaders: EntryHeadersCategory[] = [
  'id',
  'name',
  'description',
  'linkId',
  'title',
]

const CategoryImport = ({
  isImportOpen = false,
  handleOpenImport = () => {},
}: ComponentProps) => {
  // eslint-disable-next-line no-console
  console.log('CategoryImport')
  return (
    <>
      <ImportEntriesModal
        isImportOpen={isImportOpen}
        handleOpenImport={handleOpenImport}
        uploadEntryTranslation={uploadBrandTranslation}
        uploadEntryRequest={brandUploadRequests}
        entryHeaders={entryHeaders}
      />
    </>
  )
}

export default CategoryImport
