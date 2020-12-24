import React, {
  FC,
  FormEvent,
  SyntheticEvent,
  useEffect,
  useState,
} from 'react'
import { Input, Textarea, Button } from 'vtex.styleguide'
import { useMutation } from 'react-apollo'

import translateCategoryMutation from '../graphql/translateCategory.gql'
import { hasChanges } from '../utils'
import { useAlert } from '../providers/AlertProvider'

interface TranslationFormProps {
  isXVtexTenant: boolean
  categoryInfo: CategoryInputTranslation
  categoryId: string
  keywords: string[]
  locale: string
  updateMemoCategories: React.Dispatch<
    React.SetStateAction<{
      [Identifier: string]: Category
    }>
  >
}

const TranslationForm: FC<TranslationFormProps> = ({
  isXVtexTenant,
  categoryInfo,
  categoryId,
  keywords,
  locale,
  updateMemoCategories,
}) => {
  const [formState, setFormState] = useState(categoryInfo)
  const [canEdit, setCanEdit] = useState<boolean>(false)
  const [translateCategory, { loading }] = useMutation(
    translateCategoryMutation
  )
  const { openAlert } = useAlert()

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

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault()
    if (loading) {
      return
    }
    const args = { ...formState, ...{ id: categoryId, keywords } }
    try {
      const { data } = await translateCategory({
        variables: {
          args,
          locale,
        },
      })
      const { translateCategory: translateCategoryResult } = data
      if (translateCategoryResult) {
        // update cache value (local state)
        updateMemoCategories({ locale: args })
        // send user feedback
        openAlert()
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err)
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="mb5">
          <Input
            label="Name"
            value={formState.name}
            name="name"
            disabled={isXVtexTenant || !canEdit}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="mb5">
          <Input
            label="Title"
            value={formState.title}
            name="title"
            disabled={isXVtexTenant || !canEdit}
            onChange={handleInputChange}
            required
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
            required
          />
        </div>
        <div className="mb5">
          <Input
            label="Link Id"
            value={formState.linkId}
            name="linkId"
            disabled={isXVtexTenant || !canEdit}
            onChange={handleInputChange}
            required
            pattern="^[^\s]+$"
            helpText={<p>Link ID cannot have whitespaces</p>}
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
        )}
      </form>
    </div>
  )
}

export default TranslationForm
