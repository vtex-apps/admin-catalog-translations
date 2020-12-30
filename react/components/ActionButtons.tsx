import React, { FC } from 'react'
import { Button } from 'vtex.styleguide'

interface ActionButtonsProps {
  toggleEdit: () => void
  canEdit: boolean
  changed: boolean
  loading: boolean
}

const ActionButtons: FC<ActionButtonsProps> = ({
  toggleEdit,
  canEdit,
  changed,
  loading,
}) => (
  <div>
    <span className="mr5">
      <Button type="button" variation="secondary" onClick={toggleEdit}>
        {canEdit ? 'Cancel' : 'Edit'}
      </Button>
    </span>
    <span>
      <Button
        type="submit"
        variation="primary"
        disabled={!changed}
        isLoading={loading}
      >
        Save
      </Button>
    </span>
  </div>
)

export default ActionButtons
