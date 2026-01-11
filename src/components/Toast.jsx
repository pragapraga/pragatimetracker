import { useEffect } from 'react'
import './Toast.css'

function Toast({ message, show, onClose }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose()
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [show, onClose])

  if (!show) return null

  return (
    <div className="toast">
      <span className="toast-icon">&#10003;</span>
      <span className="toast-message">{message}</span>
    </div>
  )
}

export default Toast
