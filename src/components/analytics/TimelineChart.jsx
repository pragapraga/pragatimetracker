import { useTheme as useMuiTheme } from '@mui/material/styles'
import { Box, Typography, useMediaQuery } from '@mui/material'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

function TimelineChart({ data, title = 'Daily Activity' }) {
  const theme = useMuiTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  if (!data || data.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">No data available</Typography>
      </Box>
    )
  }

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
            {payload[0].value} hours tracked
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
      <ResponsiveContainer width="100%" height={isMobile ? 200 : 250}>
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
          <defs>
            <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3} />
              <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis
            dataKey="shortDate"
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            interval={isMobile ? 'preserveStartEnd' : 0}
            angle={isMobile ? -45 : 0}
            textAnchor={isMobile ? 'end' : 'middle'}
          />
          <YAxis
            tick={{ fill: theme.palette.text.secondary }}
            label={{ value: 'Hours', angle: -90, position: 'insideLeft', fill: theme.palette.text.secondary }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="totalHours"
            stroke={theme.palette.primary.main}
            fill="url(#colorHours)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  )
}

export default TimelineChart
