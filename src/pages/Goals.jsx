import { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  IconButton,
  Grid,
  Stack,
  Snackbar,
  Alert,
} from '@mui/material'
import {
  Delete as DeleteIcon,
  Save as SaveIcon,
  Add as AddIcon,
} from '@mui/icons-material'

function Goals({ goals, setGoals, saveGoals }) {
  const [newGoal, setNewGoal] = useState('')
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [isSaving, setIsSaving] = useState(false)

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const addGoal = (e) => {
    e.preventDefault()
    if (newGoal.trim()) {
      setGoals([...goals, { id: Date.now(), name: newGoal.trim() }])
      setNewGoal('')
    }
  }

  const deleteGoal = (goalId) => {
    setGoals(goals.filter(g => g.id !== goalId))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await saveGoals(goals)
      showSnackbar('Goals saved successfully')
    } catch (error) {
      console.error('Failed to save goals:', error)
      showSnackbar('Failed to save goals', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Goals
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Create and manage your goals. These will appear in the time slot dropdown.
      </Typography>

      {/* Add Goal Form */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <form onSubmit={addGoal}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="Enter a new goal..."
                size="small"
                sx={{ flex: 1 }}
              />
              <Button
                type="submit"
                variant="contained"
                startIcon={<AddIcon />}
              >
                Add Goal
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>

      {goals.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              No goals yet. Add your first goal above!
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {goals.map(goal => (
              <Grid item xs={12} sm={6} md={4} key={goal.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2,
                    py: 1.5,
                  }}
                >
                  <Typography fontWeight={500}>
                    {goal.name}
                  </Typography>
                  <IconButton
                    onClick={() => deleteGoal(goal.id)}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
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
              {isSaving ? 'Saving...' : 'Save Goals'}
            </Button>
          </Stack>
        </>
      )}

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

export default Goals
