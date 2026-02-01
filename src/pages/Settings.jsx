import { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Alert,
  Stack,
  Chip,
  Divider,
} from '@mui/material'
import {
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  NotificationsOff as NotificationsOffIcon,
  Send as SendIcon,
} from '@mui/icons-material'
import { useNotifications } from '../context/NotificationContext'

const INTERVAL_OPTIONS = [
  { value: 1, label: '1 hour' },
  { value: 2, label: '2 hours' },
  { value: 4, label: '4 hours' },
  { value: 8, label: '8 hours' },
]

function Settings() {
  const {
    isSupported,
    permission,
    settings,
    requestPermission,
    updateSettings,
    testNotification
  } = useNotifications()

  const [testingNotification, setTestingNotification] = useState(false)
  const [testResult, setTestResult] = useState(null)

  const handleEnableToggle = async (event) => {
    const enabled = event.target.checked

    if (enabled && permission !== 'granted') {
      const result = await requestPermission()
      if (result !== 'granted') {
        setTestResult({ type: 'error', message: 'Notification permission denied. Please enable in browser settings.' })
        return
      }
    }

    updateSettings({ enabled })
    setTestResult(null)
  }

  const handleIntervalChange = (event) => {
    updateSettings({ intervalHours: event.target.value })
  }

  const handleTestNotification = async () => {
    setTestingNotification(true)
    setTestResult(null)

    try {
      const success = await testNotification()
      if (success) {
        setTestResult({ type: 'success', message: 'Test notification sent!' })
      } else {
        setTestResult({ type: 'error', message: 'Failed to send notification. Check permissions.' })
      }
    } catch (error) {
      setTestResult({ type: 'error', message: 'Error sending notification.' })
    } finally {
      setTestingNotification(false)
    }
  }

  const getPermissionChip = () => {
    switch (permission) {
      case 'granted':
        return <Chip icon={<NotificationsActiveIcon />} label="Enabled" color="success" size="small" />
      case 'denied':
        return <Chip icon={<NotificationsOffIcon />} label="Blocked" color="error" size="small" />
      case 'unsupported':
        return <Chip label="Not Supported" color="default" size="small" />
      default:
        return <Chip icon={<NotificationsIcon />} label="Not Set" color="warning" size="small" />
    }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Configure your notification preferences and app settings.
      </Typography>

      {/* Notification Settings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <NotificationsIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Notifications
            </Typography>
            {getPermissionChip()}
          </Stack>

          {!isSupported && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Notifications are not supported in this browser. Try using Chrome, Firefox, or Edge.
            </Alert>
          )}

          {permission === 'denied' && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Notifications are blocked. Please enable them in your browser settings.
            </Alert>
          )}

          <Divider sx={{ my: 2 }} />

          <Stack spacing={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enabled}
                  onChange={handleEnableToggle}
                  disabled={!isSupported || permission === 'denied'}
                />
              }
              label={
                <Box>
                  <Typography fontWeight={500}>Enable Reminders</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Get notified to log your time at regular intervals
                  </Typography>
                </Box>
              }
            />

            <FormControl fullWidth disabled={!settings.enabled}>
              <InputLabel>Reminder Interval</InputLabel>
              <Select
                value={settings.intervalHours}
                label="Reminder Interval"
                onChange={handleIntervalChange}
              >
                {INTERVAL_OPTIONS.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    Every {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box>
              <Button
                variant="outlined"
                startIcon={<SendIcon />}
                onClick={handleTestNotification}
                disabled={!isSupported || testingNotification}
              >
                {testingNotification ? 'Sending...' : 'Send Test Notification'}
              </Button>
            </Box>

            {testResult && (
              <Alert severity={testResult.type}>
                {testResult.message}
              </Alert>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* PWA Info */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Install App
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Install TimeTracker on your device for quick access and offline support.
          </Typography>

          <Alert severity="info">
            On mobile: Tap the share button and select "Add to Home Screen"<br />
            On desktop: Click the install icon in your browser's address bar
          </Alert>
        </CardContent>
      </Card>
    </Box>
  )
}

export default Settings
