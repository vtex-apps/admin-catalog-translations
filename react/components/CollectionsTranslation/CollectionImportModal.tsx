import React, { useState } from 'react'
import { useMutation, useQuery } from 'react-apollo'
import { ModalDialog, ButtonPlain, Dropzone, Tabs, Tab } from 'vtex.styleguide'
import { FormattedMessage } from 'react-intl'

import { sanitizeImportJSON, parseXLSToJSON, createModel } from '../../utils'
import { useLocaleSelector } from '../LocaleSelector'
import WarningAndErrorsImportModal from '../WarningAndErrorsImportModal'
import UPLOAD_COLLECTION_TRANSLATION from './graphql/uploadCollectionTranslation.gql'
import UPLOAD_COLLECTION_REQUESTS from './graphql/collectionUploadRequests.gql'
import ImportStatusList from '../ImportStatusList'

const COLLECTION_HEADERS: Array<keyof Collection> = ['id', 'name']
const COLLECTION_DATA = 'collection_data'
const UPLOAD_LIST_SIZE = 10

const CollectionImportModal = ({
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
  const [formattedTranslations, setFormattedTranslations] = useState<
    Blob | undefined
  >(undefined)

  const [tabSelected, setTabSelected] = useState<1 | 2>(1)
  const { selectedLocale, xVtexTenant } = useLocaleSelector()

  const handleFile = async (files: FileList) => {
    if (loading) {
      return
    }

    setLoading(true)

    try {
      const fileParsed = await parseXLSToJSON(files[0], {
        sheetName: COLLECTION_DATA,
      })

      setOriginalFile(fileParsed)

      const [translations, { errors, warnings }] = sanitizeImportJSON({
        data: fileParsed,
        entryHeaders: COLLECTION_HEADERS,
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
      // The errors being handled on parseXLSToJSON are thrown as strings.
      if (typeof e === 'string') {
        setErrorParsingFile(e)
      } else if (e instanceof Error) {
        setErrorParsingFile(e.message)
      } else {
        setErrorParsingFile('An unknown error occurred')
      }
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

  const handleCreateModel = () => {
    createModel(COLLECTION_HEADERS, COLLECTION_DATA, 'collection')
  }

  const [startCollectionUpload, { error: uploadError }] = useMutation<
    {
      uploadCollectionTranslations: string
    },
    {
      locale: string
      collections: Blob
      xVtexTenant: string
    }
  >(UPLOAD_COLLECTION_TRANSLATION)

  const { data, updateQuery } = useQuery<{
    collectionTranslationsUploadRequests: string[]
  }>(UPLOAD_COLLECTION_REQUESTS)

  const handleUploadRequest = async () => {
    if (!formattedTranslations) {
      return
    }

    const { data: newRequest } = await startCollectionUpload({
      variables: {
        locale: selectedLocale,
        collections: formattedTranslations,
        xVtexTenant,
      },
    })
    // eslint-disable-next-line vtex/prefer-early-return
    if (newRequest?.uploadCollectionTranslations) {
      updateQuery((prevResult) => {
        return {
          collectionTranslationsUploadRequests: [
            newRequest.uploadCollectionTranslations,
            ...(prevResult.collectionTranslationsUploadRequests ?? []),
          ],
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
          id="catalog-translation.import.modal.header.collections"
          values={{
            selectedLocale,
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
                <ButtonPlain onClick={handleCreateModel}>
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
              {validtionWarnings.length ? (
                <li>
                  <ButtonPlain onClick={() => setWarningModal(true)}>
                    {validtionWarnings.length}{' '}
                    <FormattedMessage id="catalog-translation.import.modal.total-warnings" />
                  </ButtonPlain>
                </li>
              ) : null}
              {validtionErrors.length ? (
                <li>
                  <ButtonPlain
                    variation="danger"
                    onClick={() => setErrorModal(true)}
                  >
                    {validtionErrors.length}{' '}
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
                {data?.collectionTranslationsUploadRequests
                  ?.slice(0, UPLOAD_LIST_SIZE)
                  .map((requestId) => (
                    <ImportStatusList
                      requestId={requestId}
                      key={requestId}
                      bucket="collection_transl"
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

export default CollectionImportModal
