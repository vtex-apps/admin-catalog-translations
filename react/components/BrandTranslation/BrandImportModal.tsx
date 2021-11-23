import React, { useState, useEffect } from 'react'
import { useLazyQuery, useQuery } from 'react-apollo'
import { useLocaleSelector } from '../LocaleSelector'

import getAllBrands from '../../graphql/getAllBrands.gql'
import { parseJSONToXLS } from '../../utils'

import {
  ModalDialog,
  Checkbox,
} from 'vtex.styleguide'

interface Translations {
  translations: Brand[]
}

const BrandImportModal = ({
  isImportOpen = false,
  handleOpenImport = () => {},
}: ComponentProps) => {

  const [onlyActive, setOnlyActive] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [hasError, setHasError] = useState(false)

  const { selectedLocale } = useLocaleSelector()

  const [fetchTranslations, { data, error }] = useLazyQuery<
    Translations,
    { locale: string; active?: boolean }
  >(getAllBrands, {
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
      variables: { active: onlyActive, locale: selectedLocale },
    })
  }

  useEffect(() => {
    // eslint-disable-next-line vtex/prefer-early-return
    if (data && downloading) {
      parseJSONToXLS(data.translations, {
        fileName: `category-data-${selectedLocale}`,
        sheetName: 'category_data',
      })

      setDownloading(false)
      handleOpenImport(false)
    }
  }, [data, selectedLocale, downloading, handleOpenImport])

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
      label: 'Cancel',
      onClick: () => {
        handleOpenImport(false)
        setHasError(false)
      },
    }}
    confirmation={{
      label: 'Export Brands',
      onClick: downloadTranslations,
    }}
    isOpen={isImportOpen}
    onClose={() => {
      handleOpenImport(false)
      setHasError(false)
    }}
  >
    <div>
      <h3>Export Brand Data for {selectedLocale}</h3>
      <Checkbox
        label="Export only Active Brands"
        name="active-selection"
        value={onlyActive}
        checked={onlyActive}
        onChange={() => setOnlyActive(!onlyActive)}
      />
    </div>
    {hasError ? (
      <p className="absolute c-danger i-s bottom-0-m right-0-m mr8">
        There was an error exporting brands. Please try again.
      </p>
    ) : null}
  </ModalDialog>
  )
}

export default BrandImportModal
