import React, { useState } from 'react'
import { ModalDialog, ButtonPlain, Dropzone } from 'vtex.styleguide'

import { sanitizeImportJSON, parseXLSToJSON } from '../../utils'

const categoryHeaders: Array<keyof Product | 'locale'> = [
  'id',
  'name',
  'title',
  'description',
  'shortDescription',
  'locale',
]

const ProductImportModal = ({
  isImportOpen = false,
  handleOpenImport = () => {},
}: ComponentProps) => {
  const [error, setError] = useState('')

  const handleFile = async (files: FileList) => {
    try {
      const fileReader = await parseXLSToJSON(files[0], {
        sheetName: 'product_data',
      })

      const [translations, { errors, warnings }] = sanitizeImportJSON<Product>({
        data: fileReader,
        entryHeaders: categoryHeaders,
        requiredHeaders: ['id', 'locale'],
      })

      // eslint-disable-next-line no-console
      console.log({ translations, errors, warnings })
    } catch (e) {
      setError(e)
    }
  }

  const handleReset = () => {
    setError('')
  }

  // eslint-disable-next-line no-console
  console.log({ error })

  return (
    <ModalDialog
      loading={false}
      cancelation={{
        label: 'Cancel',
        onClick: () => {
          handleOpenImport(false)
        },
      }}
      confirmation={{
        label: 'Send Translations',
        onClick: () => {},
      }}
      isOpen={isImportOpen}
      onClose={() => {
        handleOpenImport(false)
      }}
    >
      <div>
        <h3>Import Category Translations</h3>
        <ButtonPlain
          onClick={() => {
            // eslint-disable-next-line no-console
            console.log('Download model')
          }}
        >
          Download xlsx model
        </ButtonPlain>
        <Dropzone
          accept=".xlsx"
          onDropAccepted={handleFile}
          onFileReset={handleReset}
        >
          <div className="pt7">
            <span className="f4">Drop here your XLSX or </span>
            <span className="f4 c-link" style={{ cursor: 'pointer' }}>
              choose a file
            </span>
          </div>
        </Dropzone>
      </div>
    </ModalDialog>
  )
}

export default ProductImportModal
