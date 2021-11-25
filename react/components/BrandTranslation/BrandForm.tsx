import React, { FC, SyntheticEvent } from 'react'
import { Input } from 'vtex.styleguide'
import { useMutation } from 'react-apollo'

import translateBrandMutation from '../../graphql/translateBrand.gql'
import { useAlert } from '../../providers/AlertProvider'
import { useLocaleSelector } from '../LocaleSelector'
import useFormTranslation from '../../hooks/useFormTranslation'
import ActionButtons from '../ActionButtons'

interface BrandFormProps {
  BrandInfo: BrandInputTranslation
  BrandId: string
  updateMemoBrands: (
    value: React.SetStateAction<{
      [Identifier: string]: BrandData
    }>
  ) => void
}

const BrandForm: FC<BrandFormProps> = ({
  BrandInfo,
  BrandId,
  updateMemoBrands,
}) => {
  const {
    formState,
    canEdit,
    handleInputChange,
    changed,
    handleToggleEdit,
  } = useFormTranslation<BrandInputTranslation>(BrandInfo)

  const { isXVtexTenant, selectedLocale } = useLocaleSelector()

  const [translateBrand, { loading }] = useMutation<
    { translateBrand: boolean },
    { brand: Brand; locale: string }
  >(translateBrandMutation)

  const { openAlert } = useAlert()

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault()
    if (loading) {
      return
    }
    const brandArgs = {
      ...formState,
      ...{ id: BrandId },
    }
    try {
      const { data, errors } = await translateBrand({
        variables: {
          locale: selectedLocale,
          brand: brandArgs,
        },
      })
      const { translateBrand: translateBrandResult } = data ?? {}
      if (translateBrandResult) {
        // update cache value (local state)
        updateMemoBrands((state) => ({
          ...state,
          ...{ [selectedLocale]: { brand: brandArgs } },
        }))
        // send user feedback
        openAlert('success', 'brand')
      }
      if (errors?.length) {
        throw new TypeError('Error translating brand')
      }
    } catch (err) {
      openAlert('error', 'brand')
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
            label="Site Title"
            value={formState.siteTitle}
            name="siteTitle"
            disabled={isXVtexTenant || !canEdit}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb5">
          <Input
            label="Brand Text"
            value={formState.text}
            name="text"
            disabled={isXVtexTenant || !canEdit}
            onChange={handleInputChange}
            required
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
export default BrandForm
