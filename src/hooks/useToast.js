import { useContext } from 'react'
import { ToastContext } from '../contexts/ToastContext'
import { TOAST_TYPES } from '../constants/toastTypes'

// Custom hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }

  const { addToast } = context

  // Convenience methods
  const toast = {
    success: (message, title = '') => addToast({
      type: TOAST_TYPES.SUCCESS,
      message,
      title,
      duration: 4000
    }),
    error: (message, title = '') => addToast({
      type: TOAST_TYPES.ERROR,
      message,
      title,
      duration: 6000
    }),
    warning: (message, title = '') => addToast({
      type: TOAST_TYPES.WARNING,
      message,
      title,
      duration: 5000
    }),
    info: (message, title = '') => addToast({
      type: TOAST_TYPES.INFO,
      message,
      title,
      duration: 4000
    })
  }

  return toast
}