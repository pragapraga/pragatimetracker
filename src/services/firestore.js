import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore'
import { db } from '../firebase'

// Goals - stored as a single document per user
export function subscribeToGoals(userId, callback) {
  console.log('Subscribing to goals for user:', userId)
  const goalsRef = doc(db, 'users', userId, 'data', 'goals')

  return onSnapshot(
    goalsRef,
    (snapshot) => {
      console.log('Goals snapshot received:', snapshot.exists())
      if (snapshot.exists()) {
        callback(snapshot.data().items || [])
      } else {
        callback([])
      }
    },
    (error) => {
      console.error('Goals subscription error:', error)
    }
  )
}

export async function saveGoals(userId, goals) {
  console.log('Saving goals for user:', userId, goals)
  try {
    const goalsRef = doc(db, 'users', userId, 'data', 'goals')
    await setDoc(goalsRef, { items: goals, updatedAt: new Date() })
    console.log('Goals saved successfully')
  } catch (error) {
    console.error('Error saving goals:', error)
    throw error
  }
}

// Entries - stored per date
export function subscribeToEntries(userId, date, callback) {
  console.log('Subscribing to entries for user:', userId, 'date:', date)
  const entriesRef = doc(db, 'users', userId, 'entries', date)

  return onSnapshot(
    entriesRef,
    (snapshot) => {
      console.log('Entries snapshot received:', snapshot.exists())
      if (snapshot.exists()) {
        callback(snapshot.data())
      } else {
        callback(null)
      }
    },
    (error) => {
      console.error('Entries subscription error:', error)
    }
  )
}

export async function saveEntries(userId, date, data) {
  console.log('Saving entries for user:', userId, 'date:', date)
  try {
    const entriesRef = doc(db, 'users', userId, 'entries', date)
    await setDoc(entriesRef, { ...data, updatedAt: new Date() })
    console.log('Entries saved successfully')
  } catch (error) {
    console.error('Error saving entries:', error)
    throw error
  }
}

// Templates - stored as a single document per user
export function subscribeToTemplates(userId, callback) {
  console.log('Subscribing to templates for user:', userId)
  const templatesRef = doc(db, 'users', userId, 'data', 'templates')

  return onSnapshot(
    templatesRef,
    (snapshot) => {
      console.log('Templates snapshot received:', snapshot.exists())
      if (snapshot.exists()) {
        callback(snapshot.data().items || [])
      } else {
        callback([])
      }
    },
    (error) => {
      console.error('Templates subscription error:', error)
    }
  )
}

export async function saveTemplates(userId, templates) {
  console.log('Saving templates for user:', userId)
  try {
    const templatesRef = doc(db, 'users', userId, 'data', 'templates')
    await setDoc(templatesRef, { items: templates, updatedAt: new Date() })
    console.log('Templates saved successfully')
  } catch (error) {
    console.error('Error saving templates:', error)
    throw error
  }
}

/**
 * Fetch entries for a date range
 * Fetches individual documents in parallel since Firestore doesn't support
 * range queries on document IDs
 * @param {string} userId - User ID
 * @param {string} startDate - Start date YYYY-MM-DD
 * @param {string} endDate - End date YYYY-MM-DD
 * @returns {Promise<Array>} - Array of entry objects
 */
export async function fetchEntriesForDateRange(userId, startDate, endDate) {
  const fetchPromises = []
  const current = new Date(startDate)
  const end = new Date(endDate)

  // Generate all dates in range and fetch in parallel
  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0]
    const entryRef = doc(db, 'users', userId, 'entries', dateStr)
    fetchPromises.push(
      getDoc(entryRef).then(snapshot => {
        if (snapshot.exists()) {
          return { ...snapshot.data(), date: dateStr }
        }
        return null
      })
    )
    current.setDate(current.getDate() + 1)
  }

  // Fetch all in parallel
  const results = await Promise.all(fetchPromises)
  return results.filter(entry => entry !== null)
}
