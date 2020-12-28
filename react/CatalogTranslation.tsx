import React, {
  FC,
  FormEvent,
  SyntheticEvent,
  useEffect,
  useState,
} from 'react'
import { FormattedMessage } from 'react-intl'
import {
  Layout,
  PageBlock,
  PageHeader,
  Spinner,
  InputSearch,
} from 'vtex.styleguide'
import { useLazyQuery, useQuery } from 'react-apollo'

import accountLocalesQuery from './graphql/accountLocales.gql'
import { filterLocales } from './utils'
import getCategory from './graphql/getCategory.gql'
import LocaleSelector from './components/LocaleSelector'
import ErrorHandler from './components/ErrorHandler'
import TranslationForm from './components/TranslationForm'
import { AlertProvider } from './providers/AlertProvider'

const CatalogTranslation: FC = () => {
  const [bindings, setBindings] = useState<Binding[]>([])
  const [selectedLocale, setSelectedLocale] = useState<Binding>({
    id: '',
    defaultLocale: '',
  })
  const [xVtexTenant, setXVtexTenant] = useState('')
  const [memoCategories, setMemoCategories] = useState<{
    [Identifier: string]: Category
  }>({})
  const [categoryId, setCategoryId] = useState('')
  const [categoryError, setCategoryError] = useState('')

  const { data: bindingsData, loading } = useQuery<BindingsData>(
    accountLocalesQuery
  )
  const [
    fetchCategories,
    { refetch, loading: loadingCategory, networkStatus },
  ] = useLazyQuery<CategoriesData, { id: number }>(getCategory, {
    context: {
      headers: {
        'x-vtex-tenant': `${xVtexTenant}`,
        'x-vtex-locale': `${selectedLocale.defaultLocale}`,
      },
    },
    fetchPolicy: 'no-cache',
    notifyOnNetworkStatusChange: true,
    onError: (e) => {
      setCategoryError(e.message)
    },
  })

  useEffect(() => {
    // eslint-disable-next-line vtex/prefer-early-return
    if (bindingsData) {
      const fetchedLocales = bindingsData.tenantInfo.bindings
      const filteredLocales = filterLocales(fetchedLocales)
      setBindings(filteredLocales)
      setSelectedLocale(filteredLocales[0])
      setXVtexTenant(filteredLocales[0].defaultLocale)
    }
  }, [bindingsData])

  const handleLocaleSelection = ({ id, defaultLocale }: Binding) => {
    setSelectedLocale({ id, defaultLocale })
  }

  useEffect(() => {
    async function refetchAndUpdate() {
      const { data } = await refetch()
      setMemoCategories({
        ...memoCategories,
        ...{ [selectedLocale.defaultLocale]: data.category },
      })
    }

    if (
      !memoCategories[selectedLocale.defaultLocale] &&
      refetch &&
      categoryId
    ) {
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
    memoCategories[selectedLocale.defaultLocale] || ({} as Category)
  const isLoadingOrRefetchingCategory = loadingCategory || networkStatus === 4

  return (
    <AlertProvider>
      <Layout
        pageHeader={
          <PageHeader
            title={<FormattedMessage id="catalog-translation.header" />}
          />
        }
      >
        {loading ? (
          <Spinner />
        ) : (
          <LocaleSelector
            bindings={bindings}
            selectedLocale={selectedLocale}
            handleLocaleSelection={handleLocaleSelection}
          />
        )}
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
          <PageBlock
            variation="full"
            title={`Category Info - ${selectedLocale.defaultLocale}`}
          >
            {categoryError ? (
              <ErrorHandler
                errorMessage={categoryError}
                categoryId={categoryId}
              />
            ) : isLoadingOrRefetchingCategory ? (
              <Spinner />
            ) : (
              <TranslationForm
                categoryInfo={{ name, title, description, linkId }}
                isXVtexTenant={xVtexTenant === selectedLocale.defaultLocale}
                categoryId={id}
                keywords={keywords}
                locale={selectedLocale.defaultLocale}
                updateMemoCategories={setMemoCategories}
              />
            )}
          </PageBlock>
        ) : null}
      </Layout>
    </AlertProvider>
  )
}

export default CatalogTranslation
