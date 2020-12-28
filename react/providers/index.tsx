import React, { FC } from 'react'

import { BindingProvider } from '../components/LocaleSelector'
import { AlertProvider } from './AlertProvider'

const ProviderWrapper: FC = ({ children }) => (
  <AlertProvider>
    <BindingProvider>{children}</BindingProvider>
  </AlertProvider>
)

export default ProviderWrapper
