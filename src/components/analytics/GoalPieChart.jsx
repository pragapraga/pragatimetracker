import { useTheme as useMuiTheme } from '@mui/material/styles'
import { Box, Typography, useMediaQuery } from '@mui/material'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const COLORS = ['#646cff', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16']

function GoalPieChart({ data, title = 'Goal Distribution' }) {
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
    value: item.totalMinutes,
    percentage: item.percentage,
    fill: COLORS[index % COLORS.length]
  }))

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <Box sx={{
          bgcolor: 'background.paper',
          p: 1.5,
          borderRadius: 1,
          boxShadow: 2,
          border: 1,
          borderColor: 'divider'
        }}>
          <Typography variant="body2" fontWeight={600}>{data.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {Math.floor(data.value / 60)}h {data.value % 60}m ({data.percentage}%)
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
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={isMobile ? 40 : 60}
            outerRadius={isMobile ? 70 : 100}
            paddingAngle={2}
            dataKey="value"
            label={!isMobile ? ({ name, percentage }) => `${name} (${percentage}%)` : false}
            labelLine={!isMobile}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {isMobile && <Legend />}
        </PieChart>
      </ResponsiveContainer>
    </Box>
  )
}

export default GoalPieChart
