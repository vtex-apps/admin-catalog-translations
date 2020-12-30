import React, {
  createContext,
  FC,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'
import { Alert } from 'vtex.styleguide'

interface AlertContextInterface {
  openAlert: (status: 'success' | 'error', entry: string) => void
}

const AlertContext = createContext<AlertContextInterface>(
  {} as AlertContextInterface
)

const AlertProvider: FC = ({ children }) => {
  const [entryType, setEntryTipe] = useState('')
  const [open, setOpen] = useState<'success' | 'error' | ''>('')

  const handleClose = useCallback(() => {
    if (open) {
      setOpen('')
    }
  }, [open])

  const openAlert = (status: 'success' | 'error', entry: string) => {
    setEntryTipe(entry)
    setOpen(status)
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      handleClose()
    }, 5000)

    return () => {
      clearTimeout(timeout)
    }
  }, [handleClose, open])

  return (
    <AlertContext.Provider value={{ openAlert }}>
      {open ? (
        <div className="w-100 fixed z-max overflow-hidden">
          <div
            className="mt7"
            style={{ maxWidth: '520px', margin: '2rem auto' }}
          >
            {open === 'success' && (
              <Alert type="success" onClose={handleClose}>
                {`The ${entryType} was translated successfully!`}
              </Alert>
            )}
            {open === 'error' && (
              <Alert type="error" onClose={handleClose}>
                {`There was an error translating ${entryType}. Try again.`}
              </Alert>
            )}
          </div>
        </div>
      ) : null}
      {children}
    </AlertContext.Provider>
  )
}

const useAlert = () => useContext(AlertContext)

export { AlertProvider, useAlert }
