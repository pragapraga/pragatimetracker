/**
 * Parse duration string to minutes
 * Handles: "8h", "30m", "1h 30m", "2h30m"
 * @param {string} duration - Duration string
 * @returns {number} - Duration in minutes
 */
export function parseDurationToMinutes(duration) {
  if (!duration || typeof duration !== 'string') return 0

  let totalMinutes = 0
  const hourMatch = duration.match(/(\d+)\s*h/i)
  const minuteMatch = duration.match(/(\d+)\s*m/i)

  if (hourMatch) {
    totalMinutes += parseInt(hourMatch[1], 10) * 60
  }
  if (minuteMatch) {
    totalMinutes += parseInt(minuteMatch[1], 10)
  }

  return totalMinutes
}

/**
 * Format minutes to readable duration string
 * @param {number} minutes - Total minutes
 * @returns {string} - Formatted string like "8h 30m"
 */
export function formatMinutesToDuration(minutes) {
  if (minutes <= 0) return '0m'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`
  if (hours > 0) return `${hours}h`
  return `${mins}m`
}

/**
 * Calculate analytics from entries array
 * @param {Array} entries - Array of entry objects with segments
 * @param {Array} goals - Array of goal objects
 * @returns {Object} - Analytics data
 */
export function calculateAnalytics(entries, goals) {
  // Initialize goal map
  const goalMap = new Map(goals.map(g => [g.id, { ...g, totalMinutes: 0 }]))
  goalMap.set('unassigned', { id: 'unassigned', name: 'Unassigned', totalMinutes: 0 })

  let totalTrackedMinutes = 0
  let totalSegments = 0
  let daysWithData = 0

  // Process each entry
  entries.forEach(entry => {
    if (!entry?.segments?.length) return
    daysWithData++

    entry.segments.forEach(segment => {
      const minutes = parseDurationToMinutes(segment.duration)
      totalTrackedMinutes += minutes
      totalSegments++

      const goalId = segment.goalId || 'unassigned'
      if (goalMap.has(goalId)) {
        goalMap.get(goalId).totalMinutes += minutes
      } else {
        // Handle orphaned goalIds
        goalMap.get('unassigned').totalMinutes += minutes
      }
    })
  })

  // Convert to array and calculate percentages
  const goalBreakdown = Array.from(goalMap.values())
    .filter(g => g.totalMinutes > 0)
    .map(g => ({
      ...g,
      percentage: totalTrackedMinutes > 0
        ? Math.round((g.totalMinutes / totalTrackedMinutes) * 100)
        : 0,
      formattedDuration: formatMinutesToDuration(g.totalMinutes)
    }))
    .sort((a, b) => b.totalMinutes - a.totalMinutes)

  return {
    totalTrackedMinutes,
    totalTrackedFormatted: formatMinutesToDuration(totalTrackedMinutes),
    totalSegments,
    daysWithData,
    averageMinutesPerDay: daysWithData > 0
      ? Math.round(totalTrackedMinutes / daysWithData)
      : 0,
    goalBreakdown
  }
}

/**
 * Calculate daily totals for timeline chart
 * @param {Array} entries - Array of entry objects
 * @param {string} startDate - Start date YYYY-MM-DD
 * @param {string} endDate - End date YYYY-MM-DD
 * @returns {Array} - Array of { date, totalMinutes, formattedDuration }
 */
export function calculateDailyTotals(entries, startDate, endDate) {
  const entryMap = new Map(entries.map(e => [e.date, e]))
  const result = []

  const current = new Date(startDate)
  const end = new Date(endDate)

  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0]
    const entry = entryMap.get(dateStr)
    let totalMinutes = 0

    if (entry?.segments) {
      entry.segments.forEach(seg => {
        totalMinutes += parseDurationToMinutes(seg.duration)
      })
    }

    result.push({
      date: dateStr,
      shortDate: current.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      totalMinutes,
      totalHours: Math.round(totalMinutes / 60 * 10) / 10
    })

    current.setDate(current.getDate() + 1)
  }

  return result
}

/**
 * Generate date range presets
 * @returns {Array} - Preset options
 */
export function getDateRangePresets() {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  // Last 7 days
  const week = new Date(today)
  week.setDate(week.getDate() - 6)

  // Last 30 days
  const month = new Date(today)
  month.setDate(month.getDate() - 29)

  // This week (Sunday to today)
  const thisWeekStart = new Date(today)
  thisWeekStart.setDate(today.getDate() - today.getDay())

  // This month (1st to today)
  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)

  return [
    { label: 'Last 7 Days', start: week.toISOString().split('T')[0], end: todayStr },
    { label: 'Last 30 Days', start: month.toISOString().split('T')[0], end: todayStr },
    { label: 'This Week', start: thisWeekStart.toISOString().split('T')[0], end: todayStr },
    { label: 'This Month', start: thisMonthStart.toISOString().split('T')[0], end: todayStr },
  ]
}
