import React, {
  createContext,
  FC,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useQuery } from 'react-apollo'
import { ButtonGroup, Button, Spinner } from 'vtex.styleguide'

import accountLocalesQuery from '../graphql/accountLocales.gql'
import { filterLocales } from '../utils'

interface BindingContextInterface {
  xVtexTenant: string
  isXVtexTenant: boolean
  selectedLocale: string
  bindings: Binding[]
  loading: boolean
  handleLocaleSelection: (localeSelected: string) => void
}

const BindingContext = createContext<BindingContextInterface>(
  {} as BindingContextInterface
)

const BindingProvider: FC = ({ children }) => {
  const [bindings, setBindings] = useState<Binding[]>([])
  const [selectedLocale, setSelectedLocale] = useState<string>('')
  const [xVtexTenant, setXVtexTenant] = useState('')

  const { data: bindingData, loading } = useQuery<BindingsData>(
    accountLocalesQuery
  )

  useEffect(() => {
    // eslint-disable-next-line vtex/prefer-early-return
    if (bindingData) {
      const fetchedLocales = bindingData.tenantInfo.bindings
      const filteredLocales = filterLocales(fetchedLocales)
      setBindings(filteredLocales)
      setSelectedLocale(filteredLocales[0].defaultLocale)
      setXVtexTenant(filteredLocales[0].defaultLocale)
    }
  }, [bindingData])

  const handleLocaleSelection = (localeSelected: string) => {
    setSelectedLocale(localeSelected)
  }

  const isXVtexTenant = selectedLocale === xVtexTenant
  return (
    <BindingContext.Provider
      value={{
        xVtexTenant,
        selectedLocale,
        isXVtexTenant,
        bindings,
        loading,
        handleLocaleSelection,
      }}
    >
      {children}
    </BindingContext.Provider>
  )
}

const LocaleSelector: FC = () => {
  const {
    bindings = [],
    selectedLocale,
    handleLocaleSelection,
    loading,
  } = useContext(BindingContext)

  return loading ? (
    <Spinner />
  ) : (
    <div>
      <ButtonGroup
        buttons={bindings.map(({ id: bindingId, defaultLocale }) => (
          <div key={bindingId}>
            <Button
              isActiveOfGroup={defaultLocale === selectedLocale}
              variation={
                defaultLocale === selectedLocale ? 'primary' : 'secondary'
              }
              onClick={() => handleLocaleSelection(defaultLocale)}
            >
              {defaultLocale}
            </Button>
          </div>
        ))}
      />
    </div>
  )
}

const useLocaleSelector = () => useContext(BindingContext)

export { BindingProvider, useLocaleSelector }

export default LocaleSelector
