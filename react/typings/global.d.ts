type HandleOpen = (open: boolean) => void

interface ComponentProps {
  isExportOpen?: boolean
  handleOpenExport?: HandleOpen
  isImportOpen?: boolean
  handleOpenImport?: HandleOpen
}
