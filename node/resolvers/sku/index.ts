import { Logger, VBase } from '@vtex/api'

import { CatalogGQL } from '../../clients/catalogGQL'
import {
  ALL_SKU_TRANSLATIONS_FILES,
  PRODUCT_BUCKET,
  calculateExportProcessTime,
  pacer,
} from '../../utils'

const CALLS_PER_MINUTE = 350

export const SKU = {
  locale: (
    _root: ResolvedPromise<SKUTranslationsResponse>,
    _args: unknown,
    ctx: Context
  ) => ctx.state.locale,
  id: (root: ResolvedPromise<SKUTranslationsResponse>) => root.data.sku.id,
  name: (root: ResolvedPromise<SKUTranslationsResponse>) => root.data.sku.name,
}

const saveSkuTranslation = async (
  {
    skuIds,
    locale,
    requestId,
  }: { skuIds: number[]; locale: string; requestId: string },
  {
    catalogGQLClient,
    vbase,
    logger,
  }: { catalogGQLClient: CatalogGQL; vbase: VBase; logger: Logger }
): Promise<void> => {
  const translationRequest = await vbase.getJSON<SKUTranslationRequest>(
    PRODUCT_BUCKET,
    requestId,
    true
  )

  const skuTranslationPromises = []
  try {
    for (const skuId of skuIds) {
      const translationPromise = catalogGQLClient.getSKUTranslation(
        String(skuId),
        locale
      )
      skuTranslationPromises.push(translationPromise)
      // eslint-disable-next-line no-await-in-loop
      await pacer(CALLS_PER_MINUTE)
    }

    const translations = await Promise.all(skuTranslationPromises)

    const updateTranslation = {
      ...translationRequest,
      translations,
      completedAt: new Date(),
    }

    await vbase.saveJSON<SKUTranslationRequest>(
      PRODUCT_BUCKET,
      requestId,
      updateTranslation
    )
  } catch (e) {
    logger.error({
      message: 'Error getting Sku translations',
      error: e,
    })

    const addError = {
      ...translationRequest,
      error: true,
    }
    await vbase.saveJSON<SKUTranslationRequest>(
      PRODUCT_BUCKET,
      requestId,
      addError
    )
  }
}

// TODO: refactor this fn, see node\resolvers\product\index.ts => productTranslations
const skuTranslations = async (
  _root: unknown,
  args: { locale: string; categoryId: string },
  ctx: Context
) => {
  const {
    clients: { catalog, catalogGQL, vbase, licenseManager },
    vtex: { adminUserAuthToken, requestId, logger },
  } = ctx

  const {
    profile: { email },
  } = await licenseManager.getTopbarData(adminUserAuthToken as string)

  const { locale, categoryId } = args

  const skuIdColletion = await catalog.getAllSKUs(categoryId)

  const allSkuTranslationsRequest = await vbase.getJSON<string[]>(
    PRODUCT_BUCKET,
    ALL_SKU_TRANSLATIONS_FILES,
    true
  )

  const updateRequests = allSkuTranslationsRequest
    ? [requestId, ...allSkuTranslationsRequest]
    : [requestId]

  await vbase.saveJSON<string[]>(
    PRODUCT_BUCKET,
    ALL_SKU_TRANSLATIONS_FILES,
    updateRequests
  )

  const requestInfo: SKUTranslationRequest = {
    requestId,
    requestedBy: email,
    categoryId,
    locale,
    createdAt: new Date(),
    estimatedTime: calculateExportProcessTime(
      skuIdColletion.length,
      CALLS_PER_MINUTE
    ),
  }

  await vbase.saveJSON<SKUTranslationRequest>(
    PRODUCT_BUCKET,
    requestId,
    requestInfo
  )

  saveSkuTranslation(
    {
      skuIds: skuIdColletion,
      locale,
      requestId,
    },
    {
      catalogGQLClient: catalogGQL,
      vbase,
      logger,
    }
  )

  return requestInfo
}

const skuTranslationRequests = (_root: unknown, _args: unknown, ctx: Context) =>
  ctx.clients.vbase.getJSON(PRODUCT_BUCKET, ALL_SKU_TRANSLATIONS_FILES, true)

const skuTranslationRequestInfo = (
  _root: unknown,
  args: { requestId: string },
  ctx: Context
) => ctx.clients.vbase.getJSON(PRODUCT_BUCKET, args.requestId)

const downloadSKUTranslation = async (
  _root: unknown,
  args: { requestId: string },
  ctx: Context
) => {
  const {
    clients: { vbase },
  } = ctx

  const { translations, locale } = await vbase.getJSON<SKUTranslationRequest>(
    PRODUCT_BUCKET,
    args.requestId,
    true
  )

  ctx.state.locale = locale

  return translations
}

export const queries = {
  skuTranslations,
  skuTranslationRequests,
  skuTranslationRequestInfo,
  downloadSKUTranslation,
}
