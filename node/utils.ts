import { ReadStream } from 'fs'

import {
  AuthenticationError,
  ForbiddenError,
  GraphQLResponse,
  Serializable,
  UserInputError,
  VBase,
} from '@vtex/api'
import type { AxiosError } from 'axios'
import JSONStream from 'JSONStream'

import { CatalogGQL } from './clients/catalogGQL'

const ONE_MINUTE = 60 * 1000
export const CALLS_PER_MINUTE = 1600
export const BUCKET_NAME = 'product-translation'
export const ALL_TRANSLATIONS_FILES = 'all-translations'
export const ALL_SKU_TRANSLATIONS_FILES = 'all-sku-translations'
export const PRODUCT_TRANSLATION_UPLOAD = 'product-upload'
export const BRAND_TRANSLATION_UPLOAD = 'brand-upload'
export const BRAND_NAME = 'brand-translation'
export const FIELD_TRANSLATION_UPLOAD = 'field-upload'
export const FIELD_NAME = 'field-translation'

export const statusToError = (e: AxiosError) => {
  if (!e.response) {
    throw e
  }

  const {
    response: { status },
  } = e

  switch (status) {
    case 401: {
      throw new AuthenticationError(e)
    }

    case 403: {
      throw new ForbiddenError(e)
    }

    case 400: {
      throw new UserInputError(e)
    }

    default:
      throw new TypeError(e.message)
  }
}

export const MAX_PRODUCTS_PER_CATEGORY = 50

export const interations = (total: number) => {
  return (
    Math.floor(total / MAX_PRODUCTS_PER_CATEGORY) -
    (total % MAX_PRODUCTS_PER_CATEGORY ? 0 : 1)
  )
}

export const getInterationPairs = (currentStep: number): number[] => [
  MAX_PRODUCTS_PER_CATEGORY * currentStep + 1,
  MAX_PRODUCTS_PER_CATEGORY * currentStep + 50,
]

export const extractProductId = (productResponse: Record<string, number[]>) => {
  return Object.keys(productResponse)
}

export const extractSkuId = (productResponse: Record<string, number[]>) => {
  return Object.values(productResponse).flat()
}

export const pacer = (callsPerMinute: number) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve('done')
    }, ONE_MINUTE / callsPerMinute)
  })

export const calculateExportProcessTime = (
  size: number,
  callsPerMinute: number
): number => Math.ceil(size * (ONE_MINUTE / callsPerMinute))

export const calculateBreakpoints = (size: number): number[] => {
  return [
    Math.ceil(size * 0.25),
    Math.ceil(size * 0.5),
    Math.ceil(size * 0.75),
  ].filter((num, idx, self) => self.indexOf(num) === idx)
}

export const parseStreamToJSON = <T>(stream: ReadStream): Promise<T[]> => {
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

export const uploadEntriesAsync = async <T>(
  {
    entries,
    requestId,
    locale,
    bucket,
    translateEntry,
  }: {
    entries: T[]
    requestId: string
    locale: string
    bucket: string
    translateEntry: <T>( // TODO: send object instead two properties
      entry: T,
      locale: string
    ) => Promise<GraphQLResponse<Serializable>>
  },
  { vbase }: { vbase: VBase }
) => {
  const translationRequest = await vbase.getJSON<UploadRequest>(
    bucket,
    requestId,
    true
  )

  try {
    const totalEntries = entries.length

    const breakPointsProgress = calculateBreakpoints(totalEntries)

    let promiseController = []
    for (let i = 0; i < totalEntries; i++) {
      promiseController.push(translateEntry<T>(entries[i], locale))
      // eslint-disable-next-line no-await-in-loop
      await pacer(CALLS_PER_MINUTE)
      if (breakPointsProgress.includes(i)) {
        // eslint-disable-next-line no-await-in-loop
        await Promise.all(promiseController)

        // eslint-disable-next-line no-await-in-loop
        await vbase.saveJSON<UploadRequest>(bucket, requestId, {
          ...translationRequest,
          progress: Math.ceil((i / totalEntries) * 100),
        })
        promiseController = []
      }
    }

    await Promise.all(promiseController)
    await vbase.saveJSON<UploadRequest>(bucket, requestId, {
      ...translationRequest,
      progress: 100,
    })
  } catch (error) {
    const translationRequestUpdated = await vbase.getJSON<UploadRequest>(
      bucket,
      requestId,
      true
    )
    await vbase.saveJSON<UploadRequest>(bucket, requestId, {
      ...translationRequestUpdated,
      error: true,
    })
  }
}

// TODO: use this instead of saveTranslationsToVBase
export async function saveTranslationsEntriesToVBase<T, X>(
  {
    entries,
    params,
    getEntryTranslation,
  }: InterfaceTranslationsEntriesToVBase<T>,
  { vbase }: { catalogGQLClient: CatalogGQL; vbase: VBase }
): Promise<void> {
  const { requestId, bucket } = params
  const translationRequest = await vbase.getJSON<TranslationRequest<X>>(
    bucket,
    requestId,
    true
  )
  const entryTranslationPromises = []
  try {
    for (const entry of entries) {
      const currentParams: EntryTranslationParams<T> = {
        ...params,
        entry,
      }
      const translationPromise = getEntryTranslation(currentParams)
      entryTranslationPromises.push(translationPromise)
      // eslint-disable-next-line no-await-in-loop
      await pacer(CALLS_PER_MINUTE)
    }

    const translations = await Promise.all(entryTranslationPromises)

    const updateTranslation = {
      ...translationRequest,
      translations,
      completedAt: new Date(),
    }

    await vbase.saveJSON<TranslationRequest<X>>(
      bucket,
      requestId,
      updateTranslation
    )
  } catch {
    const addError = {
      ...translationRequest,
      error: true,
    }
    await vbase.saveJSON<TranslationRequest<X>>(bucket, requestId, addError)
  }
}
