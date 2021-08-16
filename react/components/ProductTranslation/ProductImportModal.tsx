import React, { useState } from 'react'
import { ModalDialog, ButtonPlain, Dropzone, Tabs, Tab } from 'vtex.styleguide'

import { sanitizeImportJSON, parseXLSToJSON, parseJSONToXLS } from '../../utils'
import { useLocaleSelector } from '../LocaleSelector'
import WarningAndErrorsImportModal from '../WarningAndErrorsImportModal'

const categoryHeaders: Array<keyof Product> = [
  'id',
  'name',
  'title',
  'description',
  'shortDescription',
]

const PRODUCT_DATA = 'product_data'

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
  const [translationsAdj, setTranslationsAdj] = useState<
    Array<Record<EntryHeaders<Product>, string>>
  >([])

  const [tabSelected, setTabSelected] = useState<1 | 2>(1)
  const { selectedLocale } = useLocaleSelector()

  const handleFile = async (files: FileList) => {
    if (loading) {
      return
    }

    setLoading(true)

    try {
      const fileParsed = await parseXLSToJSON(files[0], {
        sheetName: PRODUCT_DATA,
      })

      setOriginalFile(fileParsed)

      const [translations, { errors, warnings }] = sanitizeImportJSON<Product>({
        data: fileParsed,
        entryHeaders: categoryHeaders,
        requiredHeaders: ['id'],
      })

      if (errors.length) {
        setValidationErrors(errors)
      }

      if (warnings.length) {
        setValidationWarnings(warnings)
      }

      setTranslationsAdj(translations)
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
    setOriginalFile([])
    setTranslationsAdj([])
    cleanErrors()
  }

  const createModel = () => {
    const headersObject = categoryHeaders.reduce<
      Record<typeof categoryHeaders[number], string>
    >((obj, header) => {
      obj[header] = ''
      return obj
    }, {} as Record<typeof categoryHeaders[number], string>)

    parseJSONToXLS([headersObject], {
      fileName: 'product_translate_model',
      sheetName: PRODUCT_DATA,
    })
  }

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
          console.log({ translationsAdj })
        },
      }}
      isOpen={isImportOpen}
      onClose={() => {
        handleOpenImport(false)
        cleanErrors()
      }}
    >
      <h3>{`Import Category Translations for ${selectedLocale}`}</h3>
      <div>
        <Tabs>
          <Tab
            label="Import"
            active={tabSelected === 1}
            onClick={() => {
              setTabSelected(1)
            }}
          >
            <div>
              <div className="mv4">
                <ButtonPlain onClick={createModel}>
                  Download xlsx model
                </ButtonPlain>
              </div>
              <div>
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
                  <ButtonPlain
                    variation="danger"
                    onClick={() => setErrorModal(true)}
                  >
                    {validtionErrors.length} errors. The entries will be
                    ignored.
                  </ButtonPlain>
                </li>
              ) : null}
            </ul>
          </Tab>
          <Tab
            label="Requests"
            active={tabSelected === 2}
            onClick={() => setTabSelected(2)}
          >
            <div>Request list</div>
          </Tab>
        </Tabs>
      </div>
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
