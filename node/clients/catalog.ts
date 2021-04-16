import {
  InstanceOptions,
  IOContext,
  JanusClient,
  RequestConfig,
} from '@vtex/api'

import {
  statusToError,
  interations,
  getInterationPairs,
  extractProductId,
  MAX_PRODUCTS_PER_CATEGORY,
} from '../utils'

export class Catalog extends JanusClient {
  constructor(ctx: IOContext, opts?: InstanceOptions) {
    super(ctx, {
      ...opts,
      headers: {
        ...opts?.headers,
        ...(ctx.adminUserAuthToken
          ? { VtexIdclientAutCookie: ctx.adminUserAuthToken }
          : null),
      },
    })
  }

  public getAllProducts = async (categoryId: string) => {
    const { range, ...products } = await this.getProductIdsByCategory(
      categoryId,
      1,
      MAX_PRODUCTS_PER_CATEGORY
    )
    const { total } = range
    const remainingInterations = interations(total)
    const productPerCategorypromises = []

    // /GetProductAndSkuIds returns max 50 responses. We loop over the remaining interations to get all products
    for (let i = 1; i <= remainingInterations; i++) {
      const [from, to] = getInterationPairs(i)
      const productPerIdPromise = this.getProductIdsByCategory(
        categoryId,
        from,
        to
      )
      productPerCategorypromises.push(productPerIdPromise)
    }

    const productPerCategoryCollection = await Promise.all(
      productPerCategorypromises
    )

    const finalProducts = []

    // we plug together the first response and all the others. Then we extract only the product ids from responses
    for (const product of [products, ...productPerCategoryCollection]) {
      const productIds = extractProductId(product.data)
      finalProducts.push(...productIds)
    }
    return finalProducts
  }

  private getProductIdsByCategory = (
    categoryId: string,
    _from: number,
    _to: number
  ) => {
    return this.get<GetProductAndSkuIds>(this.routes.getProductAndSkuIds(), {
      params: { categoryId, _from, _to },
    })
  }

  protected get = <T>(url: string, config: RequestConfig = {}) => {
    try {
      return this.http.get<T>(url, config)
    } catch (e) {
      return statusToError(e)
    }
  }

  private get routes() {
    const basePath = '/api/catalog_system'

    return {
      getProductAndSkuIds: () => `${basePath}/pvt/products/GetProductAndSkuIds`,
    }
  }
}
