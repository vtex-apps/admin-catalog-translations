const translationUploadRequestInfo = (
  _root: unknown,
  args: { requestId: string; bucket: string },
  ctx: Context
) => ctx.clients.vbase.getJSON<UploadRequest>(args?.bucket, args.requestId)

export const queries = {
  translationUploadRequestInfo,
}
