import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getAuth, connectAuthEmulator } from 'firebase/auth'

// Check if Firebase is configured
const isFirebaseConfigured = process.env.FIREBASE_PROJECT_ID && 
  process.env.FIREBASE_CLIENT_EMAIL && 
  process.env.FIREBASE_PRIVATE_KEY

const firebaseConfig = isFirebaseConfigured ? {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
} : {
  // Default config for development
  projectId: 'demo-project',
  clientEmail: 'demo@example.com',
  privateKey: 'demo-key',
}

// Initialize Firebase only if configured
let app: any = null
let db: any = null
let auth: any = null

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
    db = getFirestore(app)
    auth = getAuth(app)
  } catch (error) {
    console.warn('Firebase initialization failed:', error)
  }
} else {
  console.warn('Firebase not configured. Using mock data.')
}

export { db, auth }

// Connect to emulators in development
if (process.env.NODE_ENV === 'development') {
  try {
    if (!db._delegate._settings?.host?.includes('localhost')) {
      connectFirestoreEmulator(db, 'localhost', 8080)
    }
    if (!auth._delegate._config?.emulator) {
      connectAuthEmulator(auth, 'http://localhost:9099')
    }
  } catch (error) {
    // Emulators already connected
    console.log('Firebase emulators already connected')
  }
}

export default app
