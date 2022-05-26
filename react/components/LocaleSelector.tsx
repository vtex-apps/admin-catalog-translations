import React, {
  createContext,
  FC,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useQuery } from 'react-apollo'
import { Spinner, Dropdown } from 'vtex.styleguide'

import accountLocalesQuery from '../graphql/accountLocales.gql'
import { convertToDropDownOptions, filterLocales } from '../utils'

interface DropDownProps {
  label: string
  value: string
}
interface BindingContextInterface {
  xVtexTenant: string
  isXVtexTenant: boolean
  selectedLocale: string
  dropDownOptions: DropDownProps[]
  loading: boolean
  handleLocaleSelection: (localeSelected: string) => void
}

const BindingContext = createContext<BindingContextInterface>(
  {} as BindingContextInterface
)

const BindingProvider: FC = ({ children }) => {
  const [dropDownOptions, setDropDownOptions] = useState<DropDownProps[]>([])
  const [selectedLocale, setSelectedLocale] = useState<string>('')
  const [xVtexTenant, setXVtexTenant] = useState('')

  const { data: bindingData, loading } = useQuery<BindingsData>(
    accountLocalesQuery
  )

  useEffect(() => {
    // eslint-disable-next-line vtex/prefer-early-return
    if (bindingData) {
      const { defaultLocale, bindings: fetchedLocales } = bindingData.tenantInfo
      const filteredLocales = filterLocales(fetchedLocales, defaultLocale)
      setDropDownOptions(convertToDropDownOptions(filteredLocales))
      setSelectedLocale(defaultLocale)
      setXVtexTenant(defaultLocale)
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
        dropDownOptions,
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
    dropDownOptions = [],
    selectedLocale,
    handleLocaleSelection,
    loading,
  } = useContext(BindingContext)

  return loading ? (
    <Spinner />
  ) : (
    <div className="w-100 w4-ns">
      <Dropdown
        label="Available Language"
        placeholder="Select a language"
        value={selectedLocale}
        options={dropDownOptions}
        onChange={(_: unknown, value: string) => handleLocaleSelection(value)}
      />
    </div>
  )
}

const useLocaleSelector = () => useContext(BindingContext)

export { BindingProvider, useLocaleSelector }

export default LocaleSelector
