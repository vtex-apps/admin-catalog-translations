const translationUploadRequestInfo = (
  _root: unknown,
  args: { requestId: string; bucket: UploadBucket },
  ctx: Context
) => ctx.clients.vbase.getJSON<UploadRequest>(args?.bucket, args.requestId)

const translationRequestInfo = (
  _root: unknown,
  args: { requestId: string; bucket: DownloadBucket },
  ctx: Context
) => ctx.clients.vbase.getJSON(args?.bucket, args.requestId)

export const queries = {
  translationUploadRequestInfo,
  translationRequestInfo,
}
