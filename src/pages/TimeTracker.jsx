import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { subscribeToEntries, saveEntries } from '../services/firestore'
import Toast from '../components/Toast'
import './TimeTracker.css'

function TimeTracker({ goals }) {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })
  const [hours, setHours] = useState('')
  const [segments, setSegments] = useState([])
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const saveTimeoutRef = useRef(null)
  const isInitialLoad = useRef(true)

  // Subscribe to entries for selected date from Firestore
  useEffect(() => {
    if (!user) return

    setIsLoading(true)
    isInitialLoad.current = true

    const unsubscribe = subscribeToEntries(user.uid, selectedDate, (data) => {
      if (data) {
        setSegments(data.segments || [])
        setHours(data.hours || '')
      } else {
        setSegments([])
        setHours('')
      }
      setIsLoading(false)
      // Allow saves after initial load completes
      setTimeout(() => {
        isInitialLoad.current = false
      }, 100)
    })

    return () => unsubscribe()
  }, [user, selectedDate])

  // Save entries with debounce
  useEffect(() => {
    if (!user || isInitialLoad.current || segments.length === 0) return

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await saveEntries(user.uid, selectedDate, {
          hours,
          segments,
          date: selectedDate
        })
        setToastMessage('Entries saved')
        setShowToast(true)
      } catch (error) {
        console.error('Failed to save entries:', error)
        setToastMessage('Failed to save')
        setShowToast(true)
      }
    }, 1000)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [segments, hours, selectedDate, user])

  const hideToast = useCallback(() => {
    setShowToast(false)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    const hoursPerSegment = parseInt(hours, 10)

    if (hoursPerSegment > 0 && hoursPerSegment <= 24) {
      const minutesPerSegment = hoursPerSegment * 60
      const totalDayMinutes = 24 * 60
      const newSegments = []
      let currentMinute = 0
      let segmentId = 1

      while (currentMinute < totalDayMinutes) {
        const remainingMinutes = totalDayMinutes - currentMinute
        const segmentDuration = Math.min(minutesPerSegment, remainingMinutes)
        const endMinute = currentMinute + segmentDuration

        newSegments.push({
          id: segmentId,
          start: formatTime(currentMinute),
          end: formatTime(endMinute, true),
          duration: formatDuration(segmentDuration),
          isPartial: segmentDuration < minutesPerSegment,
          activity: '',
          goalId: ''
        })

        currentMinute = endMinute
        segmentId++
      }

      setSegments(newSegments)
    }
  }

  const formatTime = (totalMinutes, isEnd = false) => {
    const hours = Math.floor(totalMinutes / 60)
    const minutes = Math.round(totalMinutes % 60)
    const displayHours = isEnd && hours === 24 ? 24 : hours % 24
    return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }

  const formatDuration = (minutes) => {
    const hrs = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`
    if (hrs > 0) return `${hrs}h`
    return `${mins}m`
  }

  const updateSegment = (segmentId, field, value) => {
    setSegments(segments.map(seg =>
      seg.id === segmentId ? { ...seg, [field]: value } : seg
    ))
  }

  const formatDisplayDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const isToday = selectedDate === new Date().toISOString().split('T')[0]

  return (
    <div className="timetracker-page">
      <h1>Time Slots</h1>
      <p className="page-description">Split your day into segments and track how you spend your time.</p>

      <div className="date-picker-section">
        <label htmlFor="date">Select Date:</label>
        <input
          type="date"
          id="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
        />
        <span className="date-display">
          {formatDisplayDate(selectedDate)}
          {isToday && <span className="today-badge">Today</span>}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="split-form">
        <label htmlFor="hours">Hours per segment:</label>
        <div className="form-row">
          <input
            type="number"
            id="hours"
            min="1"
            max="24"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            placeholder="e.g., 1, 2, 4, 8..."
          />
          <button type="submit">Split Day</button>
        </div>
      </form>

      {isLoading ? (
        <div className="empty-state">
          <p>Loading entries...</p>
        </div>
      ) : segments.length > 0 ? (
        <div className="segments-section">
          <h2>{segments.length} segment{segments.length > 1 ? 's' : ''}</h2>
          <table className="segments-table">
            <thead>
              <tr>
                <th>Slot</th>
                <th>Duration</th>
                <th>Activity</th>
                <th>Goal</th>
              </tr>
            </thead>
            <tbody>
              {segments.map((segment) => (
                <tr key={segment.id} className={segment.isPartial ? 'partial' : ''}>
                  <td className="slot-cell">
                    {segment.start} - {segment.end}
                  </td>
                  <td className="duration-cell">{segment.duration}</td>
                  <td>
                    <input
                      type="text"
                      className="activity-input"
                      value={segment.activity}
                      onChange={(e) => updateSegment(segment.id, 'activity', e.target.value)}
                      placeholder="What did you do?"
                    />
                  </td>
                  <td>
                    <select
                      className="goal-select"
                      value={segment.goalId}
                      onChange={(e) => updateSegment(segment.id, 'goalId', e.target.value)}
                    >
                      <option value="">Select goal...</option>
                      {goals.map(goal => (
                        <option key={goal.id} value={goal.id}>{goal.name}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <p>Enter hours per segment and click "Split Day" to get started.</p>
          <p className="empty-hint">Your entries will be synced across devices.</p>
        </div>
      )}

      <Toast message={toastMessage} show={showToast} onClose={hideToast} />
    </div>
  )
}

export default TimeTracker
