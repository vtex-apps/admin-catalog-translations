import React, {
  FC,
  FormEvent,
  SyntheticEvent,
  useEffect,
  useState,
} from 'react'
import { Input, Textarea, Button } from 'vtex.styleguide'
import { useMutation } from 'react-apollo'

import { hasChanges } from '../../utils'
import { useLocaleSelector } from '../LocaleSelector'
import translateProductMutation from '../../graphql/translateProduct.gql'

interface ProductFormProps {
  productInfo: ProductInputTranslation
  productId: string
  keywords: string[]
  updateMemoProducts: (
    value: React.SetStateAction<{
      [Identifier: string]: Product
    }>
  ) => void
}

const ProductForm: FC<ProductFormProps> = ({
  productInfo,
  productId,
  keywords,
  updateMemoProducts,
}) => {
  const [productFormState, setProductFormState] = useState(productInfo)
  const [canEdit, setCanEdit] = useState<boolean>(false)

  const { isXVtexTenant, selectedLocale } = useLocaleSelector()

  const [translateProduct, { loading }] = useMutation<
    { translateProduct: boolean },
    { product: ProductInputTranslation; locale: string }
  >(translateProductMutation)

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

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault()
    if (loading) {
      return
    }
    const productArgs = {
      ...productFormState,
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
          ...{ [selectedLocale]: productArgs },
        }))
      }
      if (errors?.length) {
        throw new TypeError('Error translation product')
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('ERRRROR', err)
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="mb5">
          <Input
            label="Name"
            value={productFormState.name}
            name="name"
            disabled={isXVtexTenant || !canEdit}
            onChange={handleInputChange}
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
          />
        </div>
        <div className="mb5">
          <Input
            label="Title"
            value={productFormState.title}
            name="title"
            disabled={isXVtexTenant || !canEdit}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb5">
          <Input
            label="Link Id"
            value={productFormState.linkId}
            name="linkId"
            disabled={isXVtexTenant || !canEdit}
            onChange={handleInputChange}
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

export default ProductForm
