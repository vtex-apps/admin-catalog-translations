import React, {
  FC,
  FormEvent,
  SyntheticEvent,
  useEffect,
  useState,
} from 'react'
import { useLazyQuery } from 'react-apollo'
import { InputSearch } from 'vtex.styleguide'

import { useLocaleSelector } from '../LocaleSelector'
import getProductQuery from '../../graphql/getProduct.gql'

const ProductTranslation: FC = () => {
  const { selectedLocale, xVtexTenant } = useLocaleSelector()
  const [memoProducts, setMemoProducts] = useState<{
    [Identifier: string]: Product
  }>({})

  const [productId, setProductId] = useState('')
  const [productError, setProductError] = useState('')

  const [
    fetchProducts,
    { refetch, loading: loadingProduct, networkStatus },
  ] = useLazyQuery<ProductData, { identifier: { value: string; field: 'id' } }>(
    getProductQuery,
    {
      context: {
        headers: {
          'x-vtex-tenant': `${xVtexTenant}`,
          'x-vtex-locale': `${selectedLocale}`,
        },
      },
      fetchPolicy: 'no-cache',
      notifyOnNetworkStatusChange: true,
      onError: (e) => {
        setProductError(e.message)
      },
    }
  )

  useEffect(() => {
    async function refetchAndUpdate() {
      const { data } = await refetch()
      setMemoProducts({
        ...memoProducts,
        ...{ [selectedLocale]: data.product },
      })
    }

    if (!memoProducts[selectedLocale] && refetch && productId) {
      refetchAndUpdate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memoProducts, refetch, selectedLocale])

  const handleProductIdInput = (e: FormEvent<HTMLInputElement>) => {
    if (productError) {
      setProductError('')
    }
    const inputValue = e.currentTarget.value
    const onlyNumberRegex = /^\d{0,}$/
    if (onlyNumberRegex.test(inputValue)) {
      setProductId(inputValue)
    }
  }

  const handleSubmitProductId = (e: SyntheticEvent) => {
    e.preventDefault()
    if (!productId) {
      return
    }
    setMemoProducts({})
    fetchProducts({
      variables: { identifier: { field: 'id', value: productId } },
    })
  }

  const handleCleanSearch = () => {
    setProductId('')
    setMemoProducts({})
  }

  // eslint-disable-next-line no-console
  console.log(memoProducts)

  return (
    <main>
      <div style={{ maxWidth: '340px' }} className="mv7">
        <InputSearch
          value={productId}
          placehoder="Search product..."
          label="Product Id"
          size="regular"
          onChange={handleProductIdInput}
          onSubmit={handleSubmitProductId}
          onClear={handleCleanSearch}
        />
      </div>
    </main>
  )
}

export default ProductTranslation
