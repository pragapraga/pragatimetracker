import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { subscribeToGoals, saveGoals } from './services/firestore'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import TimeTracker from './pages/TimeTracker'
import Goals from './pages/Goals'
import './App.css'

function AppContent() {
  const { user } = useAuth()
  const [goals, setGoals] = useState([])
  const [goalsLoaded, setGoalsLoaded] = useState(false)

  // Subscribe to goals from Firestore
  useEffect(() => {
    if (!user) {
      setGoals([])
      setGoalsLoaded(false)
      return
    }

    const unsubscribe = subscribeToGoals(user.uid, (loadedGoals) => {
      setGoals(loadedGoals)
      setGoalsLoaded(true)
    })

    return () => unsubscribe()
  }, [user])

  // Save goals to Firestore when they change
  const updateGoals = async (newGoals) => {
    setGoals(newGoals)
    if (user) {
      await saveGoals(user.uid, newGoals)
    }
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<TimeTracker goals={goals} />} />
          <Route path="goals" element={<Goals goals={goals} setGoals={updateGoals} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
