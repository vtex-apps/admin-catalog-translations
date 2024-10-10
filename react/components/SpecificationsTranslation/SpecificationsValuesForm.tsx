import React, { FC, SyntheticEvent, useEffect, useState, FormEvent } from 'react'
import { Input, Button } from 'vtex.styleguide'
import { useMutation } from 'react-apollo'
import { FormattedMessage } from 'react-intl'

import { useLocaleSelector } from '../LocaleSelector'
import translateSpecificationValuesMutation from './graphql/translateSpecificationValues.gql'
import { useAlert } from '../../providers/AlertProvider'

interface SpecificationsFormProps {
  specificationInfo: FieldInputTranslation
  specificationId: string
  specificationValues: Specification[]
}

interface Specification {
  value: string;
  fieldValueId: string;
  isActive: boolean;
}

interface SpecificationValue {
  id: string;
  name: string;
}

const SpecificationsValuesForm: FC<SpecificationsFormProps> = ({
  specificationValues,
  specificationId
}) => {
  const { selectedLocale } = useLocaleSelector()
  const [fieldValuesNames, setFieldValuesNames] = useState<SpecificationValue[]>()
  const [changed, setChanged] = useState<boolean>(false)
  const [canEdit, setCanEdit] = useState<boolean>(false)
  const [translateSpecificationValues, {loading}] = useMutation(translateSpecificationValuesMutation);
  const { openAlert } = useAlert()

  useEffect(() => {
    let values: SpecificationValue[] = []
    specificationValues.map(specification => {
      if(specification.isActive) {
        values.push({
          id: specification.fieldValueId,
          name: specification.value
        })
      }
    })
    setFieldValuesNames(values)
  }, [])

  const handleInputChange = (itemId: any , index: number) => (e: FormEvent<HTMLInputElement>) => {
    const { name: fieldName, value } = e.currentTarget
  
    const newFieldValuesNames = fieldValuesNames?.map(el => {
      if (el.id === itemId) {
        return {...el, name: value};
      }
      return el;
    });
    setFieldValuesNames(newFieldValuesNames)
    setChanged(true)
  }

  const handleToggleEdit = () => {
    setCanEdit(!canEdit)
    setChanged(!changed)
  }

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault()
    try {
      const { data, errors } = await translateSpecificationValues({
        variables: {
          locale: selectedLocale,
          args: {
            fieldId: specificationId,
            fieldValuesNames: fieldValuesNames
          }
        },
      })

      if(data.translateFieldValues) {
        openAlert('success', 'Specifications Values')
        setCanEdit(!canEdit)
      } 
      if (errors?.length) {
        throw new TypeError('Error translation Specifications')
      }
    } catch (err) {
      openAlert('error', 'Specifications')
    }
  }
 

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="mb5">
          {fieldValuesNames ? fieldValuesNames.map((item: SpecificationValue, index) => {
            return (
              <Input
                key={item.id}
                label="Name"
                value={item.name}
                name="name"
                disabled={!canEdit}
                onChange={handleInputChange(item.id, index)}
              />
            )
          }): null}
        </div>
        <div>
          <span className="mr5">
            <Button type="button" variation="secondary" onClick={handleToggleEdit}>
              {canEdit ? (
                <FormattedMessage id="admin/catalog-translation.action-buttons.cancel" />
              ) : (
                <FormattedMessage id="admin/catalog-translation.action-buttons.edit" />
              )}
            </Button>
          </span>
          <span>
            <Button
              type="submit"
              variation="primary"
              disabled={!changed}
              isLoading={loading}
            >
              <FormattedMessage id="admin/catalog-translation.action-buttons.save" />
            </Button>
          </span>
        </div>
      </form>
    </div>
  )
}
export default SpecificationsValuesForm
