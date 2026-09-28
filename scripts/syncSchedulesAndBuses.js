import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAZ_SQ9RO_1LKGbXrpviPO1Qj_cpZFLEus",
  authDomain: "wu-bus.firebaseapp.com",
  projectId: "wu-bus",
  storageBucket: "wu-bus.firebasestorage.app",
  messagingSenderId: "510784610175",
  appId: "1:510784610175:web:ff8235bc86850987fa044a",
  measurementId: "G-1M15B4HELN"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

import {
  ROUTES,
  INITIAL_BUSES,
  INITIAL_SCHEDULES
} from '../src/data/routesData.js';

async function sync() {
  console.log('Synchronizing schedules and buses with Firebase Firestore...');

  // 1. Sync schedules
  for (const sch of INITIAL_SCHEDULES) {
    const docRef = doc(db, 'schedules', sch.id);
    await setDoc(docRef, {
      ...sch,
      updatedAt: new Date().toISOString()
    });
    console.log(`Updated schedule ${sch.id}: ${sch.shiftName} (${sch.status})`);
  }

  // 2. Sync buses
  for (const bus of INITIAL_BUSES) {
    const matchingSchedule = INITIAL_SCHEDULES.find(s => s.busId === bus.id);
    const routeObj = ROUTES.find(r => r.id === bus.route);
    const polyline = routeObj?.polyline || [];
    const pt = polyline[bus.progressIndex] || polyline[0] || { lat: 8.6475, lng: 99.8936 };

    const docRef = doc(db, 'buses', bus.id);
    await setDoc(docRef, {
      ...bus,
      shiftName: matchingSchedule?.shiftName || 'ช่วงเช้า',
      currentLocation: pt,
      lastUpdated: new Date().toISOString()
    });
    console.log(`Updated bus ${bus.id}: ${bus.status} - Shift: ${matchingSchedule?.shiftName}`);
  }

  console.log('Firebase Firestore sync complete!');
  process.exit(0);
}

sync().catch((err) => {
  console.error('Error syncing with Firestore:', err);
  process.exit(1);
});
