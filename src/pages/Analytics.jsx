import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchEntriesForDateRange } from '../services/firestore'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material'
import {
  AccessTime as TimeIcon,
  CalendarMonth as CalendarIcon,
  Flag as GoalIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material'
import DateRangePicker from '../components/analytics/DateRangePicker'
import StatCard from '../components/analytics/StatCard'
import GoalPieChart from '../components/analytics/GoalPieChart'
import GoalBarChart from '../components/analytics/GoalBarChart'
import TimelineChart from '../components/analytics/TimelineChart'
import {
  calculateAnalytics,
  calculateDailyTotals,
  formatMinutesToDuration,
  getDateRangePresets,
} from '../utils/analytics'

function Analytics({ goals }) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [entries, setEntries] = useState([])

  // Default to last 7 days
  const presets = getDateRangePresets()
  const [startDate, setStartDate] = useState(presets[0].start)
  const [endDate, setEndDate] = useState(presets[0].end)

  const fetchData = useCallback(async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const data = await fetchEntriesForDateRange(user.uid, startDate, endDate)
      setEntries(data)
    } catch (err) {
      console.error('Failed to fetch analytics data:', err)
      setError('Failed to load analytics data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [user, startDate, endDate])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDateChange = (newStart, newEnd) => {
    setStartDate(newStart)
    setEndDate(newEnd)
  }

  // Calculate analytics
  const analytics = calculateAnalytics(entries, goals)
  const dailyTotals = calculateDailyTotals(entries, startDate, endDate)

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Analytics
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        View insights and trends from your time tracking data.
      </Typography>

      {/* Date Range Picker */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onDateChange={handleDateChange}
          />
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Summary Stats */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 6, sm: 6, md: 3 }}>
              <StatCard
                title="Total Time"
                value={analytics.totalTrackedFormatted}
                icon={<TimeIcon />}
                color="primary.main"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 6, md: 3 }}>
              <StatCard
                title="Days Tracked"
                value={analytics.daysWithData}
                subtitle={`of ${dailyTotals.length} days`}
                icon={<CalendarIcon />}
                color="secondary.main"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 6, md: 3 }}>
              <StatCard
                title="Avg per Day"
                value={formatMinutesToDuration(analytics.averageMinutesPerDay)}
                icon={<TrendingIcon />}
                color="info.main"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 6, md: 3 }}>
              <StatCard
                title="Goals Tracked"
                value={analytics.goalBreakdown.length}
                subtitle="active goals"
                icon={<GoalIcon />}
                color="warning.main"
              />
            </Grid>
          </Grid>

          {/* Timeline Chart */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <TimelineChart data={dailyTotals} title="Daily Activity" />
            </CardContent>
          </Card>

          {/* Goal Charts */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <GoalPieChart data={analytics.goalBreakdown} title="Goal Distribution" />
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <GoalBarChart data={analytics.goalBreakdown} title="Time by Goal" />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Goal Details Table */}
          {analytics.goalBreakdown.length > 0 && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Goal Breakdown
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {analytics.goalBreakdown.map((goal, index) => (
                    <Box key={goal.id}>
                      <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        py: 1.5
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              bgcolor: ['#646cff', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'][index % 6]
                            }}
                          />
                          <Typography fontWeight={500}>{goal.name}</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography fontWeight={600}>{goal.formattedDuration}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {goal.percentage}%
                          </Typography>
                        </Box>
                      </Box>
                      {index < analytics.goalBreakdown.length - 1 && <Divider />}
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}

          {entries.length === 0 && (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <Typography color="text.secondary" gutterBottom>
                  No data for the selected date range.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Start tracking your time on the Time Slots page to see analytics here.
                </Typography>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Box>
  )
}

export default Analytics
