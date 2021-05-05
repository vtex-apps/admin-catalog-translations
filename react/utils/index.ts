import XLSX from 'xlsx'

/**
 * Returns all the unique binding locales, excluding the first one provided by the api (admin)
 *
 * @param {array} Array received from api graphql
 * @return {array} Array with only unique locales and without the admin binding.
 */

export const filterLocales = (bindings: Binding[]): Binding[] => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [admin, ...otherBindings] = bindings
  const uniqueBindings: { [id: string]: boolean } = {}
  const filteredBindings = []

  for (const binding of otherBindings) {
    if (!uniqueBindings[binding.defaultLocale]) {
      filteredBindings.push(binding)
      uniqueBindings[binding.defaultLocale] = true
    }
  }

  return filteredBindings
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

export const FIFTEEN_MINUTES = 1000 * 60 * 15

export const hasPast15minutes = (date: string): boolean => {
  return FIFTEEN_MINUTES < new Date().valueOf() - new Date(date).valueOf()
}

export const remainingTime = (date: string): number => {
  const remaining =
    FIFTEEN_MINUTES - new Date().valueOf() - new Date(date).valueOf()
  return remaining > 0 ? remaining : 0
}
