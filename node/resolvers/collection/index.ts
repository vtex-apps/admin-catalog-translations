import {
  mutations as uploadMutations,
  queries as uploadQueries,
} from './upload'

export const Collection = {
  locale: (_root: unknown, _args: unknown, ctx: Context) => {
    return ctx.state.locale
  },
}

const collectionTranslations = async (
  _root: unknown,
  args: { locale: string; active?: boolean; xVtexTenant: string },
  ctx: Context
) => {
  const {
    clients: { catalogGQL, messagesGraphQL },
  } = ctx

  const { active, locale, xVtexTenant } = args

  ctx.state.locale = locale

  const collections = await catalogGQL.getCollections()

  const originalTranslation = collections.reduce<Record<string, string>>(
    (map, collection) => {
      return {
        [collection.id]: collection.name,
        ...map,
      }
    },
    {}
  )

  const messages = collections
    .filter(({ status }) => (active ? status === 'active' : true))
    .map(({ id, name }) => ({
      content: name,
      context: id,
    }))

  const userTranslations = await messagesGraphQL.userTranslations({
    from: xVtexTenant,
    messages,
  })

  const transformMessages = userTranslations.map(
    ({ context, translations }) => {
      const translatedName = translations.find(({ lang }) => lang === locale)
        ?.translation
      // If there is no translation, the value is set to be the original one, since
      // this is the normal behavior for the store when autmoatic translation is off.
      return {
        id: context,
        name: translatedName ?? originalTranslation[context as string],
      }
    }
  )

  return transformMessages
}

export const mutations = {
  ...uploadMutations,
}

export const queries = {
  collectionTranslations,
  ...uploadQueries,
}
