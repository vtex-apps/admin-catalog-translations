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
  openAlert: () => void
}

const AlertContext = createContext<AlertContextInterface>(
  {} as AlertContextInterface
)

const AlertProvider: FC = ({ children }) => {
  const [open, setOpen] = useState<boolean>(false)

  const handleClose = useCallback(() => {
    if (open) {
      setOpen(false)
    }
  }, [open])

  const openAlert = () => {
    setOpen(true)
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
        <div style={{ position: 'absolute', width: '100%' }}>
          <div
            className="mt7"
            style={{ maxWidth: '520px', margin: '2rem auto' }}
          >
            <Alert type="success" onClose={handleClose}>
              The category was translated with success!
            </Alert>
          </div>
        </div>
      ) : null}
      {children}
    </AlertContext.Provider>
  )
}

const useAlert = () => useContext(AlertContext)

export { AlertProvider, useAlert }
