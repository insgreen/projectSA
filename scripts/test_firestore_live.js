import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

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

async function testAllCollections() {
  console.log('🧪 ตรวจสอบการเชื่อมต่อและการอ่านข้อมูลจาก Firestore ทุก Collection...');

  const collections = ['users', 'drivers', 'buses', 'routes', 'announcements', 'chatbot_faq', 'reports'];
  for (const colName of collections) {
    const snap = await getDocs(collection(db, colName));
    console.log(`   ✓ Collection [${colName}]: พบ ${snap.size} documents`);
    if (snap.size === 0) {
      throw new Error(`Collection ${colName} is empty!`);
    }
  }

  // Test Write & Delete Verification
  console.log('\n🧪 ทดสอบการเขียนและลบข้อมูลแบบ Real-time...');
  const testRef = doc(db, 'system_info', 'live_healthcheck');
  await setDoc(testRef, {
    health: 'OK',
    testedAt: new Date().toISOString()
  });
  const check = await getDoc(testRef);
  console.log('   ✓ เขียนข้อมูลทดสอบสำเร็จ:', check.data());
  await deleteDoc(testRef);
  console.log('   ✓ ลบข้อมูลทดสอบเรียบร้อย');

  console.log('\n🎉 ผลการตรวจสอบ Firestore: ใช้งานได้สมบูรณ์แบบ 100%!');
  process.exit(0);
}

testAllCollections().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
