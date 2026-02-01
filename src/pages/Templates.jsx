import { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Stack,
  Chip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import {
  Delete as DeleteIcon,
  Save as SaveIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material'

function Templates({ templates, setTemplates, saveTemplates }) {
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [isSaving, setIsSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, templateId: null })

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const deleteTemplate = (templateId) => {
    setDeleteConfirm({ open: true, templateId })
  }

  const confirmDelete = () => {
    setTemplates(templates.filter(t => t.id !== deleteConfirm.templateId))
    setDeleteConfirm({ open: false, templateId: null })
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await saveTemplates(templates)
      showSnackbar('Templates saved successfully')
    } catch (error) {
      console.error('Failed to save templates:', error)
      showSnackbar('Failed to save templates', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Templates
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Save your time slot configurations as templates to quickly apply them to any day.
      </Typography>

      {templates.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary" gutterBottom>
              No templates yet.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Go to Time Slots, create your day's schedule, and click "Save as Template" to create one.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {templates.map(template => (
              <Grid item xs={12} sm={6} md={4} key={template.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                      <Typography variant="h6" fontWeight={600}>
                        {template.name}
                      </Typography>
                      <Chip
                        icon={<TimeIcon />}
                        label={`${template.hours}h`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Stack>

                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                      <Chip
                        label={`${template.segments.length} slots`}
                        size="small"
                        variant="outlined"
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
                        Created {new Date(template.createdAt).toLocaleDateString()}
                      </Typography>
                    </Stack>

                    {/* Preview slots */}
                    <Box sx={{ bgcolor: 'action.hover', borderRadius: 1, p: 1 }}>
                      {template.segments.slice(0, 3).map((seg, idx) => (
                        <Stack
                          key={idx}
                          direction="row"
                          justifyContent="space-between"
                          sx={{ py: 0.5 }}
                        >
                          <Typography variant="body2" fontWeight={500}>
                            {seg.start}-{seg.end}
                          </Typography>
                          {seg.activity && (
                            <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 120 }}>
                              {seg.activity}
                            </Typography>
                          )}
                        </Stack>
                      ))}
                      {template.segments.length > 3 && (
                        <Typography variant="body2" color="text.secondary" sx={{ pt: 0.5 }}>
                          +{template.segments.length - 3} more slots
                        </Typography>
                      )}
                    </Box>
                  </CardContent>

                  <Box sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => deleteTemplate(template.id)}
                    >
                      Delete
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Stack direction="row" justifyContent="flex-end">
            <Button
              variant="contained"
              color="secondary"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Stack>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, templateId: null })}>
        <DialogTitle>Delete Template</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this template? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm({ open: false, templateId: null })}>
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
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

export default Templates
