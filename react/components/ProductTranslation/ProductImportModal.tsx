import React, { useState } from 'react'
import { ModalDialog, ButtonPlain, Dropzone } from 'vtex.styleguide'

import { sanitizeImportJSON, parseXLSToJSON } from '../../utils'
import WarningAndErrorsImportModal from '../WarningAndErrorsImportModal'

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
      <WarningAndErrorsImportModal
        isOpen={warningModal}
        modalName="Warning Modal"
        handleClose={setWarningModal}
        data={validtionWarnings}
      />
      <WarningAndErrorsImportModal
        isOpen={errorModal}
        modalName="Error Modal"
        handleClose={setErrorModal}
        data={validtionErrors}
      />
    </ModalDialog>
  )
}

export default ProductImportModal
