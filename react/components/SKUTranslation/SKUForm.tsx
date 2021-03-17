import React, { FC, SyntheticEvent } from 'react'
import { useMutation } from 'react-apollo'
import { Input, Textarea, Button } from 'vtex.styleguide'

import { useAlert } from '../../providers/AlertProvider'
import useFormTranslation from '../../hooks/useFormTranslation'
import { useLocaleSelector } from '../LocaleSelector'
import translateSKUMutation from '../../graphql/translateSKU.gql'
import ActionButtons from '../ActionButtons'

interface SKUFormProps {
  SKUInfo: SKUInputTranslation
  SKUId: string
  updateMemoSKU: (
    value: React.SetStateAction<{
      [Identifier: string]: SKUData
    }>
  ) => void
}

const SKUForm: FC<SKUFormProps> = ({ SKUInfo, SKUId, updateMemoSKU }) => {
  const {
    formState,
    canEdit,
    handleInputChange,
    changed,
    handleToggleEdit,
  } = useFormTranslation<SKUInputTranslation>(SKUInfo)

  const { isXVtexTenant, selectedLocale } = useLocaleSelector()
  const [translateSKU, { loading }] = useMutation<
    { translateSKU: boolean },
    { sku: SKU; locale: string }
  >(translateSKUMutation)

  const { openAlert } = useAlert()
  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault()
    if (loading) {
      return
    }
    const SKUArgs = {
      ...formState,
      ...{ id: SKUId },
    }
    try {
      const { data, errors } = await translateSKU({
        variables: {
          locale: selectedLocale,
          sku: SKUArgs,
        },
      })
      const { translateSKU: translateSKUResult } = data ?? {}
      if (translateSKUResult) {
        updateMemoSKU((state) => ({
          ...state,
          ...{ [selectedLocale]: { sku: SKUArgs } },
        }))
        openAlert('success', 'SKU')
      }
      if (errors?.length) {
        throw new TypeError('Error translation SKU')
      }
    } catch (err) {
      openAlert('error', 'SKU')
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
export default SKUForm
