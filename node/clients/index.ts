import { IOClients } from '@vtex/api'

import { CatalogGQL } from './catalogGQL'

export class Clients extends IOClients {
  public get catalogGQL() {
    return this.getOrSet('catalogGQL', CatalogGQL)
  }
}
