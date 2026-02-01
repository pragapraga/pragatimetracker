import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  getNotificationSettings,
  saveNotificationSettings,
  startNotificationScheduler,
  sendReminderNotification,
  setupNotificationClickHandler
} from '../services/notificationService'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const [permission, setPermission] = useState(() => getNotificationPermission())
  const [settings, setSettings] = useState(() => getNotificationSettings())
  const [isSupported] = useState(() => isNotificationSupported())
  const [schedulerCleanup, setSchedulerCleanup] = useState(null)

  // Set up notification click handler on mount
  useEffect(() => {
    setupNotificationClickHandler()
  }, [])

  // Start/stop scheduler based on settings
  useEffect(() => {
    // Clean up previous scheduler
    if (schedulerCleanup) {
      schedulerCleanup()
      setSchedulerCleanup(null)
    }

    // Start new scheduler if enabled and has permission
    if (settings.enabled && permission === 'granted') {
      const cleanup = startNotificationScheduler(settings.intervalHours)
      setSchedulerCleanup(() => cleanup)
    }

    // Cleanup on unmount
    return () => {
      if (schedulerCleanup) {
        schedulerCleanup()
      }
    }
  }, [settings.enabled, settings.intervalHours, permission])

  const requestPermission = useCallback(async () => {
    const result = await requestNotificationPermission()
    setPermission(result)
    return result
  }, [])

  const updateSettings = useCallback((newSettings) => {
    const updated = { ...settings, ...newSettings }
    setSettings(updated)
    saveNotificationSettings(updated)
  }, [settings])

  const testNotification = useCallback(async () => {
    if (permission !== 'granted') {
      const result = await requestPermission()
      if (result !== 'granted') return false
    }
    return sendReminderNotification()
  }, [permission, requestPermission])

  const value = {
    isSupported,
    permission,
    settings,
    requestPermission,
    updateSettings,
    testNotification
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
