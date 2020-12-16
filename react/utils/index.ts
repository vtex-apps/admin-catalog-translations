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
