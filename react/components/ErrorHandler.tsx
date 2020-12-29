import React, { FC } from 'react'
import { EmptyState } from 'vtex.styleguide'

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
      <EmptyState title={`${entry} not found`}>
        <p>{`The ${entry} ID ${entryId} could not be found`}</p>
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
