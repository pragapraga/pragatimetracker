const NOTIFICATION_SETTINGS_KEY = 'timetracker_notification_settings'
const LAST_NOTIFICATION_KEY = 'timetracker_last_notification'

/**
 * Check if notifications are supported
 */
export function isNotificationSupported() {
  return 'Notification' in window && 'serviceWorker' in navigator
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission() {
  if (!isNotificationSupported()) return 'unsupported'
  return Notification.permission
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission() {
  if (!isNotificationSupported()) {
    return 'unsupported'
  }

  try {
    const permission = await Notification.requestPermission()
    return permission
  } catch (error) {
    console.error('Error requesting notification permission:', error)
    return 'denied'
  }
}

/**
 * Show a notification
 */
export async function showNotification(title, options = {}) {
  if (!isNotificationSupported()) return false
  if (Notification.permission !== 'granted') return false

  try {
    const registration = await navigator.serviceWorker.ready
    await registration.showNotification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      vibrate: [200, 100, 200],
      tag: 'timetracker-reminder',
      renotify: true,
      ...options
    })
    return true
  } catch (error) {
    console.error('Error showing notification:', error)
    return false
  }
}

/**
 * Send a time tracking reminder notification
 */
export async function sendReminderNotification() {
  const success = await showNotification('Time to log your activity!', {
    body: 'Open TimeTracker to record what you\'ve been doing.',
    data: { url: '/' },
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  })

  if (success) {
    localStorage.setItem(LAST_NOTIFICATION_KEY, Date.now().toString())
  }

  return success
}

/**
 * Get notification settings from localStorage
 */
export function getNotificationSettings() {
  try {
    const stored = localStorage.getItem(NOTIFICATION_SETTINGS_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Error reading notification settings:', error)
  }

  return {
    enabled: false,
    intervalHours: 2
  }
}

/**
 * Save notification settings to localStorage
 */
export function saveNotificationSettings(settings) {
  try {
    localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings))
    return true
  } catch (error) {
    console.error('Error saving notification settings:', error)
    return false
  }
}

/**
 * Get the timestamp of the last notification
 */
export function getLastNotificationTime() {
  const stored = localStorage.getItem(LAST_NOTIFICATION_KEY)
  return stored ? parseInt(stored, 10) : 0
}

/**
 * Check if a notification is due based on the interval
 */
export function isNotificationDue(intervalHours) {
  const lastNotification = getLastNotificationTime()
  const intervalMs = intervalHours * 60 * 60 * 1000
  return Date.now() - lastNotification >= intervalMs
}

/**
 * Start the notification scheduler
 * Returns a cleanup function to stop the scheduler
 */
export function startNotificationScheduler(intervalHours, onNotification) {
  const intervalMs = intervalHours * 60 * 60 * 1000

  // Check immediately if notification is due
  if (isNotificationDue(intervalHours)) {
    sendReminderNotification().then(success => {
      if (success && onNotification) onNotification()
    })
  }

  // Set up interval for future notifications
  const intervalId = setInterval(() => {
    sendReminderNotification().then(success => {
      if (success && onNotification) onNotification()
    })
  }, intervalMs)

  // Return cleanup function
  return () => clearInterval(intervalId)
}

/**
 * Register service worker notification click handler
 */
export function setupNotificationClickHandler() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
        window.focus()
        if (event.data.url) {
          window.location.href = event.data.url
        }
      }
    })
  }
}
