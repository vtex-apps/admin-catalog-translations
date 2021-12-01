interface MessageSaveInput {
  srcLang: string
  srcMessage: string
  context?: string
  targetMessage: string
  groupContext?: string
}

interface SaveInput {
  fireEvent?: boolean
  to: string
  messages: MessageSaveInput[]
}

interface RequestTracingUserConfig {
  rootSpan?: Span
  referenceType?: SpanReferenceTypes
  requestSpanNameSuffix?: string
}

interface RequestTracingConfig {
  tracing?: RequestTracingUserConfig
}
