interface Binding {
  id: string
  defaultLocale: string
}

interface BindingsData {
  tenantInfo: {
    bindings: Binding[]
  }
}
