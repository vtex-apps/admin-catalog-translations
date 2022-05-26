import { Translation } from 'vtex.messages'

import { parseJSONToXLS } from './fileParsers'

export * from './fileParsers'
export * from './sanitizeImportJSON'

export const UPLOAD_LIST_SIZE = 10
export const DOWNLOAD_LIST_SIZE = 6

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
 * Returns all the unique binding locales
 *
 * @param {array} Array received from api graphql
 * @return {array} Array with only unique locales and without the admin binding.
 */

export const filterLocales = (
  bindings: Binding[],
  xVtexTenant: string
): Binding[] => {
  const storeFrontBindings = bindings.filter(
    (binding) => binding.targetProduct === 'vtex-storefront'
  )
  const uniqueBindings: { [id: string]: boolean } = {}
  const filteredBindings: Binding[] = []
  const supportedLocales: string[] = []

  for (const binding of storeFrontBindings) {
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

  // in case the xVtexTenant is not in the bindings, we add it
  if (!uniqueBindings[xVtexTenant]) {
    filteredBindings.push({
      id: xVtexTenant,
      defaultLocale: xVtexTenant,
      supportedLocales: [],
    })
    uniqueBindings[xVtexTenant] = true
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

export function hasChanges<S>(formValues: S, originalValues: S): boolean {
  const keys = Object.keys(formValues)
  for (const key of keys) {
    if (formValues[key as keyof S] !== originalValues[key as keyof S]) {
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

export const getValueByKey = (
  obj: { [k: string]: string },
  keyName: string
) => {
  let value = ''
  Object.keys(obj).forEach((key) => {
    if (key === keyName) {
      value = obj[key]
    }
  })

  return value
}

export const createModel = <T>(
  headers: Array<keyof T>,
  sheetName: string,
  type: string
) => {
  const headersObject = headers.reduce<Record<typeof headers[number], string>>(
    (obj, header) => {
      obj[header] = ''
      return obj
    },
    {} as Record<typeof headers[number], string>
  )

  parseJSONToXLS([headersObject], {
    fileName: `${type}_translate_model`,
    sheetName,
  })
}
