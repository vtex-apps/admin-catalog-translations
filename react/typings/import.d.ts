type BucketName = 'brand-translation' | 'product-translation'

interface ImportEntriesSettings {
  bucket: BucketName
  entryHeaders: EntryHeaders[]
  entryQueryFile: DocumentNode
  entryQueryName: string
  entryName: string
  fileName: string
  paramEntryName: string
  sheetName: string
  uploadMutationFile: DocumentNode
  uploadMutationName: string
}

interface ImportEntries extends ComponentProps {
  settings: ImportEntriesSettings
}
