interface Binding {
  id: string
  defaultLocale: string
  supportedLocales: string[]
}

interface BindingsData {
  tenantInfo: {
    defaultLocale: string
    bindings: Binding[]
  }
}
