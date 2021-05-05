import React, { useEffect, useRef, useState } from 'react'
import { useQuery } from 'react-apollo'
import { FormattedDate, FormattedTime } from 'react-intl'
import { Progress, ButtonPlain } from 'vtex.styleguide'

import PROD_INFO_REQUEST from '../../graphql/getProdTranslationInfoReq.gql'
import { hasPast15minutes, FIFTEEN_MINUTES, remainingTime } from '../../utils'

interface Props {
  requestId: string
}

const ExportListItem = ({ requestId }: Props) => {
  const [longTimeAgo, setLongTimeAgo] = useState(false)
  const { data, error: errorFetching, startPolling, stopPolling } = useQuery<
    ProdTransInfoReq,
    { requestId: string }
  >(PROD_INFO_REQUEST, {
    variables: {
      requestId,
    },
  })

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
        {error || longTimeAgo ? (
          <p className="c-danger i f7">Error creating file</p>
        ) : completedAt ? (
          <ButtonPlain name="download-file" type="button" onClick={() => {}}>
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
