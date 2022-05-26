interface Binding {
  id: string
  defaultLocale: string
  supportedLocales: string[]
  targetProduct?: string
}

interface BindingsData {
  tenantInfo: {
    defaultLocale: string
    bindings: Binding[]
  }
}
