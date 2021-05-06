import React, { useEffect, useRef, useState } from 'react'
import { useLazyQuery, useQuery } from 'react-apollo'
import { FormattedDate, FormattedTime } from 'react-intl'
import { Progress, ButtonPlain } from 'vtex.styleguide'

import PROD_INFO_REQUEST from '../../graphql/getProdTranslationInfoReq.gql'
import DOWNLOAD_PRODUCT_TRANSLATION from '../../graphql/downloadProductTranslations.gql'
import { hasPast15minutes, remainingTime, parseJSONToXLS } from '../../utils'

interface Props {
  requestId: string
}

const ExportListItem = ({ requestId }: Props) => {
  const [longTimeAgo, setLongTimeAgo] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [errorDonwloading, setErrorDownloading] = useState(false)
  const { data, error: errorFetching, startPolling, stopPolling } = useQuery<
    ProdTransInfoReq,
    { requestId: string }
  >(PROD_INFO_REQUEST, {
    variables: {
      requestId,
    },
  })

  const [
    startDownload,
    { data: downloadJson, error: downloadError },
  ] = useLazyQuery<ProductTranslationDownload, { requestId: string }>(
    DOWNLOAD_PRODUCT_TRANSLATION
  )

  const { categoryId, locale, requestedBy, createdAt, completedAt, error } =
    data?.productTranslationRequestInfo ?? {}

  const tooLongRef = useRef<any>()

  useEffect(() => {
    if (!completedAt && !error && createdAt) {
      if (hasPast15minutes(createdAt)) {
        stopPolling()
        setLongTimeAgo(true)
        return
      }
      startPolling(10000)
      clearTimeout(tooLongRef.current)
      tooLongRef.current = setTimeout(() => {
        setLongTimeAgo(true)
        stopPolling()
      }, remainingTime(createdAt))
    }
    if (completedAt || error) {
      stopPolling()
      clearTimeout(tooLongRef.current)
    }

    return () => stopPolling()
  }, [completedAt, createdAt, error, startPolling, stopPolling])

  useEffect(() => {
    // eslint-disable-next-line vtex/prefer-early-return
    if (downloadJson && downloading) {
      parseJSONToXLS(downloadJson.downloadProductTranslation, {
        fileName: `category-${categoryId}-product-data-${locale}`,
        sheetName: 'product_data',
      })
      setDownloading(false)
    }
  }, [categoryId, downloadJson, downloading, locale])

  useEffect(() => {
    // eslint-disable-next-line vtex/prefer-early-return
    if (downloadError) {
      setDownloading(false)
      setErrorDownloading(true)
    }
  }, [downloadError])

  return !data || errorFetching ? null : (
    <tr>
      <td>
        <p>{categoryId}</p>
      </td>
      <td>
        <p>{locale}</p>
      </td>
      <td>
        <p>{requestedBy}</p>
      </td>
      <td>
        {createdAt ? (
          <span>
            <p>
              <FormattedTime value={createdAt} />
              {' - '}
              <FormattedDate value={createdAt} />
            </p>
          </span>
        ) : null}
      </td>
      <td>
        {error || longTimeAgo || errorDonwloading ? (
          <p className="c-danger i f7">Error creating file</p>
        ) : completedAt ? (
          <ButtonPlain
            name="download-file"
            type="button"
            onClick={() => {
              startDownload({
                variables: { requestId },
              })
              setDownloading(true)
            }}
          >
            Download
          </ButtonPlain>
        ) : (
          <Progress type="steps" steps={['inProgress']} />
        )}
      </td>
    </tr>
  )
}

export default ExportListItem
