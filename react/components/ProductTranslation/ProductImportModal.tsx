import React, { useState } from 'react'
import {
  ModalDialog,
  ButtonPlain,
  Dropzone,
  Modal,
  Pagination,
  Table,
} from 'vtex.styleguide'

import { sanitizeImportJSON, parseXLSToJSON } from '../../utils'

const categoryHeaders: Array<keyof Product | 'locale'> = [
  'id',
  'name',
  'title',
  'description',
  'shortDescription',
  'locale',
]

const tableSchema = {
  properties: {
    line: {
      title: 'Line',
    },
    missingFields: {
      title: 'Missing Fields',
      // eslint-disable-next-line react/display-name
      cellRenderer: ({ cellData }: { cellData: string[] }) => (
        <p>{cellData.join(', ')}</p>
      ),
    },
  },
}

const ProductImportModal = ({
  isImportOpen = false,
  handleOpenImport = () => {},
}: ComponentProps) => {
  const [errorParsingFile, setErrorParsingFile] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorModal, setErrorModal] = useState(false)
  const [warningModal, setWarningModal] = useState(false)
  const [validtionErrors, setValidationErrors] = useState<Message[]>([])
  const [validtionWarnings, setValidationWarnings] = useState<Message[]>([])
  const [originalFile, setOriginalFile] = useState<Array<{}>>([])

  const handleFile = async (files: FileList) => {
    if (loading) {
      return
    }

    setLoading(true)

    try {
      const fileParsed = await parseXLSToJSON(files[0], {
        sheetName: 'product_data',
      })

      setOriginalFile(fileParsed)

      const [translations, { errors, warnings }] = sanitizeImportJSON<Product>({
        data: fileParsed,
        entryHeaders: categoryHeaders,
        requiredHeaders: ['id', 'locale'],
      })

      if (errors.length) {
        setValidationErrors(errors)
      }

      if (warnings.length) {
        setValidationWarnings(warnings)
      }

      // eslint-disable-next-line no-console
      console.log({ translations, errors, warnings })
    } catch (e) {
      setErrorParsingFile(e)
    } finally {
      setLoading(false)
    }
  }

  const cleanErrors = () => {
    setValidationErrors([])
    setErrorParsingFile('')
    setValidationWarnings([])
    setOriginalFile([])
  }

  const handleReset = () => {
    if (loading) {
      return
    }

    cleanErrors()
  }

  // eslint-disable-next-line no-console
  console.log({ errorParsingFile })

  return (
    <ModalDialog
      loading={loading}
      cancelation={{
        label: 'Cancel',
        onClick: () => {
          handleOpenImport(false)
          cleanErrors()
        },
      }}
      confirmation={{
        label: 'Send Translations',
        onClick: () => {
          if (errorParsingFile) {
            return
          }
          // eslint-disable-next-line no-console
          console.log('submit translations')
        },
      }}
      isOpen={isImportOpen}
      onClose={() => {
        handleOpenImport(false)
        cleanErrors()
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
        {errorParsingFile ? (
          <p className="c-danger i f7">{errorParsingFile}</p>
        ) : null}
      </div>
      <ul>
        {originalFile.length ? (
          <li>{originalFile?.length} total entries</li>
        ) : null}
        {validtionWarnings.length ? (
          <li>
            <ButtonPlain onClick={() => setWarningModal(true)}>
              {validtionWarnings.length} warnings.
            </ButtonPlain>
          </li>
        ) : null}
        {validtionErrors.length ? (
          <li>
            <ButtonPlain variation="danger" onClick={() => setErrorModal(true)}>
              {validtionErrors.length} errors. The entries will be ignored.
            </ButtonPlain>
          </li>
        ) : null}
      </ul>
      <Modal isOpen={warningModal} onClose={() => setWarningModal(false)}>
        <Pagination
          currentItemFrom={1}
          currentItemTo={10}
          textOf="of"
          totalItems={validtionWarnings.length}
        >
          <div>Warning Modal</div>
          <Table
            fullWidth
            items={validtionWarnings.slice(0, 10)}
            density="high"
            schema={tableSchema}
          />
        </Pagination>
      </Modal>
      <Modal isOpen={errorModal} onClose={() => setErrorModal(false)}>
        <Pagination
          currentItemFrom={1}
          currentItemTo={10}
          textOf="of"
          totalItems={validtionErrors.length}
        >
          <div>Error Modal</div>
          <Table
            fullWidth
            items={validtionErrors.slice(0, 10)}
            density="high"
            schema={tableSchema}
          />
        </Pagination>
      </Modal>
    </ModalDialog>
  )
}

export default ProductImportModal
