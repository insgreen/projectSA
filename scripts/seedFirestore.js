import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

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

// Data definitions
import {
  ROUTES,
  INITIAL_BUSES,
  INITIAL_ANNOUNCEMENTS,
  MOCK_STUDENTS,
  MOCK_STAFF,
  MOCK_DRIVERS,
  MOCK_ADMINS
} from '../src/data/routesData.js';
import { INITIAL_CHATBOT_FAQ } from '../src/data/dataStore.js';

async function seed() {
  console.log('เริ่มต้นการสร้าง Collection และ Document บน Firebase Firestore (wu-bus)...');

  // 1. Users
  console.log('\n1. กำลังสร้าง Collection: users...');
  const users = [
    ...MOCK_ADMINS.map(a => ({ ...a, userType: 'admin' })),
    ...MOCK_STUDENTS.map(s => ({ ...s, userType: 'student', roleLabel: 'นักศึกษา' })),
    ...MOCK_STAFF.map(st => ({
      ...st,
      userType: st.status?.includes('บุคลากร') ? 'staff' : 'guest',
      roleLabel: st.status?.includes('บุคลากร') ? 'บุคลากรภายในมหาลัย' : 'บุคคลภายนอก'
    }))
  ];

  for (const user of users) {
    const docRef = doc(db, 'users', String(user.id));
    await setDoc(docRef, {
      ...user,
      createdAt: '2026-01-15T08:00:00Z',
      updatedAt: new Date().toISOString()
    });
    console.log(`   - users/${user.id} (${user.name})`);
  }

  // 2. Drivers
  console.log('\n2. กำลังสร้าง Collection: drivers...');
  for (const driver of MOCK_DRIVERS) {
    const docRef = doc(db, 'drivers', String(driver.id));
    await setDoc(docRef, {
      ...driver,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: new Date().toISOString()
    });
    console.log(`   - drivers/${driver.id} (${driver.name})`);
  }

  // 3. Buses
  console.log('\n3. กำลังสร้าง Collection: buses...');
  for (const bus of INITIAL_BUSES) {
    const routeObj = ROUTES.find(r => r.id === bus.route);
    const polyline = routeObj?.polyline || [];
    const pt = polyline[bus.progressIndex] || polyline[0] || { lat: 8.6475, lng: 99.8936 };

    const docRef = doc(db, 'buses', bus.id);
    await setDoc(docRef, {
      ...bus,
      currentLocation: pt,
      lastUpdated: new Date().toISOString()
    });
    console.log(`   - buses/${bus.id} (สาย ${bus.route} - ${bus.driverName})`);
  }

  // 4. Routes
  console.log('\n4. กำลังสร้าง Collection: routes...');
  for (const route of ROUTES) {
    const docRef = doc(db, 'routes', `route_${route.id}`);
    await setDoc(docRef, {
      id: route.id,
      name: route.name,
      color: route.color,
      bgColor: route.bgColor,
      borderColor: route.borderColor,
      polyline: route.polyline,
      stops: route.stops,
      lastUpdated: new Date().toISOString()
    });
    console.log(`   - routes/route_${route.id} (${route.name})`);
  }

  // 5. Announcements
  console.log('\n5. กำลังสร้าง Collection: announcements...');
  for (const ann of INITIAL_ANNOUNCEMENTS) {
    const docRef = doc(db, 'announcements', `ann_${ann.id}`);
    await setDoc(docRef, {
      ...ann,
      createdAt: new Date().toISOString()
    });
    console.log(`   - announcements/ann_${ann.id} (${ann.title})`);
  }

  // 6. Chatbot FAQ
  console.log('\n6. กำลังสร้าง Collection: chatbot_faq...');
  for (const faq of INITIAL_CHATBOT_FAQ) {
    const docRef = doc(db, 'chatbot_faq', faq.id);
    await setDoc(docRef, {
      ...faq,
      updatedAt: new Date().toISOString()
    });
    console.log(`   - chatbot_faq/${faq.id} (${faq.question})`);
  }

  // 7. Reports (Sample record)
  console.log('\n7. กำลังสร้าง Collection: reports (Initial setup)...');
  const sampleReport = {
    id: 'REP-1001',
    busId: 'WU-101',
    driverId: '600101',
    userId: '68108596',
    category: 'การขับขี่เร็ว/หวาดเสียว',
    location: 'อาคารกิจกรรม',
    timestamp: '14:30 น.',
    details: 'ขับรถค่อนข้างเร็วบริเวณทางโค้งหอพัก',
    scoreImpact: -3,
    status: 'รอตรวจสอบ',
    adminNote: '',
    resolvedAt: null,
    createdAt: new Date().toISOString()
  };
  await setDoc(doc(db, 'reports', sampleReport.id), sampleReport);
  console.log(`   - reports/${sampleReport.id}`);

  console.log('\nสร้าง Collections และข้อมูลทั้งหมดบน Firebase Firestore สำเร็จเรียบร้อย 100%!');
  process.exit(0);
}

seed().catch(err => {
  console.error('\nเกิดข้อผิดพลาดในการเชื่อมต่อหรือเขียน Firestore:');
  console.error(err);
  process.exit(1);
});
