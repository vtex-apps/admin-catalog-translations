import React from 'react'
import { useQuery } from 'react-apollo'
import { FormattedDate, FormattedTime } from 'react-intl'
import { Progress, ButtonPlain } from 'vtex.styleguide'

import PROD_INFO_REQUEST from '../../graphql/getProdTranslationInfoReq.gql'

interface Props {
  requestId: string
}

const ExportListItem = ({ requestId }: Props) => {
  const { data, error: errorFetching } = useQuery<
    ProdTransInfoReq,
    { requestId: string }
  >(PROD_INFO_REQUEST, {
    variables: {
      requestId,
    },
  })

  // eslint-disable-next-line no-console
  console.log({ data, errorFetching, requestId })

  const { categoryId, locale, requestedBy, createdAt, completedAt, error } =
    data?.productTranslationRequestInfo ?? {}

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
        {error ? (
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
