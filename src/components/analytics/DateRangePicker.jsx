import { Box, TextField, Stack, Chip, useMediaQuery } from '@mui/material'
import { useTheme as useMuiTheme } from '@mui/material/styles'
import { getDateRangePresets } from '../../utils/analytics'

function DateRangePicker({ startDate, endDate, onDateChange }) {
  const theme = useMuiTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const presets = getDateRangePresets()
  const today = new Date().toISOString().split('T')[0]

  const handlePresetClick = (preset) => {
    onDateChange(preset.start, preset.end)
  }

  const isPresetActive = (preset) => {
    return preset.start === startDate && preset.end === endDate
  }

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {presets.map((preset) => (
            <Chip
              key={preset.label}
              label={preset.label}
              onClick={() => handlePresetClick(preset)}
              color={isPresetActive(preset) ? 'primary' : 'default'}
              variant={isPresetActive(preset) ? 'filled' : 'outlined'}
              sx={{ mb: { xs: 1, sm: 0 } }}
            />
          ))}
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            type="date"
            label="From"
            value={startDate}
            onChange={(e) => onDateChange(e.target.value, endDate)}
            slotProps={{ htmlInput: { max: endDate } }}
            size="small"
            sx={{ width: isMobile ? '100%' : 150 }}
          />
          <TextField
            type="date"
            label="To"
            value={endDate}
            onChange={(e) => onDateChange(startDate, e.target.value)}
            slotProps={{ htmlInput: { min: startDate, max: today } }}
            size="small"
            sx={{ width: isMobile ? '100%' : 150 }}
          />
        </Stack>
      </Stack>
    </Box>
  )
}

export default DateRangePicker
