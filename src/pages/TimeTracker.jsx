import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { subscribeToEntries, saveEntries } from '../services/firestore'
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItemButton,
  ListItemText,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material'
import {
  Save as SaveIcon,
  BookmarkAdd as TemplateIcon,
  PlaylistAdd as ApplyIcon,
} from '@mui/icons-material'
import AnalyticsSummaryWidget from '../components/analytics/AnalyticsSummaryWidget'

function TimeTracker({ goals, templates, addTemplate }) {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })
  const [hours, setHours] = useState('')
  const [segments, setSegments] = useState([])
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [showApplyModal, setShowApplyModal] = useState(false)

  useEffect(() => {
    if (!user) return

    setIsLoading(true)

    const unsubscribe = subscribeToEntries(user.uid, selectedDate, (data) => {
      if (data) {
        setSegments(data.segments || [])
        setHours(data.hours || '')
      } else {
        setSegments([])
        setHours('')
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [user, selectedDate])

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleSaveEntries = async () => {
    if (!user || segments.length === 0) return

    setIsSaving(true)
    try {
      await saveEntries(user.uid, selectedDate, {
        hours,
        segments,
        date: selectedDate
      })
      showSnackbar('Entries saved successfully')
    } catch (error) {
      console.error('Failed to save entries:', error)
      showSnackbar('Failed to save entries', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveAsTemplate = async () => {
    if (!templateName.trim()) return

    const template = {
      id: Date.now(),
      name: templateName.trim(),
      hours: hours,
      segments: segments.map(seg => ({
        start: seg.start,
        end: seg.end,
        duration: seg.duration,
        isPartial: seg.isPartial,
        activity: seg.activity,
        goalId: seg.goalId
      })),
      createdAt: new Date().toISOString()
    }

    try {
      await addTemplate(template)
      showSnackbar('Template saved successfully')
      setShowTemplateModal(false)
      setTemplateName('')
    } catch (error) {
      console.error('Failed to save template:', error)
      showSnackbar('Failed to save template', 'error')
    }
  }

  const applyTemplate = (template) => {
    if (hasExistingData()) {
      if (!window.confirm('You have existing entries. Applying a template will replace all data. Continue?')) {
        return
      }
    }

    setHours(template.hours)
    setSegments(template.segments.map((seg, idx) => ({
      ...seg,
      id: idx + 1
    })))
    setShowApplyModal(false)
    showSnackbar(`Template "${template.name}" applied`)
  }

  const hasExistingData = () => {
    return segments.some(seg => seg.activity || seg.goalId)
  }

  const createSegments = (hoursPerSegment) => {
    const minutesPerSegment = hoursPerSegment * 60
    const totalDayMinutes = 24 * 60
    const newSegments = []
    let currentMinute = 0
    let segmentId = 1

    while (currentMinute < totalDayMinutes) {
      const remainingMinutes = totalDayMinutes - currentMinute
      const segmentDuration = Math.min(minutesPerSegment, remainingMinutes)
      const endMinute = currentMinute + segmentDuration

      newSegments.push({
        id: segmentId,
        start: formatTime(currentMinute),
        end: formatTime(endMinute, true),
        duration: formatDuration(segmentDuration),
        isPartial: segmentDuration < minutesPerSegment,
        activity: '',
        goalId: ''
      })

      currentMinute = endMinute
      segmentId++
    }

    setSegments(newSegments)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const hoursPerSegment = parseInt(hours, 10)

    if (hoursPerSegment > 0 && hoursPerSegment <= 24) {
      if (hasExistingData()) {
        if (!window.confirm('You have existing entries. Recreating segments will clear all data. Continue?')) {
          return
        }
      }
      createSegments(hoursPerSegment)
    }
  }

  const formatTime = (totalMinutes, isEnd = false) => {
    const hrs = Math.floor(totalMinutes / 60)
    const mins = Math.round(totalMinutes % 60)
    const displayHours = isEnd && hrs === 24 ? 24 : hrs % 24
    return `${displayHours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  const formatDuration = (minutes) => {
    const hrs = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`
    if (hrs > 0) return `${hrs}h`
    return `${mins}m`
  }

  const updateSegment = (segmentId, field, value) => {
    setSegments(segments.map(seg =>
      seg.id === segmentId ? { ...seg, [field]: value } : seg
    ))
  }

  const formatDisplayDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const isToday = selectedDate === new Date().toISOString().split('T')[0]

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Time Slots
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Split your day into segments and track how you spend your time.
      </Typography>

      {/* Date Picker */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
            <TextField
              type="date"
              label="Select Date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              inputProps={{ max: new Date().toISOString().split('T')[0] }}
              size="small"
              sx={{ minWidth: 180 }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {formatDisplayDate(selectedDate)}
              </Typography>
              {isToday && <Chip label="Today" color="secondary" size="small" />}
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Analytics Summary Widget */}
      {!isLoading && segments.length > 0 && (
        <AnalyticsSummaryWidget segments={segments} goals={goals} />
      )}

      {/* Split Form */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Typography variant="subtitle2" gutterBottom>
              Hours per segment:
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                type="number"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="e.g., 1, 2, 4, 8..."
                inputProps={{ min: 1, max: 24 }}
                size="small"
                sx={{ width: { xs: '100%', sm: 200 } }}
              />
              <Button type="submit" variant="contained" color="primary">
                Split Day
              </Button>
              {templates && templates.length > 0 && (
                <Button
                  variant="outlined"
                  startIcon={<ApplyIcon />}
                  onClick={() => setShowApplyModal(true)}
                >
                  Apply Template
                </Button>
              )}
            </Stack>
          </form>
        </CardContent>
      </Card>

      {/* Segments Table */}
      {isLoading ? (
        <Card>
          <CardContent sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </CardContent>
        </Card>
      ) : segments.length > 0 ? (
        <>
          <Typography variant="h6" gutterBottom>
            {segments.length} segment{segments.length > 1 ? 's' : ''}
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Slot</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Activity</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Goal</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {segments.map((segment) => (
                  <TableRow
                    key={segment.id}
                    sx={{
                      bgcolor: segment.isPartial ? 'warning.light' : 'inherit',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <TableCell sx={{ fontWeight: 500, whiteSpace: 'nowrap' }}>
                      {segment.start} - {segment.end}
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
                      {segment.duration}
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        value={segment.activity}
                        onChange={(e) => updateSegment(segment.id, 'activity', e.target.value)}
                        placeholder="What did you do?"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <FormControl fullWidth size="small">
                        <Select
                          value={segment.goalId}
                          onChange={(e) => updateSegment(segment.id, 'goalId', e.target.value)}
                          displayEmpty
                        >
                          <MenuItem value="">
                            <em>Select goal...</em>
                          </MenuItem>
                          {goals.map(goal => (
                            <MenuItem key={goal.id} value={goal.id}>{goal.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              startIcon={<TemplateIcon />}
              onClick={() => setShowTemplateModal(true)}
            >
              Save as Template
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<SaveIcon />}
              onClick={handleSaveEntries}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Entries'}
            </Button>
          </Stack>
        </>
      ) : (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              Enter hours per segment and click "Split Day" to get started.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Your entries will be synced across devices.
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Save as Template Dialog */}
      <Dialog open={showTemplateModal} onClose={() => setShowTemplateModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Save as Template</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Give your template a name to easily identify it later.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Template Name"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTemplateModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveAsTemplate}>Save Template</Button>
        </DialogActions>
      </Dialog>

      {/* Apply Template Dialog */}
      <Dialog open={showApplyModal} onClose={() => setShowApplyModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Apply Template</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select a template to apply to this day.
          </Typography>
          <List>
            {templates?.map(template => (
              <ListItemButton
                key={template.id}
                onClick={() => applyTemplate(template)}
                sx={{ borderRadius: 1, mb: 1, border: 1, borderColor: 'divider' }}
              >
                <ListItemText
                  primary={template.name}
                  secondary={`${template.hours}h segments - ${template.segments.length} slots`}
                />
              </ListItemButton>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowApplyModal(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default TimeTracker
