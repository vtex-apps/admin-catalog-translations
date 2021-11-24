export const Collection = {
  locale: (
    _root: ResolvedPromise<CollectionTranslationResponse>,
    _args: unknown,
    ctx: Context
  ) => {
    return ctx.state.locale
  },
  name: (root: ResolvedPromise<CollectionTranslationResponse>) =>
    root.data.collection.name,
  description: (root: ResolvedPromise<CollectionTranslationResponse>) =>
    root.data.collection.description,
  id: (root: ResolvedPromise<CollectionTranslationResponse>) =>
    root.data.collection.id,
  status: (root: ResolvedPromise<CollectionTranslationResponse>) =>
    root.data.collection.status,
}

const collectionTranslations = async (
  _root: unknown,
  args: { locale: string; active?: boolean },
  ctx: Context
) => {
  const {
    clients: { catalogGQL },
  } = ctx

  const { active, locale } = args

  ctx.state.locale = locale

  const ids = await catalogGQL.getCollections()
  const translationsP = []

  for (const collection of ids) {
    if (!active || (active && collection.status === 'active')) {
      const promise = catalogGQL.getCollectionTranslation(collection.id, locale)
      translationsP.push(promise)
    }
  }

  const translations = await Promise.all(translationsP)

  return translations
}

const getCollectionsName = async (
  _root: unknown,
  _args: unknown,
  ctx: Context
) => {
  const {
    clients: { catalogGQL },
  } = ctx

  return catalogGQL.getCollections()
}

export const queries = {
  collectionTranslations,
  getCollectionsName,
}
