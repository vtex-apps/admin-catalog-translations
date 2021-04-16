import { IOClients } from '@vtex/api'

import { CatalogGQL } from './catalogGQL'
import { Catalog } from './catalog'

export class Clients extends IOClients {
  public get catalogGQL() {
    return this.getOrSet('catalogGQL', CatalogGQL)
  }

  public get catalog() {
    return this.getOrSet('catalog', Catalog)
  }
}
