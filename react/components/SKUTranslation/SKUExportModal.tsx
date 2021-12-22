import React, { useEffect, useState } from 'react'
import { useLazyQuery, useQuery } from 'react-apollo'

import ExportByCategoryIdModal from '../ExportByCatIdModal'
import { useLocaleSelector } from '../LocaleSelector'
import START_SKU_TRANSLATION from '../../graphql/startSkuTranslations.gql'
import SKU_TRANSLATION_REQUESTS from '../../graphql/getSkuTranslationRequests.gql'
import DOWNLOAD_SKU_TRANSLATION from '../../graphql/downloadSkuTranslations.gql'

interface Props {
  isExportOpen: boolean
  setIsExportOpen: (open: boolean) => void
}

const SKUExportModal = ({ isExportOpen, setIsExportOpen }: Props) => {
  const { selectedLocale } = useLocaleSelector()
  const [hasNewRequest, setHasNewRequest] = useState(false)

  const [
    triggerSkuTranslations,
    {
      data: skuTranslationInfo,
      loading: loadingSkuTranslation,
      error: skuTranslationError,
    },
  ] = useLazyQuery<
    SkuTranslationRequest,
    { locale: string; categoryId: string }
  >(START_SKU_TRANSLATION, {
    context: {
      headers: {
        'x-vtex-locale': `${selectedLocale}`,
      },
    },
    fetchPolicy: 'no-cache',
  })

  const { data: translationRequests, updateQuery } = useQuery<
    SkuTranslationRequests
  >(SKU_TRANSLATION_REQUESTS)

  useEffect(() => {
    const { requestId } = skuTranslationInfo?.skuTranslations ?? {}

    // eslint-disable-next-line vtex/prefer-early-return
    if (requestId) {
      updateQuery((prevResult) => {
        return {
          skuTranslationRequests: [
            requestId,
            ...(prevResult.skuTranslationRequests ?? []),
          ],
        }
      })
      setHasNewRequest(true)
    }
  }, [skuTranslationInfo, updateQuery])

  const startDownloadSKU = (categoryId: string) => {
    triggerSkuTranslations({
      variables: {
        locale: selectedLocale,
        categoryId,
      },
    })
  }

  useEffect(() => {
    if (hasNewRequest) {
      setHasNewRequest(false)
    }
  }, [hasNewRequest])

  const [download, { data: downloadJson, error: downloadError }] = useLazyQuery<
    SkuTranslationDownload,
    { requestId: string }
  >(DOWNLOAD_SKU_TRANSLATION)

  return (
    <ExportByCategoryIdModal
      isExportOpen={isExportOpen}
      setIsExportOpen={setIsExportOpen}
      translationRequests={translationRequests?.skuTranslationRequests ?? []}
      startDownload={startDownloadSKU}
      errorTranslation={skuTranslationError}
      loadingTranslations={loadingSkuTranslation}
      hasNewRequest={hasNewRequest}
      download={download}
      downloadJson={downloadJson?.downloadSKUTranslation}
      downloadError={downloadError}
      type="sku"
    />
  )
}

export default SKUExportModal
