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
  openAlert: (status: 'success' | 'error') => void
}

const AlertContext = createContext<AlertContextInterface>(
  {} as AlertContextInterface
)

const AlertProvider: FC = ({ children }) => {
  const [open, setOpen] = useState<'success' | 'error' | ''>('')

  const handleClose = useCallback(() => {
    if (open) {
      setOpen('')
    }
  }, [open])

  const openAlert = (status: 'success' | 'error') => {
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
                The category was translated successfully!
              </Alert>
            )}
            {open === 'error' && (
              <Alert type="error" onClose={handleClose}>
                There was an error translation category. Try again.
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
