import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

if (typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile('.env');
  } catch (err) {
    // optional if variables already in process.env
  }
}

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "wu-bus.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "wu-bus",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "wu-bus.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "510784610175",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:510784610175:web:ff8235bc86850987fa044a",
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || "G-1M15B4HELN"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testAllCollections() {
  console.log('ตรวจสอบการเชื่อมต่อและการอ่านข้อมูลจาก Firestore ทุก Collection...');

  const collections = ['users', 'drivers', 'buses', 'routes', 'announcements', 'chatbot_faq', 'reports'];
  for (const colName of collections) {
    const snap = await getDocs(collection(db, colName));
    console.log(`   - Collection [${colName}]: พบ ${snap.size} documents`);
    if (snap.size === 0) {
      throw new Error(`Collection ${colName} is empty!`);
    }
  }

  // Test Write & Delete Verification
  console.log('\nทดสอบการเขียนและลบข้อมูลแบบ Real-time...');
  const testRef = doc(db, 'system_info', 'live_healthcheck');
  await setDoc(testRef, {
    health: 'OK',
    testedAt: new Date().toISOString()
  });
  const check = await getDoc(testRef);
  console.log('   - เขียนข้อมูลทดสอบสำเร็จ:', check.data());
  await deleteDoc(testRef);
  console.log('   - ลบข้อมูลทดสอบเรียบร้อย');

  console.log('\nผลการตรวจสอบ Firestore: ใช้งานได้สมบูรณ์แบบ 100%!');
  process.exit(0);
}

testAllCollections().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
