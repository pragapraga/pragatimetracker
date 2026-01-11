import {
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  deleteDoc
} from 'firebase/firestore'
import { db } from '../firebase'

// Goals - stored as a single document per user
export function subscribeToGoals(userId, callback) {
  const goalsRef = doc(db, 'users', userId, 'data', 'goals')

  return onSnapshot(goalsRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data().items || [])
    } else {
      callback([])
    }
  })
}

export async function saveGoals(userId, goals) {
  const goalsRef = doc(db, 'users', userId, 'data', 'goals')
  await setDoc(goalsRef, { items: goals, updatedAt: new Date() })
}

// Entries - stored per date
export function subscribeToEntries(userId, date, callback) {
  const entriesRef = doc(db, 'users', userId, 'entries', date)

  return onSnapshot(entriesRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data())
    } else {
      callback(null)
    }
  })
}

export async function saveEntries(userId, date, data) {
  const entriesRef = doc(db, 'users', userId, 'entries', date)
  await setDoc(entriesRef, { ...data, updatedAt: new Date() })
}
