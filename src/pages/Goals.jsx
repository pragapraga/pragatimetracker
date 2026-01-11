import { useState, useCallback } from 'react'
import Toast from '../components/Toast'
import './Goals.css'

function Goals({ goals, setGoals }) {
  const [newGoal, setNewGoal] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const showToastMessage = (message) => {
    setToastMessage(message)
    setShowToast(true)
  }

  const hideToast = useCallback(() => {
    setShowToast(false)
  }, [])

  const addGoal = (e) => {
    e.preventDefault()
    if (newGoal.trim()) {
      setGoals([...goals, { id: Date.now(), name: newGoal.trim() }])
      setNewGoal('')
      showToastMessage('Goal added')
    }
  }

  const deleteGoal = (goalId) => {
    setGoals(goals.filter(g => g.id !== goalId))
    showToastMessage('Goal deleted')
  }

  return (
    <div className="goals-page">
      <h1>Goals</h1>
      <p className="page-description">Create and manage your goals. These will appear in the time slot dropdown.</p>

      <form onSubmit={addGoal} className="goal-form">
        <input
          type="text"
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          placeholder="Enter a new goal..."
        />
        <button type="submit">Add Goal</button>
      </form>

      {goals.length === 0 ? (
        <div className="empty-state">
          <p>No goals yet. Add your first goal above!</p>
        </div>
      ) : (
        <div className="goals-grid">
          {goals.map(goal => (
            <div key={goal.id} className="goal-card">
              <span className="goal-name">{goal.name}</span>
              <button onClick={() => deleteGoal(goal.id)} className="delete-btn">Delete</button>
            </div>
          ))}
        </div>
      )}

      <Toast message={toastMessage} show={showToast} onClose={hideToast} />
    </div>
  )
}

export default Goals
