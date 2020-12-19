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
  ButtonGroup,
  Button,
} from 'vtex.styleguide'
import { useLazyQuery, useQuery } from 'react-apollo'

import accountLocalesQuery from './graphql/accountLocales.gql'
import { filterLocales } from './utils'
import getCategory from './graphql/getCategory.gql'

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
  const [categoryInfo, setCategoryInfo] = useState<CategoriesData>(
    {} as CategoriesData
  )

  const { data: bindingsData, loading } = useQuery<BindingsData>(
    accountLocalesQuery
  )
  const [fetchCategories, { data: categoriesData, refetch }] = useLazyQuery<
    CategoriesData,
    { id: number }
  >(getCategory, {
    context: {
      headers: {
        'x-vtex-tenant': `${xVtexTenant}`,
        'x-vtex-locale': `${selectedLocale.defaultLocale}`,
      },
    },
    fetchPolicy: 'no-cache',
  })

  useEffect(() => {
    if (categoriesData) {
      setCategoryInfo(categoriesData)
    }
  }, [categoriesData])

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

  const handleLocaleSelection = ({ id, defaultLocale }: Binding): void => {
    setSelectedLocale({ id, defaultLocale })
  }

  useEffect(() => {
    if (!memoCategories[selectedLocale.defaultLocale] && refetch) {
      refetch()
    }
  }, [selectedLocale, refetch])

  useEffect(() => {
    if (categoryInfo?.category) {
      setMemoCategories({
        ...memoCategories,
        ...{ [selectedLocale.defaultLocale]: categoryInfo.category },
      })
    }
  }, [categoryInfo])

  const handleCategoryIdInput = (e: FormEvent<HTMLInputElement>) => {
    setCategoryId(e.currentTarget.value)
  }

  const handleSubmitCategoryId = (e: SyntheticEvent) => {
    e.preventDefault()
    setMemoCategories({})
    setCategoryInfo({} as CategoriesData)
    fetchCategories({ variables: { id: Number(categoryId) } })
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
        <div>
          <ButtonGroup
            buttons={bindings.map(({ id: bindingId, defaultLocale }) => (
              <div key={bindingId}>
                <Button
                  isActiveOfGroup={
                    defaultLocale === selectedLocale.defaultLocale
                  }
                  onClick={() =>
                    handleLocaleSelection({ id: bindingId, defaultLocale })
                  }
                >
                  {defaultLocale}
                </Button>
              </div>
            ))}
          />
        </div>
      )}
      <InputSearch
        value={categoryId}
        label="Category Id"
        size="regular"
        onChange={handleCategoryIdInput}
        onSubmit={handleSubmitCategoryId}
      />
      {selectedLocale.id ? (
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
      ) : null}
    </Layout>
  )
}

export default CatalogTranslation
