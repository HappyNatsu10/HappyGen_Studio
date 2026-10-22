import fs from 'fs';
import path from 'path';

const configPath = path.resolve('src/config/firebase.js');
if (!fs.existsSync(configPath)) {
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(
    configPath,
    `import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBGzEqu4lGVCqpot47iG5rTRo6eYkVE9dQ",
  authDomain: "happygen-studio.firebaseapp.com",
  projectId: "happygen-studio",
  storageBucket: "happygen-studio.firebasestorage.app",
  messagingSenderId: "619040765912",
  appId: "1:619040765912:web:d7d6394096afa09ff9e4ad",
  measurementId: "G-VCYV2HRFT1"
};

let app = null;
let auth = null;
let db = null;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.warn("Firebase initialization notice:", e);
}

export { auth, db };
export default app;
`
  );
  console.log('[prebuild] Created fallback src/config/firebase.js');
}
