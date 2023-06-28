import React, { FC } from 'react'
import { Button } from 'vtex.styleguide'
import { FormattedMessage } from 'react-intl'

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
        {canEdit ? (
          <FormattedMessage id="admin/catalog-translation.action-buttons.cancel" />
        ) : (
          <FormattedMessage id="admin/catalog-translation.action-buttons.edit" />
        )}
      </Button>
    </span>
    <span>
      <Button
        type="submit"
        variation="primary"
        disabled={!changed}
        isLoading={loading}
      >
        <FormattedMessage id="admin/catalog-translation.action-buttons.save" />
      </Button>
    </span>
  </div>
)

export default ActionButtons
