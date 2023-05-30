import React, { FC } from 'react'
import { EmptyState } from 'vtex.styleguide'
import { FormattedMessage } from 'react-intl'

type ErrorHandlerProps = {
  errorMessage: string
  entryId: string
  entry: string
}

const ErrorHandler: FC<ErrorHandlerProps> = ({
  errorMessage,
  entryId,
  entry,
}) => (
  <div>
    {errorMessage.indexOf('code 404') !== -1 ? (
      <EmptyState
        title={
          <FormattedMessage
            id="admin/catalog-translation.errors.not-found-header"
            values={{ entry }}
          />
        }
      >
        <p>
          <FormattedMessage
            id="admin/catalog-translation.errors.not-found-message"
            values={{
              entry,
              entryId,
            }}
          />
        </p>
      </EmptyState>
    ) : (
      <EmptyState
        title={
          <FormattedMessage
            id="admin/catalog-translation.errors.error-header"
            values={{ entry }}
          />
        }
      >
        <p>
          <FormattedMessage
            id="admin/catalog-translation.errors.error-message"
            values={{ entry }}
          />
        </p>
      </EmptyState>
    )}
  </div>
)

export default ErrorHandler
