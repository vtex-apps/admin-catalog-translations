const translationUploadRequestInfo = (
  _root: unknown,
  args: { requestId: string; bucket: string },
  ctx: Context
) => ctx.clients.vbase.getJSON<UploadRequest>(args?.bucket, args.requestId)

// TODO: send dynamic type to getJSON and use TranslationRequest
const translationRequestInfo = (
  _root: unknown,
  args: { requestId: string; bucket: string },
  ctx: Context
) => ctx.clients.vbase.getJSON(args.bucket, args.requestId)

export const queries = {
  translationUploadRequestInfo,
  translationRequestInfo,
}
