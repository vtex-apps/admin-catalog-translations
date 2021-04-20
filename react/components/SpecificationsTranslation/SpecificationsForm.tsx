import React, { FC, SyntheticEvent } from 'react'
import { Input, Textarea, Button } from 'vtex.styleguide'
import { useMutation } from 'react-apollo'

import { useLocaleSelector } from '../LocaleSelector'
import translateSpecificationMutation from '../../graphql/translateSpecification.gql'
import { useAlert } from '../../providers/AlertProvider'
import useFormTranslation from '../../hooks/useFormTranslation'
import ActionButtons from '../ActionButtons'

interface SpecificationsFormProps {
  specificationInfo: FieldInputTranslation
  specificationId: string
  updateMemoSpecifications: (
    value: React.SetStateAction<{
      [Identifier: string]: SpecificationsData
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
  } = useFormTranslation(specificationInfo)

  const { isXVtexTenant, selectedLocale } = useLocaleSelector()
  const [translateSpecification, { loading }] = useMutation<
    { translateSpecification: boolean },
    { args: Specifications; locale: string }
  >(translateSpecificationMutation)

  const { openAlert } = useAlert()
  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault()
    if (loading) {
      return
    }
    const args = {
      ...formState,
      ...{ fieldId: specificationId },
    }
    try {
      const { data, errors } = await translateSpecification({
        variables: {
          locale: selectedLocale,
          args,
        },
      })
      const { translateSpecification: translateSpecificationResult } =
        data ?? {}
      if (translateSpecificationResult) {
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
            label="Field type"
            value={formState.fieldTypeName}
            name="fieldTypeName"
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
