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

export const hasChanges = (
  formValues: CategoryInputTranslation,
  orignalValues: CategoryInputTranslation
): boolean => {
  const keys = Object.keys(formValues)
  for (const key of keys) {
    if (
      formValues[key as keyof CategoryInputTranslation] !==
      orignalValues[key as keyof CategoryInputTranslation]
    ) {
      return true
    }
  }
  return false
}
