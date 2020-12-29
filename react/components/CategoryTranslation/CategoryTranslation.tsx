import React, {
  FC,
  FormEvent,
  SyntheticEvent,
  useEffect,
  useState,
} from 'react'
import { PageBlock, Spinner, InputSearch } from 'vtex.styleguide'
import { useLazyQuery } from 'react-apollo'

import getCategory from '../../graphql/getCategory.gql'
import { useLocaleSelector } from '../LocaleSelector'
import ErrorHandler from '../ErrorHandler'
import TranslationForm from '../TranslationForm'

const CategoryTranslation: FC = () => {
  const { selectedLocale, xVtexTenant } = useLocaleSelector()
  const [memoCategories, setMemoCategories] = useState<{
    [Identifier: string]: Category
  }>({})
  const [categoryId, setCategoryId] = useState('')
  const [categoryError, setCategoryError] = useState('')

  const [
    fetchCategories,
    { refetch, loading: loadingCategory, networkStatus },
  ] = useLazyQuery<CategoriesData, { id: number }>(getCategory, {
    context: {
      headers: {
        'x-vtex-tenant': `${xVtexTenant}`,
        'x-vtex-locale': `${selectedLocale}`,
      },
    },
    fetchPolicy: 'no-cache',
    notifyOnNetworkStatusChange: true,
    onError: (e) => {
      setCategoryError(e.message)
    },
  })

  useEffect(() => {
    async function refetchAndUpdate() {
      const { data } = await refetch()
      setMemoCategories({
        ...memoCategories,
        ...{ [selectedLocale]: data.category },
      })
    }

    if (!memoCategories[selectedLocale] && refetch && categoryId) {
      refetchAndUpdate()
    }
    // categoryId doesn't need to be in the dep array since it's in the if statement to avoid refetching when the input field is cleaned. We want this refetch function to run only when user changes the locale.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLocale, refetch, memoCategories])

  const handleCategoryIdInput = (e: FormEvent<HTMLInputElement>) => {
    if (categoryError) {
      setCategoryError('')
    }
    const onlyNumberRegex = /^\d{0,}$/
    const inputValue = e.currentTarget.value
    if (onlyNumberRegex.test(inputValue)) {
      setCategoryId(e.currentTarget.value)
    }
  }

  const handleSubmitCategoryId = (e: SyntheticEvent) => {
    e.preventDefault()
    if (!categoryId) {
      return
    }
    setMemoCategories({})
    fetchCategories({ variables: { id: Number(categoryId) } })
  }

  const handleCleanSearch = () => {
    setCategoryId('')
    setMemoCategories({})
  }

  const { description, id, linkId, name, title, keywords } =
    memoCategories[selectedLocale] || ({} as Category)
  const isLoadingOrRefetchingCategory = loadingCategory || networkStatus === 4

  return (
    <main>
      <div style={{ maxWidth: '340px' }} className="mv7">
        <InputSearch
          value={categoryId}
          placeholder="Search category..."
          label="Category Id"
          size="regular"
          onChange={handleCategoryIdInput}
          onSubmit={handleSubmitCategoryId}
          onClear={handleCleanSearch}
        />
      </div>
      {id || isLoadingOrRefetchingCategory || categoryError ? (
        <PageBlock variation="full" title={`Category Info - ${selectedLocale}`}>
          {categoryError ? (
            <ErrorHandler
              errorMessage={categoryError}
              entryId={categoryId}
              entry="Category"
            />
          ) : isLoadingOrRefetchingCategory ? (
            <Spinner />
          ) : (
            <TranslationForm
              categoryInfo={{ name, title, description, linkId }}
              categoryId={id}
              keywords={keywords}
              updateMemoCategories={setMemoCategories}
            />
          )}
        </PageBlock>
      ) : null}
    </main>
  )
}

export default CategoryTranslation
