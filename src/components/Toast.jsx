import React, { useState, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react'
import { TOAST_TYPES } from '../constants/toastTypes'
import { ToastContext } from '../contexts/ToastContext'

// Toast item component
const ToastItem = ({ toast, onRemove }) => {
  const getIcon = () => {
    switch (toast.type) {
      case TOAST_TYPES.SUCCESS:
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case TOAST_TYPES.ERROR:
        return <XCircle className="w-5 h-5 text-red-600" />
      case TOAST_TYPES.WARNING:
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
      case TOAST_TYPES.INFO:
        return <Info className="w-5 h-5 text-blue-600" />
      default:
        return <Info className="w-5 h-5 text-gray-600" />
    }
  }

  const getBgColor = () => {
    switch (toast.type) {
      case TOAST_TYPES.SUCCESS:
        return 'bg-green-50 border-green-200'
      case TOAST_TYPES.ERROR:
        return 'bg-red-50 border-red-200'
      case TOAST_TYPES.WARNING:
        return 'bg-yellow-50 border-yellow-200'
      case TOAST_TYPES.INFO:
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className={`
      ${getBgColor()}
      border rounded-lg shadow-lg p-4 mb-3 
      transform transition-all duration-300 ease-in-out
      hover:shadow-xl animate-slide-in-right
    `}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            {toast.title && (
              <p className="text-sm font-semibold text-gray-900 mb-1">
                {toast.title}
              </p>
            )}
            <p className="text-sm text-gray-700">
              {toast.message}
            </p>
          </div>
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// Toast container component
const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 w-96 max-w-sm">
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={removeToast}
        />
      ))}
    </div>
  )
}

// Toast provider component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random()
    const newToast = {
      id,
      type: TOAST_TYPES.INFO,
      duration: 5000,
      ...toast
    }

    setToasts(prev => [...prev, newToast])

    // Auto remove after duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
      }, newToast.duration)
    }

    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const removeAllToasts = useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider value={{
      toasts,
      addToast,
      removeToast,
      removeAllToasts
    }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}