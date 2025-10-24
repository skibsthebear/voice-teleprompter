import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCTK43FwiwetXQbhqxoqWGnjK9_oPe4WQ8",
  authDomain: "voice-teleprompter.firebaseapp.com",
  projectId: "voice-teleprompter",
  storageBucket: "voice-teleprompter.firebasestorage.app",
  messagingSenderId: "292275056523",
  appId: "1:292275056523:web:1129aacfe503babc87c98e",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firestore
export const db = getFirestore(app)

// Initialize Auth
export const auth = getAuth(app)
