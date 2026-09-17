import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your actual Firebase config object from the Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBGzEqu4lGVCqpot47iG5rTRo6eYkVE9dQ",
  authDomain: "happygen-studio.firebaseapp.com",
  projectId: "happygen-studio",
  storageBucket: "happygen-studio.firebasestorage.app",
  messagingSenderId: "619040765912",
  appId: "1:619040765912:web:d7d6394096afa09ff9e4ad",
  measurementId: "G-VCYV2HRFT1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Authentication and Database instances
export const auth = getAuth(app);
export const db = getFirestore(app);
