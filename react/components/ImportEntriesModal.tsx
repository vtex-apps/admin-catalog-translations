import React, { useState } from 'react'
import { useMutation, useQuery } from 'react-apollo'
import { ModalDialog, ButtonPlain, Dropzone, Tabs, Tab } from 'vtex.styleguide'
import { FormattedMessage } from 'react-intl'

import {
  sanitizeImportJSON,
  parseXLSToJSON,
  parseJSONToXLS,
  getValueByKey,
} from '../utils'
import WarningAndErrorsImportModal from './WarningAndErrorsImportModal'
import { useLocaleSelector } from './LocaleSelector'
import ImportStatusList from './ImportStatusList'

const UPLOAD_LIST_SIZE = 10

const ImportEntriesModal = ({
  isImportOpen = false,
  handleOpenImport = () => {},
  settings,
}: ImportEntries) => {
  const {
    uploadMutationFile,
    entryQueryFile,
    entryHeaders,
    sheetName,
    fileName,
    paramEntryName,
    entryQueryName,
    uploadMutationName,
    bucket,
    entryName,
  } = settings

  const [errorParsingFile, setErrorParsingFile] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorModal, setErrorModal] = useState(false)
  const [warningModal, setWarningModal] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Message[]>([])
  const [validationWarnings, setValidationWarnings] = useState<Message[]>([])
  const [originalFile, setOriginalFile] = useState<Array<{}>>([])
  const [formattedTranslations, setFormattedTranslations] = useState<
    Blob | undefined
  >(undefined)

  const [tabSelected, setTabSelected] = useState<1 | 2>(1)
  const { selectedLocale } = useLocaleSelector()

  const handleFile = async (files: FileList) => {
    if (loading) {
      return
    }

    setLoading(true)

    try {
      const fileParsed = await parseXLSToJSON(files[0], {
        sheetName,
      })

      setOriginalFile(fileParsed)

      const [translations, { errors, warnings }] = sanitizeImportJSON({
        data: fileParsed,
        entryHeaders,
        requiredHeaders: ['id'],
      })

      if (errors.length) {
        setValidationErrors(errors)
      }

      if (warnings.length) {
        setValidationWarnings(warnings)
      }

      const blob = new Blob([JSON.stringify(translations, null, 2)], {
        type: 'application/json',
      })

      setFormattedTranslations(blob)
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
    setFormattedTranslations(undefined)
    cleanErrors()
  }

  const createModel = () => {
    const headersObject = entryHeaders.reduce<
      Record<typeof entryHeaders[number], string>
    >((obj, header) => {
      obj[header] = ''
      return obj
    }, {} as Record<typeof entryHeaders[number], string>)

    parseJSONToXLS([headersObject], {
      fileName,
      sheetName,
    })
  }

  const [startEntriesUpload, { error: uploadError }] = useMutation<
    {
      [key: string]: string
    },
    {
      [key: string]: string | Blob
    }
  >(uploadMutationFile)

  const { data, updateQuery } = useQuery<{
    [key: string]: string[]
  }>(entryQueryFile)

  const handleUploadRequest = async () => {
    if (!formattedTranslations) {
      return
    }

    const { data: newRequest } = await startEntriesUpload({
      variables: {
        locale: selectedLocale,
        [paramEntryName]: formattedTranslations,
      },
    })

    const request = newRequest
      ? getValueByKey(newRequest, uploadMutationName)
      : null

    // eslint-disable-next-line vtex/prefer-early-return
    if (request) {
      updateQuery((prevResult) => {
        return {
          [entryQueryName]: [request, ...(prevResult[entryQueryName] ?? [])],
        }
      })
      setTabSelected(2)
    }
  }

  return (
    <ModalDialog
      loading={loading}
      cancelation={{
        label: (
          <FormattedMessage id="catalog-translation.import.modal.cancelation" />
        ),
        onClick: () => {
          handleOpenImport(false)
          cleanErrors()
        },
      }}
      confirmation={{
        label: (
          <FormattedMessage id="catalog-translation.import.modal.confirmation" />
        ),
        onClick: () => {
          if (errorParsingFile) {
            return
          }
          handleUploadRequest()
        },
      }}
      isOpen={isImportOpen}
      onClose={() => {
        handleOpenImport(false)
        cleanErrors()
      }}
    >
      <h3>
        <FormattedMessage
          id="catalog-translation.import.modal.entry-name-header"
          values={{
            selectedLocale,
            entryName,
          }}
        />
      </h3>
      <div>
        <Tabs>
          <Tab
            label={
              <FormattedMessage id="catalog-translation.import.modal.import-tab" />
            }
            active={tabSelected === 1}
            onClick={() => {
              setTabSelected(1)
              handleReset()
            }}
          >
            <div>
              <div className="mv4">
                <ButtonPlain onClick={createModel}>
                  <FormattedMessage id="catalog-translation.import.modal.download-button" />
                </ButtonPlain>
              </div>
              <div>
                <Dropzone
                  accept=".xlsx"
                  onDropAccepted={handleFile}
                  onFileReset={handleReset}
                >
                  <div className="pt7">
                    <span className="f4">
                      <FormattedMessage id="catalog-translation.import.modal.dropzone" />
                    </span>
                    <span className="f4 c-link" style={{ cursor: 'pointer' }}>
                      <FormattedMessage id="catalog-translation.import.modal.dropzone-choose-file" />
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
                <li>
                  {originalFile?.length}{' '}
                  <FormattedMessage id="catalog-translation.import.modal.total-entries" />
                </li>
              ) : null}
              {validationWarnings.length ? (
                <li>
                  <ButtonPlain onClick={() => setWarningModal(true)}>
                    {validationWarnings.length}{' '}
                    <FormattedMessage id="catalog-translation.import.modal.total-warnings" />
                  </ButtonPlain>
                </li>
              ) : null}
              {validationErrors.length ? (
                <li>
                  <ButtonPlain
                    variation="danger"
                    onClick={() => setErrorModal(true)}
                  >
                    {validationErrors.length}{' '}
                    <FormattedMessage id="catalog-translation.import.modal.total-errors" />
                  </ButtonPlain>
                </li>
              ) : null}
            </ul>
            {uploadError ? (
              <p className="absolute c-danger i-s bottom-0-m right-0-m mr8">
                <FormattedMessage id="catalog-translation.import.modal.error-uploading" />
              </p>
            ) : null}
          </Tab>
          <Tab
            label={
              <FormattedMessage id="catalog-translation.import.modal.request-tab" />
            }
            active={tabSelected === 2}
            onClick={() => {
              setTabSelected(2)
              handleReset()
            }}
          >
            <table className="w-100 mt7 tc">
              <thead>
                <tr>
                  <th>
                    <FormattedMessage id="catalog-translation.import.modal.table-header.locale" />
                  </th>
                  <th>
                    <FormattedMessage id="catalog-translation.import.modal.table-header.translated-by" />
                  </th>
                  <th>
                    <FormattedMessage id="catalog-translation.import.modal.table-header.created-at" />
                  </th>
                  <th>
                    <FormattedMessage id="catalog-translation.import.modal.table-header.progress" />
                  </th>
                  <th>
                    <FormattedMessage id="catalog-translation.import.modal.table-header.total-translated" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {data?.[entryQueryName]
                  ?.slice(0, UPLOAD_LIST_SIZE)
                  .map((requestId) => (
                    <ImportStatusList
                      requestId={requestId}
                      key={requestId}
                      bucket={bucket}
                    />
                  ))}
              </tbody>
            </table>
          </Tab>
        </Tabs>
      </div>
      <WarningAndErrorsImportModal
        isOpen={warningModal}
        modalName="Warning Modal"
        handleClose={setWarningModal}
        data={validationWarnings}
      />
      <WarningAndErrorsImportModal
        isOpen={errorModal}
        modalName="Error Modal"
        handleClose={setErrorModal}
        data={validationErrors}
      />
    </ModalDialog>
  )
}

export default ImportEntriesModal
