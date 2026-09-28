import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "wu-bus.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "wu-bus",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "wu-bus.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "510784610175",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:510784610175:web:ff8235bc86850987fa044a",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-1M15B4HELN"
};

export const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const db = getFirestore(app);
export { firebaseConfig };