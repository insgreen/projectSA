
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAZ_SQ9RO_1LKGbXrpviPO1Qj_cpZFLEus",
  authDomain: "wu-bus.firebaseapp.com",
  projectId: "wu-bus",
  storageBucket: "wu-bus.firebasestorage.app",
  messagingSenderId: "510784610175",
  appId: "1:510784610175:web:ff8235bc86850987fa044a",
  measurementId: "G-1M15B4HELN"
};

export const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const db = getFirestore(app);