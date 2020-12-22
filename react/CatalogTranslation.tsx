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
  EmptyState,
} from 'vtex.styleguide'
import { useLazyQuery, useQuery } from 'react-apollo'

import accountLocalesQuery from './graphql/accountLocales.gql'
import { filterLocales } from './utils'
import getCategory from './graphql/getCategory.gql'
import LocaleSelector from './components/LocaleSelector'
import ErrorHandler from './components/ErrorHandler'

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

    if (!memoCategories[selectedLocale.defaultLocale] && refetch) {
      refetchAndUpdate()
    }
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

  const {
    description,
    id,
    keywords,
    linkId,
    name,
    parentCategoryId,
    stockKeepingUnitSelectionMode,
    title,
  } = memoCategories[selectedLocale.defaultLocale] || ({} as Category)
  const isLoadingOrRefetchingCategory = loadingCategory || networkStatus === 4

  return (
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
        <PageBlock variation="full" title="Category Info">
          {categoryError ? (
            <ErrorHandler
              errorMessage={categoryError}
              categoryId={categoryId}
            />
          ) : isLoadingOrRefetchingCategory ? (
            <Spinner />
          ) : (
            <div>
              <h5>id</h5>
              <p>{id}</p>
              <h5>Description</h5>
              <p>{description}</p>
              <h5>Name</h5>
              <p>{name}</p>
              <h5>LinkId</h5>
              <p>{linkId}</p>
              <h5>parentCategoryId</h5>
              <p>{parentCategoryId}</p>
              <h5>stockKeepingUnitSelectionMode</h5>
              <p>{stockKeepingUnitSelectionMode}</p>
              <h5>Title</h5>
              <p>{title}</p>
              <h5>Keywords</h5>
              <ul>
                {keywords?.length
                  ? memoCategories[selectedLocale.defaultLocale]?.keywords.map(
                      (keyword: string) => (
                        <li key={keyword}>
                          <p>{keyword}</p>
                        </li>
                      )
                    )
                  : null}
              </ul>
            </div>
          )}
        </PageBlock>
      ) : null}
    </Layout>
  )
}

export default CatalogTranslation
