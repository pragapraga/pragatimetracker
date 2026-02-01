import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { NotificationProvider } from './context/NotificationContext'
import { subscribeToGoals, saveGoals, subscribeToTemplates, saveTemplates } from './services/firestore'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import TimeTracker from './pages/TimeTracker'
import Goals from './pages/Goals'
import Templates from './pages/Templates'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import './App.css'

function AppContent() {
  const { user } = useAuth()
  const [goals, setGoals] = useState([])
  const [goalsLoaded, setGoalsLoaded] = useState(false)
  const [templates, setTemplates] = useState([])

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

  // Subscribe to templates from Firestore
  useEffect(() => {
    if (!user) {
      setTemplates([])
      return
    }

    const unsubscribe = subscribeToTemplates(user.uid, (loadedTemplates) => {
      setTemplates(loadedTemplates)
    })

    return () => unsubscribe()
  }, [user])

  // Update goals locally (without saving)
  const updateGoals = (newGoals) => {
    setGoals(newGoals)
  }

  // Save goals to Firestore
  const persistGoals = async (goalsToSave) => {
    if (user) {
      await saveGoals(user.uid, goalsToSave)
    }
  }

  // Update templates locally
  const updateTemplates = (newTemplates) => {
    setTemplates(newTemplates)
  }

  // Save templates to Firestore
  const persistTemplates = async (templatesToSave) => {
    if (user) {
      await saveTemplates(user.uid, templatesToSave)
    }
  }

  // Add a new template
  const addTemplate = async (template) => {
    const newTemplates = [...templates, template]
    setTemplates(newTemplates)
    if (user) {
      await saveTemplates(user.uid, newTemplates)
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
          <Route index element={<TimeTracker goals={goals} templates={templates} addTemplate={addTemplate} />} />
          <Route path="goals" element={<Goals goals={goals} setGoals={updateGoals} saveGoals={persistGoals} />} />
          <Route path="analytics" element={<Analytics goals={goals} />} />
          <Route path="templates" element={<Templates templates={templates} setTemplates={updateTemplates} saveTemplates={persistTemplates} />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
