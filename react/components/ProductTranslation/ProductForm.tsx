import React, { FC, FormEvent, useEffect, useState } from 'react'
import { Input, Textarea } from 'vtex.styleguide'

import { hasChanges } from '../../utils'
import { useLocaleSelector } from '../LocaleSelector'

interface ProductFormProps {
  productInfo: ProductInputTranslation
}

const ProductForm: FC<ProductFormProps> = ({ productInfo }) => {
  const [productFormState, setProductFormState] = useState(productInfo)
  const [canEdit, setCanEdit] = useState<boolean>(false)

  const { isXVtexTenant, selectedLocale } = useLocaleSelector()

  useEffect(() => {
    setCanEdit(false)
    setProductFormState(productInfo)
  }, [productInfo])

  const handleInputChange = (e: FormEvent<HTMLInputElement>) => {
    const { name: fieldName, value } = e.currentTarget

    setProductFormState((state) => ({
      ...state,
      ...{ [fieldName]: value },
    }))
  }

  const changed = hasChanges(productFormState, productInfo)

  const handleToggleEdit = () => {
    if (canEdit) {
      setCanEdit(false)
      setProductFormState(productInfo)
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
            value={productFormState.name}
            name="name"
            disabled={isXVtexTenant || !canEdit}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="mb5">
          <Textarea
            resize="none"
            label="Description"
            value={productFormState.description}
            name="description"
            disabled={isXVtexTenant || !canEdit}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="mb5">
          <Textarea
            resize="none"
            label="Short Description"
            value={productFormState.shortDescription}
            name="shortDescription"
            disabled={isXVtexTenant || !canEdit}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="mb5">
          <Textarea
            resize="none"
            label="Meta Tag Description"
            value={productFormState.metaTagDescription}
            name="metaTagDescription"
            disabled={isXVtexTenant || !canEdit}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="mb5">
          <Input
            label="Title"
            value={productFormState.title}
            name="title"
            disabled={isXVtexTenant || !canEdit}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="mb5">
          <Input
            label="Link Id"
            value={productFormState.linkId}
            name="linkId"
            disabled={isXVtexTenant || !canEdit}
            onChange={handleInputChange}
            required
            pattern="^[^\s]+$"
            helpText={<p>Link ID cannot have whitespaces</p>}
          />
        </div>
      </form>
    </div>
  )
}

export default ProductForm
