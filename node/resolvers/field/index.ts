export const Fields = {
  locale: (
    _root: ResolvedPromise<FieldTranslationResponse>,
    _args: unknown,
    ctx: Context
  ) => {
    return ctx.state.locale
  },
  fieldId: (root: ResolvedPromise<FieldTranslationResponse>) =>
    root.data.field.fieldId,
  name: (root: ResolvedPromise<FieldTranslationResponse>) =>
    root.data.field.name
}

const specificationTranslations = async (
  _root: unknown,
  args: { locale: string;},
  ctx: Context
) => {
  const {
    clients: { catalogGQL },
  } = ctx
  const res = await catalogGQL.getFields()
  console.log('res', res)

  const { locale } = args
  console.log('active, locale', locale)

  ctx.state.locale = locale

  // const ids = await catalogGQL.getCategories(active)

  // const translationsP = []

  // for (const { id } of ids) {
  //   const promise = catalogGQL.getCategoryTranslation(id, locale)
  //   translationsP.push(promise)
  // }

  // const translations = await Promise.all(translationsP)

  // return translations
  return ['specificationTranslations XD']
}


export const queries = {
  specificationTranslations
}
