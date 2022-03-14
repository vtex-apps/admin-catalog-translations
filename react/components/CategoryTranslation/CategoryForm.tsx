import React, { FC, SyntheticEvent } from 'react'
import { Input, Textarea } from 'vtex.styleguide'
import { useMutation } from 'react-apollo'

import translateCategoryMutation from './graphql/translateCategory.gql'
import { useAlert } from '../../providers/AlertProvider'
import { useLocaleSelector } from '../LocaleSelector'
import useFormTranslation from '../../hooks/useFormTranslation'
import ActionButtons from '../ActionButtons'

interface CategoryFormProps {
  categoryInfo: CategoryInputTranslation
  categoryId: string
  updateMemoCategories: (
    value: React.SetStateAction<{
      [Identifier: string]: CategoriesData
    }>
  ) => void
}

const CategoryForm: FC<CategoryFormProps> = ({
  categoryInfo,
  categoryId,
  updateMemoCategories,
}) => {
  const {
    formState,
    canEdit,
    handleInputChange,
    changed,
    handleToggleEdit,
  } = useFormTranslation(categoryInfo)

  const [translateCategory, { loading }] = useMutation<
    { translateCategory: boolean },
    { args: Category; locale: string }
  >(translateCategoryMutation)
  const { openAlert } = useAlert()

  const { isXVtexTenant, selectedLocale } = useLocaleSelector()

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault()
    if (loading) {
      return
    }
    const args = {
      ...formState,
      ...{ id: categoryId },
    }
    try {
      const { data, errors } = await translateCategory({
        variables: {
          args,
          locale: selectedLocale,
        },
      })
      const { translateCategory: translateCategoryResult } = data ?? {}
      if (translateCategoryResult) {
        // update cache value (local state)
        updateMemoCategories((state) => ({
          ...state,
          ...{ [selectedLocale]: { category: args } },
        }))
        // send user feedback
        openAlert('success', 'category')
      }
      if (errors?.length) {
        throw new TypeError('Error translating category')
      }
    } catch (err) {
      openAlert('error', 'category')
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
          <ActionButtons
            toggleEdit={handleToggleEdit}
            canEdit={canEdit}
            changed={changed}
            loading={loading}
          />
        )}
      </form>
    </div>
  )
}

export default CategoryForm
