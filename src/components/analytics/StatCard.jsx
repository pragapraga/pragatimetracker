import { Card, CardContent, Typography, Box } from '@mui/material'

function StatCard({ title, value, subtitle, icon, color = 'primary.main' }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={600} color={color}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {icon && (
            <Box sx={{
              color: color,
              bgcolor: `${color}15`,
              p: 1,
              borderRadius: 2,
              display: 'flex'
            }}>
              {icon}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

export default StatCard
