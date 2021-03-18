import { ParamsContext, RecorderState, Service } from '@vtex/api'

import { Clients } from './clients'

export default new Service<Clients, RecorderState, ParamsContext>({
  clients: {
    implementation: Clients,
    options: {
      default: {
        retries: 2,
      },
    },
  },
})
