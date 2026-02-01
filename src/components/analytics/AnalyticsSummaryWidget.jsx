import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Chip,
  Button,
  LinearProgress,
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material'
import { parseDurationToMinutes, formatMinutesToDuration } from '../../utils/analytics'

function AnalyticsSummaryWidget({ segments, goals }) {
  const navigate = useNavigate()

  // Calculate today's summary
  const todaySummary = {
    totalMinutes: 0,
    segmentsWithActivity: 0,
    goalCounts: new Map()
  }

  if (segments && segments.length > 0) {
    segments.forEach(segment => {
      const minutes = parseDurationToMinutes(segment.duration)
      todaySummary.totalMinutes += minutes

      if (segment.activity || segment.goalId) {
        todaySummary.segmentsWithActivity++
      }

      if (segment.goalId) {
        const count = todaySummary.goalCounts.get(segment.goalId) || 0
        todaySummary.goalCounts.set(segment.goalId, count + minutes)
      }
    })
  }

  // Get top goal
  let topGoal = null
  let topGoalMinutes = 0
  todaySummary.goalCounts.forEach((minutes, goalId) => {
    if (minutes > topGoalMinutes) {
      topGoalMinutes = minutes
      topGoal = goals.find(g => g.id === goalId)
    }
  })

  const completionPercent = segments.length > 0
    ? Math.round((todaySummary.segmentsWithActivity / segments.length) * 100)
    : 0

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Today's Summary
            </Typography>
            <Typography variant="h5" fontWeight={600}>
              {formatMinutesToDuration(todaySummary.totalMinutes)}
            </Typography>
          </Box>
          <Button
            size="small"
            startIcon={<AnalyticsIcon />}
            onClick={() => navigate('/analytics')}
          >
            View Analytics
          </Button>
        </Stack>

        {segments.length > 0 && (
          <>
            <Box sx={{ mb: 2 }}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography variant="body2" color="text.secondary">
                  Completion
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {todaySummary.segmentsWithActivity}/{segments.length} segments
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={completionPercent}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>

            {topGoal && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <TrendingUpIcon fontSize="small" color="primary" />
                <Typography variant="body2" color="text.secondary">
                  Top goal:
                </Typography>
                <Chip
                  label={`${topGoal.name} (${formatMinutesToDuration(topGoalMinutes)})`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Stack>
            )}
          </>
        )}

        {segments.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No time slots created yet. Split your day to start tracking.
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}

export default AnalyticsSummaryWidget
