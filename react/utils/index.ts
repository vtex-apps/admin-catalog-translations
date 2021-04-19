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
