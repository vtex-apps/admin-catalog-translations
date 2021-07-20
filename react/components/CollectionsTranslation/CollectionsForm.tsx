import React, { SyntheticEvent } from 'react'
import { Input } from 'vtex.styleguide'
import { useMutation } from 'react-apollo'
import { SaveArgsV2 } from 'vtex.messages'

import { useLocaleSelector } from '../LocaleSelector'
import { useAlert } from '../../providers/AlertProvider'
import useFormTranslation from '../../hooks/useFormTranslation'
import ActionButtons from '../ActionButtons'
import TRANSLATE_MESSAGES from '../../graphql/translateMessages.gql'

interface CollectionsFormProps {
  collectionInfo: Collections
  srcMessage: string
  updateMemoCollections: () => void
}

const CollectionsForm = ({
  collectionInfo,
  srcMessage,
  updateMemoCollections,
}: CollectionsFormProps) => {
  const { isXVtexTenant, selectedLocale, xVtexTenant } = useLocaleSelector()
  const { openAlert } = useAlert()
  const {
    formState,
    canEdit,
    handleInputChange,
    changed,
    handleToggleEdit,
  } = useFormTranslation<CollectionsName>(collectionInfo)

  const [translateCollection, { loading }] = useMutation<
    { saveV2: boolean },
    { saveArgs: SaveArgsV2 }
  >(TRANSLATE_MESSAGES)
  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault()
    if (loading) {
      return
    }
    const saveArgs: SaveArgsV2 = {
      messages: [
        {
          srcLang: xVtexTenant,
          context: collectionInfo.id,
          srcMessage,
          targetMessage: formState.name,
        },
      ],
      to: selectedLocale,
    }
    try {
      const { data, errors } = await translateCollection({
        variables: {
          saveArgs,
        },
      })
      const { saveV2: translateCollectionResponse } = data ?? {}
      if (translateCollectionResponse) {
        openAlert('success', 'Collections')
        updateMemoCollections()
      }
      if (errors?.length) {
        throw new TypeError('Error translation Collections')
      }
    } catch (err) {
      openAlert('error', 'Collections')
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="mb5">
          <Input
            label="Name"
            value={formState.name}
            name="name"
            disabled={isXVtexTenant || !canEdit}
            onChange={handleInputChange}
            required
          />
        </div>
        {isXVtexTenant ? null : (
          <ActionButtons
            toggleEdit={handleToggleEdit}
            canEdit={canEdit}
            changed={changed}
            loading={loading}
          />
        )}
      </form>
    </div>
  )
}

export default CollectionsForm
