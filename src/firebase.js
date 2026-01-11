import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyB79P2psI4FTaEaoL1LM-K-DwviWZ8-3do",
  authDomain: "praga-timetracker.firebaseapp.com",
  projectId: "praga-timetracker",
  storageBucket: "praga-timetracker.firebasestorage.app",
  messagingSenderId: "102401423128",
  appId: "1:102401423128:web:42c482ff9a82bab96a506d",
  measurementId: "G-Q4V0V4E93Q"
};

const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app);
export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()
