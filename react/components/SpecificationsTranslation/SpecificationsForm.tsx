import React, { FC, SyntheticEvent } from 'react'
import { Input } from 'vtex.styleguide'
import { useMutation } from 'react-apollo'

import { useLocaleSelector } from '../LocaleSelector'
import translateSpecificationMutation from './graphql/translateSpecification.gql'
import { useAlert } from '../../providers/AlertProvider'
import useFormTranslation from '../../hooks/useFormTranslation'
import ActionButtons from '../ActionButtons'

interface SpecificationsFormProps {
  specificationInfo: FieldInputTranslation
  specificationId: string
  updateMemoSpecifications: (
    value: React.SetStateAction<{
      [Identifier: string]: FieldsData
    }>
  ) => void
}

const SpecificationsForm: FC<SpecificationsFormProps> = ({
  specificationInfo,
  specificationId,
  updateMemoSpecifications,
}) => {
  const {
    formState,
    canEdit,
    handleInputChange,
    changed,
    handleToggleEdit,
  } = useFormTranslation<FieldInputTranslation>(specificationInfo)

  const { isXVtexTenant, selectedLocale } = useLocaleSelector()
  const [translateSpecification, { loading }] = useMutation<
    { translateField: boolean },
    { args: Field; locale: string }
  >(translateSpecificationMutation)

  const { openAlert } = useAlert()
  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault()
    if (loading) {
      return
    }
    const SpecificationArgs = {
      ...formState,
      ...{ fieldId: specificationId },
    }
    try {
      const { data, errors } = await translateSpecification({
        variables: {
          locale: selectedLocale,
          args: SpecificationArgs,
        },
      })
      const { translateField: translateSpecificationResult } = data ?? {}
      if (translateSpecificationResult) {
        updateMemoSpecifications((state) => ({
          ...state,
          ...{ [selectedLocale]: { field: SpecificationArgs } },
        }))
        openAlert('success', 'Specifications')
      }
      if (errors?.length) {
        throw new TypeError('Error translation Specifications')
      }
    } catch (err) {
      openAlert('error', 'Specifications')
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
export default SpecificationsForm
