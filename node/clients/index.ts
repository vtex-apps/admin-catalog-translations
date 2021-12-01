import { IOClients } from '@vtex/api'

import { CatalogGQL } from './catalogGQL'
import { Catalog } from './catalog'
import { Messages } from './messages'

export class Clients extends IOClients {
  public get catalogGQL() {
    return this.getOrSet('catalogGQL', CatalogGQL)
  }

  public get catalog() {
    return this.getOrSet('catalog', Catalog)
  }

  public get messages() {
    return this.getOrSet('messages', Messages)
  }
}
