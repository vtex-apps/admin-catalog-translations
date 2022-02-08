/* eslint-disable no-await-in-loop */
import { ReadStream } from 'fs'

import { VBase } from '@vtex/api'
import JSONStream from 'JSONStream'

import { CatalogGQL } from '../../clients/catalogGQL'
import { Messages } from '../../clients/messages'
import {
  pacer,
  COLLECTION_BUCKET,
  calculateExportProcessTime,
  COLLECTION_TRANSLATION_UPLOAD,
  CALLS_PER_MINUTE,
  calculateBreakpoints,
} from '../../utils'

const translateMessagesCollection = async (
  {
    collections,
    requestId,
    locale,
    xVtexTenant,
  }: {
    collections: CollectionTranslationInput[]
    requestId: string
    locale: string
    xVtexTenant: string
  },
  {
    messages,
    catalogGQL,
    vbase,
  }: { messages: Messages; catalogGQL: CatalogGQL; vbase: VBase }
) => {
  const translationRequest = await vbase.getJSON<UploadRequest>(
    COLLECTION_BUCKET,
    requestId,
    true
  )

  try {
    const messagesToTranslate: MessageSaveInput[] = []
    const totalEntries = collections.length
    const breakPointsProgress = calculateBreakpoints(totalEntries)

    for (let i = 0; i < totalEntries; i++) {
      const { data } = await catalogGQL.getCollectionTranslation(
        collections[i].id,
        xVtexTenant
      )

      messagesToTranslate.push({
        srcLang: xVtexTenant,
        srcMessage: data?.collection.name ?? '',
        context: collections[i].id,
        targetMessage: collections[i].name ?? '',
      })

      await pacer(CALLS_PER_MINUTE)
      if (breakPointsProgress.includes(i)) {
        await vbase.saveJSON<UploadRequest>(COLLECTION_BUCKET, requestId, {
          ...translationRequest,
          progress: Math.ceil((i / totalEntries) * 100),
        })
      }
    }

    const saveMessagedPromise = messages.save({
      to: locale,
      messages: messagesToTranslate,
    })

    const updateProgressPromise = vbase.saveJSON<UploadRequest>(
      COLLECTION_BUCKET,
      requestId,
      {
        ...translationRequest,
        progress: 100,
      }
    )

    await Promise.all([saveMessagedPromise, updateProgressPromise])
  } catch (error) {
    const translationRequestUpdated = await vbase.getJSON<UploadRequest>(
      COLLECTION_BUCKET,
      requestId,
      true
    )
    await vbase.saveJSON<UploadRequest>(COLLECTION_BUCKET, requestId, {
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
  {
    collections,
    locale,
    xVtexTenant,
  }: {
    collections: UploadFile<ReadStream>
    locale: string
    xVtexTenant: string
  },
  ctx: Context
) => {
  const {
    clients: { catalogGQL, messages, licenseManager, vbase },
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
    COLLECTION_BUCKET,
    COLLECTION_TRANSLATION_UPLOAD,
    true
  )

  const updateRequests = allTranslationsMade
    ? [requestId, ...allTranslationsMade]
    : [requestId]

  await vbase.saveJSON<string[]>(
    COLLECTION_BUCKET,
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

  await vbase.saveJSON<UploadRequest>(COLLECTION_BUCKET, requestId, requestInfo)

  translateMessagesCollection(
    { collections: collectionsParsed, requestId, locale, xVtexTenant },
    { messages, catalogGQL, vbase }
  )

  return requestId
}

const collectionTranslationsUploadRequests = async (
  _root: unknown,
  _args: unknown,
  ctx: Context
) =>
  ctx.clients.vbase.getJSON<string[]>(
    COLLECTION_BUCKET,
    COLLECTION_TRANSLATION_UPLOAD,
    true
  )

export const mutations = { uploadCollectionTranslations }

export const queries = {
  collectionTranslationsUploadRequests,
}
