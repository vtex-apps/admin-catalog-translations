import React, { useState, useEffect } from 'react'
import { useLazyQuery } from 'react-apollo'
import { ModalDialog, Checkbox } from 'vtex.styleguide'
import { defineMessages, useIntl } from 'react-intl'

import { useLocaleSelector } from '../LocaleSelector'
import getSpecificationsByCategory from '../../graphql/getSpecificationsByCategory.gql'
import { parseJSONToXLS } from '../../utils'

const modalMessage = defineMessages({
  export: {
    id: 'catalog-translation.export.modal.title-brand',
  },
  confirmation: {
    id: 'catalog-translation.export.modal.confirmation-brands',
  },
  active: {
    id: 'catalog-translation.export.modal.export-active-brands',
  },
  cancel: {
    id: 'catalog-translation.action-buttons.cancel',
  },
  error: {
    id: 'catalog-translation.export.modal.error-exporting',
  },
})
interface SpecificationTranslations {
  SpecificationTranslations: Specifications[]
}

const SpecificationExportModal = ({
  isExportOpen = false,
  handleOpenExport = () => {},
}: ComponentProps) => {
  const intl = useIntl()

  const [onlyActive, setOnlyActive] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [hasError, setHasError] = useState(false)

  const { selectedLocale } = useLocaleSelector()

  const [fetchTranslations, { data, error }] = useLazyQuery<
    SpecificationTranslations,
    { categoryId: string }
  >(getSpecificationsByCategory, {
    context: {
      headers: {
        'x-vtex-locale': `${selectedLocale}`,
      },
    },
  })

  const downloadTranslations = () => {
    setHasError(false)
    setDownloading(true)
    fetchTranslations({
      variables: { categoryId: '516' },
    })
  }

  useEffect(() => {
    // eslint-disable-next-line vtex/prefer-early-return
    if (data && downloading) {
      parseJSONToXLS(data.SpecificationTranslations, {
        fileName: `specifications-data-${selectedLocale}`,
        sheetName: 'specifications_data',
      })

      setDownloading(false)
      handleOpenExport(false)
    }
  }, [data, selectedLocale, downloading, handleOpenExport])

  useEffect(() => {
    // eslint-disable-next-line vtex/prefer-early-return
    if (error) {
      setDownloading(false)
      setHasError(true)
    }
  }, [error])

  return (
    <ModalDialog
      loading={downloading}
      cancelation={{
        label: intl.formatMessage(modalMessage.cancel),
        onClick: () => {
          handleOpenExport(false)
          setHasError(false)
        },
      }}
      confirmation={{
        label: intl.formatMessage(modalMessage.confirmation),
        onClick: downloadTranslations,
      }}
      isOpen={isExportOpen}
      onClose={() => {
        handleOpenExport(false)
        setHasError(false)
      }}
    >
      <div>
        <h3>
          {intl.formatMessage(modalMessage.export)} {selectedLocale}
        </h3>
        <Checkbox
          label={intl.formatMessage(modalMessage.active)}
          name="active-selection"
          value={onlyActive}
          checked={onlyActive}
          onChange={() => setOnlyActive(!onlyActive)}
        />
      </div>
      {hasError ? (
        <p className="absolute c-danger i-s bottom-0-m right-0-m mr8">
          {intl.formatMessage(modalMessage.error)}
        </p>
      ) : null}
    </ModalDialog>
  )
}

export default SpecificationExportModal
