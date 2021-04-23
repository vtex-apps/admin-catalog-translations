import React, { FC, SyntheticEvent } from 'react'
import { Input } from 'vtex.styleguide'
import { useMutation } from 'react-apollo'

import { useLocaleSelector } from '../LocaleSelector'
import translateSpecificationMutation from '../../graphql/translateSpecificationValues.gql'
import { useAlert } from '../../providers/AlertProvider'
import useFormTranslation from '../../hooks/useFormTranslation'
import ActionButtons from '../ActionButtons'

interface SpecificationFieldValuesFormProps {
  specificationValuesInfo: FieldValueInputTranslation
  specificationValuesID: string
  updateMemoSpecifications: (
    value: React.SetStateAction<{
      [Identifier: string]: SpecificationFieldValuesData
    }>
  ) => void
}

const SpecificationsForm: FC<SpecificationFieldValuesFormProps> = ({
  specificationValuesInfo,
  specificationValuesID,
  updateMemoSpecifications,
}) => {
  const {
    formState,
    canEdit,
    handleInputChange,
    changed,
    handleToggleEdit,
  } = useFormTranslation(specificationValuesInfo)

  const { isXVtexTenant, selectedLocale } = useLocaleSelector()
  const [translateSpecification, { loading }] = useMutation<
    { translateSpecification: boolean },
    { args: SpecificationFieldValues; locale: string }
  >(translateSpecificationMutation)

  const { openAlert } = useAlert()

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault()
    if (loading) {
      return
    }
    const args = {
      ...formState,
      ...{ fieldId: specificationValuesID },
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
        openAlert('success', 'Specification Field Values')
      }
      if (errors?.length) {
        throw new TypeError('Error translation Specification Field Values')
      }
    } catch (err) {
      openAlert('error', 'Specification Field Values')
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="mb5">
          <Input
            label="Name"
            name="name"
            value={formState.value}
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
