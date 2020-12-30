declare module '*.gql' {
  import { DocumentNode } from 'graphql'

  const value: DocumentNode
  export default value
}

declare module 'graphql' {
  export { DocumentNode } from 'graphql'
}
