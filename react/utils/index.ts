import { Translation } from 'vtex.messages'
import XLSX from 'xlsx'

/**
 * Keep the xVtexTenant in the top of the dropdown button
 */
const sortBindings = (bindings: Binding[], xVtexTenant: string): Binding[] => {
  const xVtexTenantBinding = []
  const otherBindings = []

  for (const binding of bindings) {
    if (binding.defaultLocale === xVtexTenant) {
      xVtexTenantBinding.push(binding)
    } else {
      otherBindings.push(binding)
    }
  }

  return [...xVtexTenantBinding, ...otherBindings]
}

/**
 * Returns all the unique binding locales, excluding the first one provided by the api (admin)
 *
 * @param {array} Array received from api graphql
 * @return {array} Array with only unique locales and without the admin binding.
 */

export const filterLocales = (
  bindings: Binding[],
  xVtexTenant: string
): Binding[] => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [admin, ...otherBindings] = bindings
  const uniqueBindings: { [id: string]: boolean } = {}
  const filteredBindings: Binding[] = []
  const supportedLocales: string[] = []

  for (const binding of otherBindings) {
    if (!uniqueBindings[binding.defaultLocale]) {
      filteredBindings.push(binding)
      supportedLocales.push(...binding.supportedLocales)
      uniqueBindings[binding.defaultLocale] = true
    }
  }

  // to show also the supported locales in the app, we transform them into a binding type, with an empty supported locales array
  for (const supportedLocale of supportedLocales) {
    if (!uniqueBindings[supportedLocale]) {
      filteredBindings.push({
        id: supportedLocale,
        defaultLocale: supportedLocale,
        supportedLocales: [],
      })
      uniqueBindings[supportedLocale] = true
    }
  }

  return sortBindings(filteredBindings, xVtexTenant)
}

/**
 * Checks if an object from a form has any changes from its original one
 *
 * @param {object} formValues Object that hold values from the form
 * @param {object} originalValues Object with the original values from the parent component
 * @return {boolean} true if values have changed. false if not.
 */

export function hasChanges<S>(formValues: S, orignalValues: S): boolean {
  const keys = Object.keys(formValues)
  for (const key of keys) {
    if (formValues[key as keyof S] !== orignalValues[key as keyof S]) {
      return true
    }
  }
  return false
}

interface DropDownProps {
  label: string
  value: string
}

export const convertToDropDownOptions = (
  bindings: Binding[]
): DropDownProps[] => {
  const formattedOptions: DropDownProps[] = []

  for (const binding of bindings) {
    formattedOptions.push({
      label: binding.defaultLocale,
      value: binding.defaultLocale,
    })
  }

  return formattedOptions
}
/**
 * Parse json to XLS and prompt a download window for user
 *
 * @param {object} data JSON to be parsed to xls
 * @param {object} options
 * @param {options.fileName} string
 * @param {options.sheetName} string
 */

export function parseJSONToXLS(
  data: unknown[],
  { fileName, sheetName }: { fileName: string; sheetName: string }
) {
  const workSheet = XLSX.utils.json_to_sheet(data)
  const workBook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workBook, workSheet, sheetName)
  const exportFileName = `${fileName}.xlsx`
  XLSX.writeFile(workBook, exportFileName)
}

interface FilterSearchCategoriesArgs {
  categoryList: Array<{ id: string; name: string }>
  term: string
}

export const filterSearchCategories = ({
  categoryList,
  term,
}: FilterSearchCategoriesArgs): Array<{ label: string; value: string }> => {
  return (
    categoryList
      .map(({ id, name }) => ({ label: `${id} - ${name}`, value: id }))
      .filter(({ label }) =>
        label.toLowerCase().includes(term.toLowerCase())
      ) ?? []
  )
}

const ESTIMATED_MARGIN = 5

export const remainingTime = (date: string, estimatedTime: number): number => {
  const remaining =
    estimatedTime * ESTIMATED_MARGIN -
    (new Date().valueOf() - new Date(date).valueOf())
  return remaining > 0 ? remaining : 0
}

export const shouldHaveCompleted = (
  date: string,
  estimatedTime: number
): boolean => {
  return (
    estimatedTime * ESTIMATED_MARGIN <
    new Date().valueOf() - new Date(date).valueOf()
  )
}

interface FormatCollectionFromMessagesArgs {
  translations: Translation[]
  context: string
  srcLang: string
  originalMessage: string
}

export const formatCollectionFromMessages = ({
  translations,
  context,
  srcLang,
  originalMessage,
}: FormatCollectionFromMessagesArgs): Record<string, Collections> => {
  if (!translations.length) {
    return {
      [srcLang]: { name: originalMessage, id: context },
    }
  }

  return translations.reduce((col, translation) => {
    col[translation.lang] = { name: translation.translation, id: context }
    return col
  }, {} as Record<string, Collections>)
}
