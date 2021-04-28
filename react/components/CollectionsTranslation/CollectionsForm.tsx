import React, { FC, SyntheticEvent } from 'react'
import { Input, Textarea, Button } from 'vtex.styleguide'
import { useMutation } from 'react-apollo'

import { useLocaleSelector } from '../LocaleSelector'
import { useAlert } from '../../providers/AlertProvider'
import useFormTranslation from '../../hooks/useFormTranslation'
import ActionButtons from '../ActionButtons'

interface CollectionsFormProps {
  updateMemoSpecifications: (
    value: React.SetStateAction<{
      [Identifier: string]: SpecificationsData
    }>
  ) => void
}

const CollectionsForm: FC<CollectionsFormProps> = () => {
  return <main />
}

export default CollectionsForm
