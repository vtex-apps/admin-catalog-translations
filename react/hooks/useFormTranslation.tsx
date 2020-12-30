import { FormEvent, useEffect, useState } from 'react'

import { hasChanges } from '../utils'

function useFormTranslation<S>(entryInfo: S) {
  const [formState, setFormState] = useState(entryInfo)
  const [canEdit, setCanEdit] = useState<boolean>(false)

  useEffect(() => {
    setCanEdit(false)
    setFormState(entryInfo)
  }, [entryInfo])

  const handleInputChange = (e: FormEvent<HTMLInputElement>) => {
    const { name: fieldName, value } = e.currentTarget

    setFormState((state) => ({
      ...state,
      ...{ [fieldName]: value },
    }))
  }

  const changed = hasChanges<S>(formState, entryInfo)

  const handleToggleEdit = () => {
    if (canEdit) {
      setCanEdit(false)
      setFormState(entryInfo)
    } else {
      setCanEdit(true)
    }
  }

  return { formState, canEdit, handleInputChange, changed, handleToggleEdit }
}

export default useFormTranslation
