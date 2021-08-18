import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { FormattedMessage, IntlShape, useIntl } from 'react-intl'
import { Modal, Pagination, Table } from 'vtex.styleguide'

const tableSchemaGenerator = (intl: IntlShape) => ({
  properties: {
    line: {
      title: intl.formatMessage({
        id: 'catalog-translation.import.table-header.line',
      }),
    },
    missingFields: {
      title: intl.formatMessage({
        id: 'catalog-translation.import.table-header.missing-fields',
      }),
      // eslint-disable-next-line react/display-name
      cellRenderer: ({ cellData }: { cellData: string[] }) => (
        <p>{cellData.join(', ')}</p>
      ),
    },
  },
})

interface ComponentProps {
  modalName: string
  isOpen: boolean
  handleClose: Dispatch<SetStateAction<boolean>>
  data: Message[]
}

const ITEM_FROM = 0
const STEPS = 10

const WarningAndErrorsImportModal = ({
  modalName,
  isOpen,
  handleClose,
  data,
}: ComponentProps) => {
  const [slicedData, setSlicedData] = useState<Message[]>([])
  const [from, setFrom] = useState(ITEM_FROM)
  const [to, setTo] = useState(ITEM_FROM + STEPS)
  const intl = useIntl()

  useEffect(() => {
    setSlicedData(data.slice(ITEM_FROM, ITEM_FROM + STEPS))
  }, [data])

  const handleNext = () => {
    const nextFrom = from + STEPS
    const nextNext = nextFrom + STEPS

    setFrom(nextFrom)
    setTo(nextNext)
    const selectedData = data.slice(nextFrom, nextNext)
    setSlicedData(selectedData)
  }

  const handlePrev = () => {
    const nextFrom = from - STEPS
    const nextNext = nextFrom + STEPS

    setFrom(nextFrom)
    setTo(nextNext)
    const selectedData = data.slice(nextFrom, nextNext)
    setSlicedData(selectedData)
  }

  const tableSchema = useMemo(() => tableSchemaGenerator(intl), [intl])

  return (
    <Modal isOpen={isOpen} onClose={() => handleClose(false)}>
      <Pagination
        currentItemFrom={from + 1}
        currentItemTo={to}
        textOf={
          <FormattedMessage id="catalog-translation.import.warning-and-error" />
        }
        totalItems={data.length}
        onNextClick={handleNext}
        onPrevClick={handlePrev}
      >
        <h4>{modalName}</h4>
        <Table
          fullWidth
          density="high"
          items={slicedData}
          schema={tableSchema}
        />
      </Pagination>
    </Modal>
  )
}

export default WarningAndErrorsImportModal
