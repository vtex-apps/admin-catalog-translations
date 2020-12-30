import React, { FC, SyntheticEvent } from 'react'
import { Input, Textarea, Button } from 'vtex.styleguide'
import { useMutation } from 'react-apollo'

import { useLocaleSelector } from '../LocaleSelector'
import translateProductMutation from '../../graphql/translateProduct.gql'
import { useAlert } from '../../providers/AlertProvider'
import useFormTranslation from '../../hooks/useFormTranslation'
import ActionButtons from '../ActionButtons'

interface ProductFormProps {
  productInfo: ProductInputTranslation
  productId: string
  keywords: string[]
  updateMemoProducts: (
    value: React.SetStateAction<{
      [Identifier: string]: ProductData
    }>
  ) => void
}

const ProductForm: FC<ProductFormProps> = ({
  productInfo,
  productId,
  keywords,
  updateMemoProducts,
}) => {
  const {
    formState,
    canEdit,
    handleInputChange,
    changed,
    handleToggleEdit,
  } = useFormTranslation<ProductInputTranslation>(productInfo)

  const { isXVtexTenant, selectedLocale } = useLocaleSelector()

  const [translateProduct, { loading }] = useMutation<
    { translateProduct: boolean },
    { product: Product; locale: string }
  >(translateProductMutation)

  const { openAlert } = useAlert()

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault()
    if (loading) {
      return
    }
    const productArgs = {
      ...formState,
      ...{ id: productId, keywords: keywords.length ? keywords : [''] },
    }
    try {
      const { data, errors } = await translateProduct({
        variables: {
          locale: selectedLocale,
          product: productArgs,
        },
      })
      const { translateProduct: translateProductResult } = data ?? {}
      if (translateProductResult) {
        updateMemoProducts((state) => ({
          ...state,
          ...{ [selectedLocale]: { product: productArgs } },
        }))
        openAlert('success', 'product')
      }
      if (errors?.length) {
        throw new TypeError('Error translation product')
      }
    } catch (err) {
      openAlert('error', 'product')
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
          />
        </div>
        <div className="mb5">
          <Textarea
            resize="none"
            label="Short Description"
            value={formState.shortDescription}
            name="shortDescription"
            disabled={isXVtexTenant || !canEdit}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb5">
          <Textarea
            resize="none"
            label="Meta Tag Description"
            value={formState.metaTagDescription}
            name="metaTagDescription"
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
          <Input
            label="Link Id"
            value={formState.linkId}
            name="linkId"
            disabled={isXVtexTenant || !canEdit}
            onChange={handleInputChange}
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

export default ProductForm
