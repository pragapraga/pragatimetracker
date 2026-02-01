import { useTheme as useMuiTheme } from '@mui/material/styles'
import { Box, Typography, useMediaQuery } from '@mui/material'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const COLORS = ['#646cff', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16']

function GoalBarChart({ data, title = 'Time by Goal' }) {
  const theme = useMuiTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  if (!data || data.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">No data available</Typography>
      </Box>
    )
  }

  const chartData = data.map((item, index) => ({
    name: item.name,
    hours: Math.round(item.totalMinutes / 60 * 10) / 10,
    fill: COLORS[index % COLORS.length]
  }))

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box sx={{
          bgcolor: 'background.paper',
          p: 1.5,
          borderRadius: 1,
          boxShadow: 2,
          border: 1,
          borderColor: 'divider'
        }}>
          <Typography variant="body2" fontWeight={600}>{label}</Typography>
          <Typography variant="body2" color="text.secondary">
            {payload[0].value} hours
          </Typography>
        </Box>
      )
    }
    return null
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight={600}>
        {title}
      </Typography>
      <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
        <BarChart
          data={chartData}
          layout={isMobile ? 'vertical' : 'horizontal'}
          margin={{ top: 10, right: 20, left: isMobile ? 80 : 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          {isMobile ? (
            <>
              <XAxis type="number" tick={{ fill: theme.palette.text.secondary }} />
              <YAxis dataKey="name" type="category" tick={{ fill: theme.palette.text.secondary }} width={70} />
            </>
          ) : (
            <>
              <XAxis dataKey="name" tick={{ fill: theme.palette.text.secondary }} />
              <YAxis tick={{ fill: theme.palette.text.secondary }} />
            </>
          )}
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  )
}

export default GoalBarChart
