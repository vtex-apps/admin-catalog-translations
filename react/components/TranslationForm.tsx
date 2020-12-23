import React, { FC, FormEvent, useEffect, useState } from 'react'
import { Input, Textarea, Button } from 'vtex.styleguide'

type CategoryInfo = {
  name: string
  title: string
  description: string
  linkId: string
}

interface TranslationFormProps {
  isXVtexTenant: boolean
  categoryInfo: CategoryInfo
}

const TranslationForm: FC<TranslationFormProps> = ({
  isXVtexTenant,
  categoryInfo,
}) => {
  const [formState, setFormState] = useState(categoryInfo)
  const [canEdit, setCanEdit] = useState<boolean>(false)

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
        <div>
          {isXVtexTenant ? null : (
            <Button
              type="button"
              variation="secondary"
              onClick={() => setCanEdit(!canEdit)}
            >
              {canEdit ? 'Cancel' : 'Edit'}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

export default TranslationForm
