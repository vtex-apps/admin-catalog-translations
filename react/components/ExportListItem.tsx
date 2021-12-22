import React, { useEffect, useRef, useState } from 'react'
import { useQuery } from 'react-apollo'
import { FormattedDate, FormattedTime, FormattedMessage } from 'react-intl'
import { Progress, ButtonPlain } from 'vtex.styleguide'
import { ApolloError } from 'apollo-client'

import TRANSLATION_REQUEST_INFO from '../graphql/translationRequestInfo.gql'
import { shouldHaveCompleted, remainingTime, parseJSONToXLS } from '../utils'

const getBucket = (type: typeItem) => {
  if (type === 'sku') {
    return 'product-translation'
  }

  return `${type}-translation`
}

const getFileParams = (
  type: typeItem,
  categoryId?: string,
  locale?: string
) => {
  const name = type === 'field' ? 'specification' : type

  const fileName = categoryId
    ? `category-${categoryId}-${name}-data-${locale}`
    : `${name}-data-${locale}`

  const sheetName = `${name}_data`
  return { fileName, sheetName }
}
interface Options {
  variables: {
    requestId: string
  }
}

interface Props {
  requestId: string
  download: (options: Options) => void
  downloadJson: any
  downloadError?: ApolloError
  type: typeItem
}

const ExportListItem = ({
  requestId,
  download,
  downloadJson,
  downloadError,
  type,
}: Props) => {
  const [longTimeAgo, setLongTimeAgo] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [errorDownloading, setErrorDownloading] = useState(false)
  const {
    data,
    error: errorFetching,
    startPolling,
    stopPolling,
    refetch,
  } = useQuery<TransInfoReq, { requestId: string; bucket: string }>(
    TRANSLATION_REQUEST_INFO,
    {
      variables: {
        requestId,
        bucket: getBucket(type),
      },
    }
  )

  const {
    categoryId,
    locale,
    requestedBy,
    createdAt,
    completedAt,
    error,
    estimatedTime,
  } = data?.translationRequestInfo ?? {}

  const tooLongRef = useRef<any>()

  useEffect(() => {
    if (!completedAt) {
      refetch({ requestId, bucket: getBucket(type) })
    }
  }, [completedAt, refetch, requestId, type])

  useEffect(() => {
    if (!completedAt && !error && createdAt && estimatedTime) {
      if (shouldHaveCompleted(createdAt, estimatedTime)) {
        stopPolling()
        setLongTimeAgo(true)
        return
      }
      startPolling(estimatedTime)
      clearTimeout(tooLongRef.current)
      tooLongRef.current = setTimeout(() => {
        setLongTimeAgo(true)
        stopPolling()
      }, remainingTime(createdAt, estimatedTime))
    }
    if (completedAt || error) {
      stopPolling()
      clearTimeout(tooLongRef.current)
    }

    return () => stopPolling()
  }, [completedAt, createdAt, error, startPolling, stopPolling, estimatedTime])

  useEffect(() => {
    // eslint-disable-next-line vtex/prefer-early-return
    if (downloadJson && downloading) {
      const { fileName, sheetName } = getFileParams(type, categoryId, locale)
      parseJSONToXLS(downloadJson, {
        fileName,
        sheetName,
      })
      setDownloading(false)
    }
  }, [categoryId, downloadJson, downloading, locale, type])

  useEffect(() => {
    // eslint-disable-next-line vtex/prefer-early-return
    if (downloadError) {
      setDownloading(false)
      setErrorDownloading(true)
    }
  }, [downloadError])

  return !data || errorFetching ? null : (
    <tr>
      {!!categoryId && (
        <td>
          <p>{categoryId}</p>
        </td>
      )}
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
        {error || longTimeAgo || errorDownloading ? (
          <p className="c-danger i f7">
            <FormattedMessage id="catalog-translation.export.modal.download-list.error" />
          </p>
        ) : completedAt ? (
          <ButtonPlain
            name="download-file"
            type="button"
            onClick={() => {
              download({
                variables: { requestId },
              })
              setDownloading(true)
            }}
          >
            <FormattedMessage id="catalog-translation.export.modal.download-list.download-btn" />
          </ButtonPlain>
        ) : (
          <Progress type="steps" steps={['inProgress']} />
        )}
      </td>
    </tr>
  )
}

export default ExportListItem
