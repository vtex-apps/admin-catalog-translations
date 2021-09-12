import React from 'react'
import { ButtonWithIcon, IconUpload } from 'vtex.styleguide'

import { useLocaleSelector } from './LocaleSelector'

interface Props {
  openImport: HandleOpen
}

const ImportButton = ({ openImport }: Props) => {
  const { isXVtexTenant } = useLocaleSelector()

  return isXVtexTenant ? null : (
    <div className="ml7">
      <ButtonWithIcon
        name="import-catalog"
        type="button"
        icon={<IconUpload />}
        variation="primary"
        onClick={() => openImport(true)}
      >
        Import
      </ButtonWithIcon>
    </div>
  )
}

export default ImportButton
