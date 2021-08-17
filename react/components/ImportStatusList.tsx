import { useQuery } from 'react-apollo'
import React, { useEffect, useRef, useState } from 'react'
import { FormattedDate, FormattedTime } from 'react-intl'
import { Progress } from 'vtex.styleguide'

import PRODUCT_UPLOAD_REQUEST_INFO from '../graphql/productUploadRequestInfo.gql'
import { shouldHaveCompleted } from '../utils'

const ImportStatusList = ({ requestId }: { requestId: string }) => {
  const [shouldHaveFinished, setShouldHaveFinished] = useState(false)
  const {
    data,
    error: errorFetchingInfo,
    startPolling,
    stopPolling,
  } = useQuery<
    { translationUploadRequestInfo: UploadRequest },
    { requestId: string }
  >(PRODUCT_UPLOAD_REQUEST_INFO, {
    variables: {
      requestId,
    },
  })

  const { translatedBy, createdAt, estimatedTime, locale, error, progress } =
    data?.translationUploadRequestInfo ?? {}

  const tooLongRef = useRef<any>()

  useEffect(() => {
    if (progress !== 100 && !error && createdAt && estimatedTime) {
      if (shouldHaveCompleted(createdAt, estimatedTime)) {
        stopPolling()
        setShouldHaveFinished(true)
        return
      }
      startPolling(estimatedTime / 8)
    }
    if (progress === 100 || error) {
      stopPolling()
      clearTimeout(tooLongRef.current)
    }

    return () => stopPolling()
  }, [progress, error, createdAt, estimatedTime, stopPolling, startPolling])

  return !data || errorFetchingInfo ? null : (
    <tr>
      <td>
        <p>{locale}</p>
      </td>
      <td>
        <p>{translatedBy}</p>
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
        {error || shouldHaveFinished ? (
          <p className="c-danger i f7">Error</p>
        ) : (
          <Progress
            type="steps"
            steps={[progress === 100 ? 'completed' : 'inProgress']}
          />
        )}
      </td>
      <td>
        <p>{progress ?? '0'}%</p>
      </td>
    </tr>
  )
}

export default ImportStatusList
