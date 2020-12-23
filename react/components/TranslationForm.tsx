import React, { FC, FormEvent, useEffect, useState } from 'react'
import { Input, Textarea, Button } from 'vtex.styleguide'
// import { useMutation } from 'react-apollo'

// import translateCategoryMutation from '../graphql/translateCategory.gql'
import { hasChanges } from '../utils'

interface TranslationFormProps {
  isXVtexTenant: boolean
  categoryInfo: CategoryInputTranslation
}

const TranslationForm: FC<TranslationFormProps> = ({
  isXVtexTenant,
  categoryInfo,
}) => {
  const [formState, setFormState] = useState(categoryInfo)
  const [canEdit, setCanEdit] = useState<boolean>(false)
  // const [translateCategory, { data, loading, error }] = useMutation(
  //   translateCategoryMutation
  // )

  useEffect(() => {
    setCanEdit(false)
    setFormState(categoryInfo)
  }, [categoryInfo])

  const handleInputChange = (e: FormEvent<HTMLInputElement>) => {
    const { name: fieldName, value } = e.currentTarget

    setFormState((state) => ({
      ...state,
      ...{ [fieldName]: value },
    }))
  }

  const changed = hasChanges(formState, categoryInfo)

  const handleToggleEdit = () => {
    if (canEdit) {
      setCanEdit(false)
      setFormState(categoryInfo)
    } else {
      setCanEdit(true)
    }
  }

  return (
    <div>
      <form>
        <div className="mb5">
          <Input
            label="Name"
            value={formState.name}
            name="name"
            disabled={isXVtexTenant || !canEdit}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb5">
          <Input
            label="Title"
            value={formState.title}
            name="title"
            disabled={isXVtexTenant || !canEdit}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb5">
          <Textarea
            resize="none"
            label="Description"
            value={formState.description}
            name="description"
            disabled={isXVtexTenant || !canEdit}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb5">
          <Input
            label="Link Id"
            value={formState.linkId}
            name="linkId"
            disabled={isXVtexTenant || !canEdit}
            onChange={handleInputChange}
          />
        </div>
        {isXVtexTenant ? null : (
          <div>
            <span className="mr5">
              <Button
                type="button"
                variation="secondary"
                onClick={handleToggleEdit}
              >
                {canEdit ? 'Cancel' : 'Edit'}
              </Button>
            </span>
            <span>
              <Button type="submit" variation="primary" disabled={!changed}>
                Save
              </Button>
            </span>
          </div>
        )}
      </form>
    </div>
  )
}

export default TranslationForm
