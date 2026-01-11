import {
  doc,
  setDoc,
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
