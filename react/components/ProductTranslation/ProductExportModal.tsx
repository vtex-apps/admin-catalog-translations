import React, { useState, useEffect } from 'react'
import { useLazyQuery, useQuery } from 'react-apollo'

import { useLocaleSelector } from '../LocaleSelector'
import START_PRODUCT_TRANSLATION from './graphql/startProductTranslations.gql'
import PROD_TRANSLATION_REQUESTS from './graphql/getProductTranslationRequests.gql'
import ExportByCategoryIdModal from '../ExportByCatIdModal'
import DOWNLOAD_PRODUCT_TRANSLATION from './graphql/downloadProductTranslations.gql'

interface Props {
  isExportOpen: boolean
  setIsExportOpen: (open: boolean) => void
}

const ProductExportModal = ({ isExportOpen, setIsExportOpen }: Props) => {
  const { selectedLocale } = useLocaleSelector()
  const [hasNewRequest, setHasNewRequest] = useState(false)

  const [
    triggerProductTranslations,
    {
      data: productTranslationInfo,
      loading: loadingProdTranslation,
      error: prodTranslationError,
    },
  ] = useLazyQuery<
    ProductTranslationRequest,
    { locale: string; categoryId: string }
  >(START_PRODUCT_TRANSLATION, {
    context: {
      headers: {
        'x-vtex-locale': `${selectedLocale}`,
      },
    },
    fetchPolicy: 'no-cache',
  })

  const { data: translationRequests, updateQuery } = useQuery<
    ProdTranslationRequests
  >(PROD_TRANSLATION_REQUESTS)

  useEffect(() => {
    const { requestId } = productTranslationInfo?.productTranslations ?? {}

    // eslint-disable-next-line vtex/prefer-early-return
    if (requestId) {
      updateQuery((prevResult) => {
        return {
          productTranslationRequests: [
            requestId,
            ...(prevResult.productTranslationRequests ?? []),
          ],
        }
      })
      setHasNewRequest(true)
    }
  }, [productTranslationInfo, updateQuery])

  const startDownloadProducts = (categoryId: string) => {
    triggerProductTranslations({
      variables: { locale: selectedLocale, categoryId },
    })
  }

  useEffect(() => {
    if (hasNewRequest) {
      setHasNewRequest(false)
    }
  }, [hasNewRequest])

  const [download, { data: downloadJson, error: downloadError }] = useLazyQuery<
    ProductTranslationDownload,
    { requestId: string }
  >(DOWNLOAD_PRODUCT_TRANSLATION)

  return (
    <ExportByCategoryIdModal
      isExportOpen={isExportOpen}
      setIsExportOpen={setIsExportOpen}
      translationRequests={
        translationRequests?.productTranslationRequests ?? []
      }
      startDownload={startDownloadProducts}
      errorTranslation={prodTranslationError}
      loadingTranslations={loadingProdTranslation}
      hasNewRequest={hasNewRequest}
      download={download}
      downloadJson={downloadJson?.downloadProductTranslation}
      downloadError={downloadError}
      type="product"
    />
  )
}

export default ProductExportModal
