import React, { useEffect, useState } from 'react'
import { useLazyQuery, useQuery } from 'react-apollo'
import { ModalDialog, ButtonPlain, Dropzone, Tabs, Tab } from 'vtex.styleguide'
import { FormattedMessage } from 'react-intl'

import { sanitizeImportJSON, parseXLSToJSON, parseJSONToXLS } from '../../utils'
import { useLocaleSelector } from '../LocaleSelector'
import WarningAndErrorsImportModal from '../WarningAndErrorsImportModal'
import UPLOAD_FIELD_TRANSLATION_EXPORT from '../../graphql/uploadFieldTranslationsExport.gql'
import FIELD_UPLOAD_REQUESTS from '../../graphql/fieldUploadRequests.gql'
import DOWNLOAD_FIELD_TRANSLATION from '../../graphql/downloadFieldTranslations.gql'
import ExportListItem from '../ExportListItem'

const DOWNLOAD_LIST_SIZE = 6
const entryHeaders: Array<keyof Field> = ['fieldId']

const SPECIFICATION_DATA = 'specification_data'

interface FieldTranslations {
  uploadFieldTranslationsExport: {
    requestId: string
  }
}

const SpecificationExportModal = ({
  isExportOpen = false,
  handleOpenExport = () => {},
}: ComponentProps) => {
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
        sheetName: SPECIFICATION_DATA,
      })

      setOriginalFile(fileParsed)

      const [translations, { errors, warnings }] = sanitizeImportJSON<Field>({
        data: fileParsed,
        entryHeaders,
        requiredHeaders: ['fieldId'],
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
      fileName: 'specification_translate_model',
      sheetName: SPECIFICATION_DATA,
    })
  }

  const [
    startTranslationUpload,
    { data: newRequest, error: uploadError },
  ] = useLazyQuery<
    FieldTranslations,
    {
      locale: string
      fields: Blob
    }
  >(UPLOAD_FIELD_TRANSLATION_EXPORT, {
    context: {
      headers: {
        'x-vtex-locale': `${selectedLocale}`,
      },
    },
  })

  const { data, updateQuery } = useQuery<{
    fieldTranslationsUploadRequests: string[]
  }>(FIELD_UPLOAD_REQUESTS)

  useEffect(() => {
    const { requestId } = newRequest?.uploadFieldTranslationsExport ?? {}

    if (!requestId) {
      return
    }
    updateQuery((prevResult) => {
      return {
        fieldTranslationsUploadRequests: [
          requestId,
          ...(prevResult.fieldTranslationsUploadRequests ?? []),
        ],
      }
    })
    setTabSelected(2)
  }, [newRequest, updateQuery])

  const handleUploadRequest = async () => {
    if (!formattedTranslations) {
      return
    }

    startTranslationUpload({
      variables: {
        locale: selectedLocale,
        fields: formattedTranslations,
      },
    })
  }

  const [download, { data: downloadJson, error: downloadError }] = useLazyQuery<
    TranslationDownload<Field>,
    { requestId: string }
  >(DOWNLOAD_FIELD_TRANSLATION)

  return (
    <ModalDialog
      loading={loading}
      cancelation={{
        label: (
          <FormattedMessage id="catalog-translation.import.modal.cancelation" />
        ),
        onClick: () => {
          handleOpenExport(false)
          cleanErrors()
        },
      }}
      confirmation={{
        label: (
          <FormattedMessage id="catalog-translation.export.modal.confirmation" />
        ),
        onClick: () => {
          if (errorParsingFile) {
            return
          }
          handleUploadRequest()
        },
      }}
      isOpen={isExportOpen}
      onClose={() => {
        handleOpenExport(false)
        cleanErrors()
      }}
    >
      <h3>
        <FormattedMessage
          id="catalog-translation.export.modal.specification-header"
          values={{
            selectedLocale,
          }}
        />
      </h3>
      <div>
        <Tabs>
          <Tab
            label={
              <FormattedMessage id="catalog-translation.export.modal.export-tab" />
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
                  <FormattedMessage id="catalog-translation.export.modal.download-button" />
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
                      <FormattedMessage id="catalog-translation.export.modal.dropzone" />
                    </span>
                    <span className="f4 c-link" style={{ cursor: 'pointer' }}>
                      <FormattedMessage id="catalog-translation.export.modal.dropzone-choose-file" />
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
                  <FormattedMessage id="catalog-translation.export.modal.total-entries" />
                </li>
              ) : null}
              {validationWarnings.length ? (
                <li>
                  <ButtonPlain onClick={() => setWarningModal(true)}>
                    {validationWarnings.length}{' '}
                    <FormattedMessage id="catalog-translation.export.modal.total-warnings" />
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
                    <FormattedMessage id="catalog-translation.export.modal.total-errors" />
                  </ButtonPlain>
                </li>
              ) : null}
            </ul>
            {uploadError ? (
              <p className="absolute c-danger i-s bottom-0-m right-0-m mr8">
                <FormattedMessage id="catalog-translation.export.modal.error-uploading" />
              </p>
            ) : null}
          </Tab>
          <Tab
            label={
              <FormattedMessage id="catalog-translation.export.modal.see-files-tab" />
            }
            active={tabSelected === 2}
            onClick={() => setTabSelected(2)}
          >
            <p className="i f7 tr">
              <FormattedMessage id="catalog-translation.export.modal.long-process.warning" />
            </p>
            <table className="w-100 mt7 tc">
              <thead>
                <tr>
                  <th>
                    <FormattedMessage id="catalog-translation.export.modal.table-header.locale" />
                  </th>
                  <th>
                    <FormattedMessage id="catalog-translation.export.modal.table-header.requested.by" />
                  </th>
                  <th>
                    <FormattedMessage id="catalog-translation.export.modal.table-header.requested.at" />
                  </th>
                  <th>
                    <FormattedMessage id="catalog-translation.export.modal.table-header.download" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {data?.fieldTranslationsUploadRequests
                  ?.slice(0, DOWNLOAD_LIST_SIZE)
                  ?.map((requestId) => (
                    <ExportListItem
                      key={requestId}
                      requestId={requestId}
                      download={download}
                      downloadJson={downloadJson?.downloadFieldTranslations}
                      downloadError={downloadError}
                      type="field"
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

export default SpecificationExportModal
