import { ReadStream } from 'fs'

import { VBase } from '@vtex/api'
import JSONStream from 'JSONStream'

import { CatalogGQL } from '../../clients/catalogGQL'
import {
  pacer,
  COLLECTION_NAME,
  calculateExportProcessTime,
  COLLECTION_TRANSLATION_UPLOAD,
} from '../../utils'

const CALLS_PER_MINUTE = 1600

const calculateBreakpoints = (size: number): number[] => {
  return [
    Math.ceil(size * 0.25),
    Math.ceil(size * 0.5),
    Math.ceil(size * 0.75),
  ].filter((num, idx, self) => self.indexOf(num) === idx)
}

const uploadCollectionAsync = async (
  {
    collections,
    requestId,
    locale,
  }: { collections: CollectionTranslationInput[]; requestId: string; locale: string },
  { catalogGQL, vbase }: { catalogGQL: CatalogGQL; vbase: VBase }
) => {
  const translationRequest = await vbase.getJSON<UploadRequest>(
    COLLECTION_NAME,
    requestId,
    true
  )

  try {
    const totalEntries = collections.length

    const breakPointsProgress = calculateBreakpoints(totalEntries)

    let promiseController = []

    for (let i = 0; i < totalEntries; i++) {
      promiseController.push(catalogGQL.translateCollection(collections[i], locale))
      // eslint-disable-next-line no-await-in-loop
      await pacer(CALLS_PER_MINUTE)
      if (breakPointsProgress.includes(i)) {
        // eslint-disable-next-line no-await-in-loop
        await Promise.all(promiseController)

        // eslint-disable-next-line no-await-in-loop
        await vbase.saveJSON<UploadRequest>(COLLECTION_NAME, requestId, {
          ...translationRequest,
          progress: Math.ceil((i / totalEntries) * 100),
        })
        promiseController = []
      }
    }

    await Promise.all(promiseController)
    await vbase.saveJSON<UploadRequest>(COLLECTION_NAME, requestId, {
      ...translationRequest,
      progress: 100,
    })
  } catch (error) {
    const translationRequestUpdated = await vbase.getJSON<UploadRequest>(
      COLLECTION_NAME,
      requestId,
      true
    )
    await vbase.saveJSON<UploadRequest>(COLLECTION_NAME, requestId, {
      ...translationRequestUpdated,
      error: true,
    })
  }
}

const parseStreamToJSON = <T>(stream: ReadStream): Promise<T[]> => {
  const promise = new Promise<T[]>((resolve) => {
    const finalArray: T[] = []
    stream.pipe(
      JSONStream.parse('*').on('data', (data: T) => {
        finalArray.push(data)
      })
    )
    stream.on('end', () => {
      stream.destroy()
      resolve(finalArray)
    })
  })

  return promise
}

const uploadCollectionTranslations = async (
  _root: unknown,
  { collections, locale }: { collections: UploadFile<ReadStream>; locale: string },
  ctx: Context
) => {
  const {
    clients: { catalogGQL, licenseManager, vbase },
    vtex: { adminUserAuthToken, requestId },
  } = ctx

  const { createReadStream } = await collections

  const collectionStream = createReadStream()

  const collectionsParsed = await parseStreamToJSON<CollectionTranslationInput>(
    collectionStream
  )

  const {
    profile: { email },
  } = await licenseManager.getTopbarData(adminUserAuthToken as string)

  const allTranslationsMade = await vbase.getJSON<string[]>(
    COLLECTION_NAME,
    COLLECTION_TRANSLATION_UPLOAD,
    true
  )

  const updateRequests = allTranslationsMade
    ? [requestId, ...allTranslationsMade]
    : [requestId]

  await vbase.saveJSON<string[]>(
    COLLECTION_NAME,
    COLLECTION_TRANSLATION_UPLOAD,
    updateRequests
  )

  const requestInfo = {
    requestId,
    locale,
    translatedBy: email,
    createdAt: new Date(),
    estimatedTime: calculateExportProcessTime(
      collectionsParsed.length,
      CALLS_PER_MINUTE
    ),
  }

  await vbase.saveJSON<UploadRequest>(COLLECTION_NAME, requestId, requestInfo)

  uploadCollectionAsync(
    { collections: collectionsParsed, requestId, locale },
    { catalogGQL, vbase }
  )

  return requestId
}

const collectionTranslationsUploadRequests = async (
  _root: unknown,
  _args: unknown,
  ctx: Context
) =>
  ctx.clients.vbase.getJSON<string[]>(
    COLLECTION_NAME,
    COLLECTION_TRANSLATION_UPLOAD,
    true
  )

const translationUploadRequestInfo = (
  _root: unknown,
  args: { requestId: string },
  ctx: Context
) => ctx.clients.vbase.getJSON<UploadRequest>(COLLECTION_NAME, args.requestId)

export const mutations = { uploadCollectionTranslations }

export const queries = {
  collectionTranslationsUploadRequests,
  translationUploadRequestInfo,
}
