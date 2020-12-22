import React, { FC } from 'react'
import { ButtonGroup, Button } from 'vtex.styleguide'

type LocaleSelectorProps = {
  bindings: Binding[]
  selectedLocale: Binding
  handleLocaleSelection: (arg: Binding) => void
}

const LocaleSelector: FC<LocaleSelectorProps> = ({
  bindings,
  selectedLocale,
  handleLocaleSelection,
}) => {
  return (
    <div>
      <ButtonGroup
        buttons={bindings.map(({ id: bindingId, defaultLocale }) => (
          <div key={bindingId}>
            <Button
              isActiveOfGroup={defaultLocale === selectedLocale.defaultLocale}
              variation={
                defaultLocale === selectedLocale.defaultLocale
                  ? 'primary'
                  : 'secondary'
              }
              onClick={() =>
                handleLocaleSelection({ id: bindingId, defaultLocale })
              }
            >
              {defaultLocale}
            </Button>
          </div>
        ))}
      />
    </div>
  )
}

export default LocaleSelector
