import React, { FC, SyntheticEvent } from 'react'
import { Input } from 'vtex.styleguide'
import { useMutation } from 'react-apollo'

import { useLocaleSelector } from '../LocaleSelector'
import { useAlert } from '../../providers/AlertProvider'
import useFormTranslation from '../../hooks/useFormTranslation'
import ActionButtons from '../ActionButtons'
import translateCollectionMutation from '../../graphql/translateCollections.gql'

interface CollectionsFormProps {
  collectionInfo: CollectionsName
  collectionSaveData: SaveArgsV2
  updateMemoCollections: (
    value: React.SetStateAction<{
      [Identifier: string]: CollectionsData
    }>
  ) => void
}

const CollectionsForm: FC<CollectionsFormProps> = ({
  collectionInfo,
  collectionSaveData,
  updateMemoCollections,
}) => {
  const { isXVtexTenant, selectedLocale } = useLocaleSelector()
  const { openAlert } = useAlert()
  const {
    formState,
    canEdit,
    handleInputChange,
    changed,
    handleToggleEdit,
  } = useFormTranslation<CollectionsName>(collectionInfo)

  const [translateCollection, { loading }] = useMutation<
    { translateCollection: boolean },
    { saveArgs: SaveArgsV2 }
  >(translateCollectionMutation)

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault()
    if (loading) {
      return
    }
    const saveArgs: SaveArgsV2 = {
      messages: {
        ...collectionSaveData.messages,
        targetMessage: formState.name,
      },
      to: selectedLocale,
    }
    try {
      const { data, errors } = await translateCollection({
        variables: {
          saveArgs,
        },
      })
      const { translateCollection: translateCollectionResult } = data ?? {}
      if (translateCollectionResult) {
        openAlert('success', 'Collections')
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
