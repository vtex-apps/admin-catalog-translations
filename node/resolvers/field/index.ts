import { FIELD_BUCKET } from '../../utils'
import {
  queries as uploadQueries,
  mutations as uploadMutations,
} from './upload'

export const Field = {
  fieldId: (root: ResolvedPromise<FieldTranslationResponse>) =>
    root.data.field.fieldId,
  name: (root: ResolvedPromise<FieldTranslationResponse>) =>
    root.data.field.name,
}

const downloadFieldTranslations = async (
  _root: unknown,
  args: { requestId: string },
  ctx: Context
) => {
  const { translations } = await ctx.clients.vbase.getJSON<
    TranslationRequest<FieldTranslationResponse>
  >(FIELD_BUCKET, args.requestId, true)

  return translations
}

export const mutations = {
  ...uploadMutations,
}

export const queries = {
  downloadFieldTranslations,
  ...uploadQueries,
}
