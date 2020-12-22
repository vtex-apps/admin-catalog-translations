import React, { FC } from 'react'
import { EmptyState } from 'vtex.styleguide'

type ErrorHandlerProps = {
  errorMessage: string
  categoryId: string
}

const ErrorHandler: FC<ErrorHandlerProps> = ({ errorMessage, categoryId }) => (
  <div>
    {errorMessage.indexOf('code 404') !== -1 ? (
      <EmptyState title="Category not found">
        <p>{`The category ID ${categoryId} could not be found`}</p>
      </EmptyState>
    ) : (
      <EmptyState title="Error getting category information">
        <p>
          There was an error getting the category information you searched for.
          Please try again
        </p>
      </EmptyState>
    )}
  </div>
)

export default ErrorHandler
