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
            id="catalog-translation.errors.not-found-header"
            values={{ entry }}
          />
        }
      >
        <p>
          <FormattedMessage
            id="catalog-translation.errors.not-found-message"
            values={{
              entry,
              entryId,
            }}
          />
        </p>
      </EmptyState>
    ) : (
      <EmptyState title={`Error getting ${entry} information`}>
        <p>
          {`There was an error getting the ${entry} information you searched for.
          Please try again`}
        </p>
      </EmptyState>
    )}
  </div>
)

export default ErrorHandler
