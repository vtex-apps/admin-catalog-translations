import {
  ParamsContext,
  RecorderState,
  Service,
  ServiceContext,
} from '@vtex/api'

import { Clients } from './clients'
import { resolvers, queries } from './resolvers'

declare global {
  type Context = ServiceContext<Clients, State>

  interface State extends RecorderState {
    locale: string
  }
}

export default new Service<Clients, State, ParamsContext>({
  clients: {
    implementation: Clients,
    options: {
      default: {
        retries: 2,
      },
    },
  },
  graphql: {
    resolvers: {
      ...resolvers,
      Query: {
        ...queries,
      },
    },
  },
})
