import { MessagesGraphQL } from '@vtex/api'

export class Messages extends MessagesGraphQL {
  public async save(args: SaveInput, tracingConfig?: RequestTracingConfig) {
    const metric = 'messages-saveV2-translation'
    const response = await this.graphql.mutate<
      { saveV2: boolean },
      { args: SaveInput }
    >(
      {
        mutate: `mutation SaveV2($args: SaveArgsV2!) {
          saveV2(args: $args)
        }`,
        variables: { args },
      },
      {
        metric,
        tracing: {
          requestSpanNameSuffix: metric,
          ...tracingConfig?.tracing,
        },
      }
    )

    // eslint-disable-next-line no-console
    console.log('## save - args', args)
    // eslint-disable-next-line no-console
    console.log('## save - response', response)

    return response.data?.saveV2
  }
}
