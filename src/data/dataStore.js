/**
 * WU BUS CONNECT - CENTRALIZED DATA STORE (LOCAL CACHE + CLOUD FIRESTORE)
 * จัดการข้อมูลแบบ Real-time ร่วมกับ Google Cloud Firestore (wu-bus)
 * พร้อมระบบ LocalStorage Cache ป้องกันอาการกระตุกหรือจอขาว (Zero-Flicker & Offline Resilience)
 */

import {
  ROUTES,
  INITIAL_BUSES,
  INITIAL_REPORTS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_SENSORS,
  INITIAL_SCHEDULES,
  MOCK_STUDENTS,
  MOCK_STAFF,
  MOCK_DRIVERS,
  MOCK_ADMINS
} from './routesData.js';

import { db } from '../firebase.js';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot
} from 'firebase/firestore';

const STORAGE_KEYS = {
  USERS: 'wu_bus_users_v2',
  DRIVERS: 'wu_bus_drivers_v2',
  BUSES: 'wu_bus_buses_v2',
  ROUTES: 'wu_bus_routes_v2',
  REPORTS: 'wu_bus_reports_v2',
  ANNOUNCEMENTS: 'wu_bus_announcements_v2',
  CHATBOT: 'wu_bus_chatbot_v2',
  WAITING: 'wu_bus_waiting_stops_v1',
  SENSORS: 'wu_bus_sensors_v2',
  SCHEDULES: 'wu_bus_schedules_v2',
  TELEMETRY: 'wu_bus_telemetry_v2'
};

export const INITIAL_CHATBOT_FAQ = [
  {
    id: 'FAQ-01',
    question: 'รถมันม่วงให้บริการกี่โมงถึงกี่โมง?',
    answer: 'รถมันม่วงให้บริการทุกวัน ตั้งแต่เวลา 07:00 น. ถึง 21:00 น. โดยช่วงชั่วโมงเร่งด่วนจะมีความถี่ทุก 5-7 นาทีครับ',
    category: 'เวลาให้บริการ'
  },
  {
    id: 'FAQ-02',
    question: 'มีรถวิ่งทั้งหมดกี่สาย?',
    answer: 'มีทั้งหมด 3 สายหลักครับ: สาย 1 (หอพัก - อาคารเรียน), สาย 2 (หอพัก - ศูนย์กีฬา), และสาย 3 (อาคารเรียน - ศูนย์การแพทย์/รพ.)',
    category: 'สายรถ'
  },
  {
    id: 'FAQ-03',
    question: 'จะเช็กที่นั่งว่างได้อย่างไร?',
    answer: 'สามารถคลิกที่เมนู "ที่นั่งว่าง" หรือคลิกที่รูปรถบนแผนที่ ระบบจะแสดงผัง 20 ที่นั่งแบบเรียลไทม์ตามโครงสร้างจริงของรถครับ',
    category: 'การใช้งานระบบ'
  },
  {
    id: 'FAQ-04',
    question: 'หากต้องการร้องเรียนพฤติกรรมการขับรถต้องทำอย่างไร?',
    answer: 'สามารถไปที่เมนู "ร้องเรียน" เลือกป้ายทะเบียนรถและระบุรายละเอียดได้เลยครับ ระบบส่งเรื่องแบบไม่เปิดเผยตัวตนไปยังศูนย์ควบคุมทันที',
    category: 'การร้องเรียน'
  }
];

const getInitialUsers = () => {
  const students = MOCK_STUDENTS.map((s) => ({
    ...s,
    userType: 'student',
    roleLabel: 'นักศึกษา',
    createdAt: '2026-01-15'
  }));
  const staff = MOCK_STAFF.map((st) => ({
    ...st,
    userType: st.status?.includes('บุคลากร') ? 'staff' : 'guest',
    roleLabel: st.status?.includes('บุคลากร') ? 'บุคลากรภายในมหาลัย' : 'บุคคลภายนอก',
    createdAt: '2026-01-15'
  }));
  const admins = MOCK_ADMINS.map((a) => ({
    ...a,
    userType: 'admin',
    createdAt: '2026-01-01'
  }));
  return [...admins, ...students, ...staff];
};

function loadStore(key, fallback) {
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
      localStorage.setItem(key, JSON.stringify(fallback));
    }
  } catch (e) {}
  return fallback;
}

function saveStore(key, data) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    }
  } catch (e) {}
  return false;
}

// ======================================================================
// 1. UserService (Collection: users)
// ======================================================================
export const UserService = {
  getAll: () => loadStore(STORAGE_KEYS.USERS, getInitialUsers()),

  subscribeUsers: (callback) => {
    if (!db) return () => {};
    try {
      const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
        if (!snapshot.empty) {
          const list = [];
          snapshot.forEach((doc) => list.push(doc.data()));
          saveStore(STORAGE_KEYS.USERS, list);
          callback(list);
        }
      }, (err) => {
        console.warn('Firestore users subscription error:', err);
      });
      return unsub;
    } catch (e) {
      console.warn('subscribeUsers error:', e);
      return () => {};
    }
  },

  add: async (newUser) => {
    const list = UserService.getAll();
    if (list.some((u) => String(u.id) === String(newUser.id))) {
      return { success: false, message: 'รหัสประจำตัวนี้มีอยู่ในระบบแล้ว' };
    }
    const created = {
      ...newUser,
      createdAt: newUser.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [created, ...list];
    saveStore(STORAGE_KEYS.USERS, updated);

    // Sync to Firestore
    if (db) {
      try {
        await setDoc(doc(db, 'users', String(created.id)), created);
      } catch (e) {
        console.warn('Firestore setDoc user error:', e);
      }
    }
    return { success: true, data: created };
  },

  update: async (id, updates) => {
    const list = UserService.getAll();
    const idx = list.findIndex((u) => String(u.id) === String(id));
    if (idx === -1) return { success: false, message: 'ไม่พบผู้ใช้' };
    list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
    saveStore(STORAGE_KEYS.USERS, list);

    // Sync to Firestore
    if (db) {
      try {
        await setDoc(doc(db, 'users', String(id)), list[idx], { merge: true });
      } catch (e) {
        console.warn('Firestore setDoc user error:', e);
      }
    }
    return { success: true, data: list[idx] };
  },

  delete: async (id) => {
    const list = UserService.getAll();
    saveStore(STORAGE_KEYS.USERS, list.filter((u) => String(u.id) !== String(id)));

    // Sync to Firestore
    if (db) {
      try {
        await deleteDoc(doc(db, 'users', String(id))).catch(() => {});
        try {
          const snap = await getDocs(collection(db, 'users'));
          for (const d of snap.docs) {
            if (String(d.id) === String(id) || String(d.data()?.id) === String(id)) {
              await deleteDoc(doc(db, 'users', d.id));
            }
          }
        } catch (e) {}
      } catch (e) {
        console.warn('Firestore deleteDoc user error:', e);
      }
    }
    return { success: true };
  },

  suspendUser: async (id, reason = 'ระงับการใช้งานชั่วคราวโดยผู้ดูแลระบบ') => {
    return UserService.update(id, {
      suspended: true,
      suspendedReason: reason,
      suspendedAt: new Date().toISOString()
    });
  },

  unsuspendUser: async (id) => {
    return UserService.update(id, {
      suspended: false,
      suspendedReason: null,
      unsuspendedAt: new Date().toISOString()
    });
  }
};

export const DriverService = {
  getAll: () => {
    const rawDrivers = loadStore(STORAGE_KEYS.DRIVERS, MOCK_DRIVERS);
    const reports = loadStore(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    return rawDrivers.map((d) => {
      const driverReports = reports.filter(
        (r) => r.driverId === d.id || r.driverName === d.name || (r.busId && r.busId === d.busId)
      );
      const totalDeduction = driverReports.reduce((sum, r) => sum + Math.abs(r.scoreImpact || 3), 0);
      const computedScore = Math.max(0, 100 - totalDeduction);
      return {
        ...d,
        score: computedScore,
        complaintCount: driverReports.length,
        totalDeduction
      };
    });
  },

  subscribeDrivers: (callback) => {
    if (!db) return () => {};
    try {
      const unsub = onSnapshot(collection(db, 'drivers'), (snapshot) => {
        if (!snapshot.empty) {
          const list = [];
          snapshot.forEach((doc) => list.push(doc.data()));
          saveStore(STORAGE_KEYS.DRIVERS, list);
          callback(list);
        }
      }, (err) => {
        console.warn('Firestore drivers subscription error:', err);
      });
      return unsub;
    } catch (e) {
      console.warn('subscribeDrivers error:', e);
      return () => {};
    }
  },

  add: async (newDriver) => {
    const list = DriverService.getAll();
    if (list.some((d) => String(d.id) === String(newDriver.id))) {
      return { success: false, message: 'รหัสคนขับนี้มีอยู่ในระบบแล้ว' };
    }
    const driver = {
      ...newDriver,
      score: newDriver.score != null ? newDriver.score : 100,
      status: newDriver.status || 'กำลังให้บริการ',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    saveStore(STORAGE_KEYS.DRIVERS, [driver, ...list]);

    // Sync to Firestore
    if (db) {
      try {
        await setDoc(doc(db, 'drivers', String(driver.id)), driver);
      } catch (e) {
        console.warn('Firestore setDoc driver error:', e);
      }
    }
    return { success: true, data: driver };
  },

  update: async (id, updates) => {
    const list = DriverService.getAll();
    const idx = list.findIndex((d) => String(d.id) === String(id));
    if (idx === -1) return { success: false, message: 'ไม่พบข้อมูลคนขับ' };
    list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
    saveStore(STORAGE_KEYS.DRIVERS, list);

    // Sync to Firestore
    if (db) {
      try {
        await setDoc(doc(db, 'drivers', String(id)), list[idx], { merge: true });
      } catch (e) {
        console.warn('Firestore setDoc driver error:', e);
      }
    }
    return { success: true, data: list[idx] };
  },

  delete: async (id) => {
    const list = DriverService.getAll();
    saveStore(STORAGE_KEYS.DRIVERS, list.filter((d) => String(d.id) !== String(id)));

    // Sync to Firestore
    if (db) {
      try {
        await deleteDoc(doc(db, 'drivers', String(id))).catch(() => {});
        try {
          const snap = await getDocs(collection(db, 'drivers'));
          for (const d of snap.docs) {
            if (String(d.id) === String(id) || String(d.data()?.id) === String(id)) {
              await deleteDoc(doc(db, 'drivers', d.id));
            }
          }
        } catch (e) {}
      } catch (e) {
        console.warn('Firestore deleteDoc driver error:', e);
      }
    }
    return { success: true };
  }
};

// ======================================================================
// 3. BusService (Collection: buses)
// ======================================================================
export const BusService = {
  getAll: () => {
    const buses = loadStore(STORAGE_KEYS.BUSES, INITIAL_BUSES);
    return buses.map((b) => {
      if (b.seats) {
        return {
          ...b,
          seats: b.seats.length < 20
            ? [...b.seats, ...Array(20 - b.seats.length).fill('free')]
            : b.seats.slice(0, 20)
        };
      }
      return b;
    });
  },

  subscribeBuses: (callback) => {
    if (!db) return () => {};
    try {
      const unsub = onSnapshot(collection(db, 'buses'), (snapshot) => {
        if (!snapshot.empty) {
          const list = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.seats) {
              data.seats = data.seats.length < 20
                ? [...data.seats, ...Array(20 - data.seats.length).fill('free')]
                : data.seats.slice(0, 20);
            }
            list.push(data);
          });
          // Sort by id for stable display
          list.sort((a, b) => a.id.localeCompare(b.id));
          saveStore(STORAGE_KEYS.BUSES, list);
          callback(list);
        }
      }, (err) => {
        console.warn('Firestore buses subscription error:', err);
      });
      return unsub;
    } catch (e) {
      console.warn('subscribeBuses error:', e);
      return () => {};
    }
  },

  updateTelemetry: async (busId, telemetry) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'buses', busId), {
        ...telemetry,
        lastUpdated: new Date().toISOString()
      });
    } catch (e) {
      // Non-fatal telemetry sync error
    }
  },

  add: async (newBus) => {
    const list = BusService.getAll();
    if (list.some((b) => b.id === newBus.id)) {
      return { success: false, message: 'ป้ายทะเบียนรถนี้มีอยู่ในระบบแล้ว' };
    }
    const bus = {
      ...newBus,
      passengers: 0,
      seated: 0,
      standing: 0,
      speed: 0,
      status: 'กำลังให้บริการ',
      seats: Array(20).fill('free'),
      lastUpdated: new Date().toISOString()
    };
    saveStore(STORAGE_KEYS.BUSES, [...list, bus]);

    // Sync to Firestore
    if (db) {
      try {
        await setDoc(doc(db, 'buses', bus.id), bus);
      } catch (e) {
        console.warn('Firestore setDoc bus error:', e);
      }
    }
    return { success: true, data: bus };
  },

  update: async (id, updates) => {
    const list = BusService.getAll();
    const idx = list.findIndex((b) => b.id === id);
    if (idx === -1) return { success: false, message: 'ไม่พบป้ายทะเบียนรถ' };
    list[idx] = { ...list[idx], ...updates, lastUpdated: new Date().toISOString() };
    saveStore(STORAGE_KEYS.BUSES, list);

    // Sync to Firestore
    if (db) {
      try {
        await setDoc(doc(db, 'buses', id), list[idx], { merge: true });
      } catch (e) {
        console.warn('Firestore setDoc bus error:', e);
      }
    }
    return { success: true, data: list[idx] };
  },

  delete: async (id) => {
    const list = BusService.getAll();
    saveStore(STORAGE_KEYS.BUSES, list.filter((b) => String(b.id) !== String(id)));

    // Sync to Firestore
    if (db) {
      try {
        await deleteDoc(doc(db, 'buses', String(id))).catch(() => {});
        try {
          const snap = await getDocs(collection(db, 'buses'));
          for (const d of snap.docs) {
            if (String(d.id) === String(id) || String(d.data()?.id) === String(id)) {
              await deleteDoc(doc(db, 'buses', d.id));
            }
          }
        } catch (e) {}
      } catch (e) {
        console.warn('Firestore deleteDoc bus error:', e);
      }
    }
    return { success: true };
  },

  checkReadiness: async (busId, inspectionData = {}) => {
    const list = BusService.getAll();
    const idx = list.findIndex((b) => b.id === busId);
    if (idx === -1) return { success: false, message: 'ไม่พบป้ายทะเบียนรถ' };
    const readiness = {
      isReady: true,
      inspectedAt: new Date().toISOString(),
      inspector: inspectionData.inspector || 'คนขับรถ',
      checklist: {
        tires: true,
        brakes: true,
        lights: true,
        gps: true,
        seatSensors: true,
        doors: true,
        ...inspectionData.checklist
      }
    };
    list[idx] = { ...list[idx], readiness, status: 'พร้อมให้บริการ', lastUpdated: new Date().toISOString() };
    saveStore(STORAGE_KEYS.BUSES, list);
    if (db) {
      try {
        await setDoc(doc(db, 'buses', busId), list[idx], { merge: true });
      } catch (e) {
        console.warn('Firestore setDoc bus readiness error:', e);
      }
    }
    return { success: true, data: list[idx] };
  }
};

// ======================================================================
// 4. RouteService (Collection: routes)
// ======================================================================
export const RouteService = {
  getAll: () => loadStore(STORAGE_KEYS.ROUTES, ROUTES),

  subscribeRoutes: (callback) => {
    if (!db) return () => {};
    try {
      const unsub = onSnapshot(collection(db, 'routes'), (snapshot) => {
        if (!snapshot.empty) {
          const list = [];
          snapshot.forEach((doc) => list.push(doc.data()));
          list.sort((a, b) => (a.id || 0) - (b.id || 0));
          saveStore(STORAGE_KEYS.ROUTES, list);
          callback(list);
        }
      }, (err) => {
        console.warn('Firestore routes subscription error:', err);
      });
      return unsub;
    } catch (e) {
      console.warn('subscribeRoutes error:', e);
      return () => {};
    }
  },

  updateRoute: async (id, updates) => {
    const list = RouteService.getAll();
    const idx = list.findIndex((r) => r.id === Number(id));
    if (idx === -1) return { success: false, message: 'ไม่พบสายรถ' };
    list[idx] = { ...list[idx], ...updates, lastUpdated: new Date().toISOString() };
    saveStore(STORAGE_KEYS.ROUTES, list);

    // Sync to Firestore
    if (db) {
      try {
        await setDoc(doc(db, 'routes', `route_${id}`), list[idx], { merge: true });
      } catch (e) {
        console.warn('Firestore setDoc route error:', e);
      }
    }
    return { success: true, data: list[idx] };
  },

  addRoute: async (newRoute) => {
    const list = RouteService.getAll();
    const id = Number(newRoute.id) || (list.length > 0 ? Math.max(...list.map(r => r.id)) + 1 : 1);
    const route = {
      ...newRoute,
      id,
      stops: newRoute.stops || [],
      polyline: newRoute.polyline || [],
      lastUpdated: new Date().toISOString()
    };
    const updated = [...list, route];
    saveStore(STORAGE_KEYS.ROUTES, updated);
    if (db) {
      try {
        await setDoc(doc(db, 'routes', `route_${id}`), route, { merge: true });
      } catch (e) {
        console.warn('Firestore setDoc route error:', e);
      }
    }
    return { success: true, data: route };
  },

  deleteRoute: async (id) => {
    const list = RouteService.getAll();
    const updated = list.filter((r) => r.id !== Number(id) && String(r.id) !== String(id));
    saveStore(STORAGE_KEYS.ROUTES, updated);
    if (db) {
      try {
        await deleteDoc(doc(db, 'routes', `route_${id}`)).catch(() => {});
        await deleteDoc(doc(db, 'routes', String(id))).catch(() => {});
        try {
          const snap = await getDocs(collection(db, 'routes'));
          for (const d of snap.docs) {
            const data = d.data();
            if (String(d.id) === `route_${id}` || String(d.id) === String(id) || String(data.id) === String(id)) {
              await deleteDoc(doc(db, 'routes', d.id));
            }
          }
        } catch (e) {}
      } catch (e) {
        console.warn('Firestore deleteDoc route error:', e);
      }
    }
    return { success: true };
  },

  addStop: async (routeId, stop) => {
    const list = RouteService.getAll();
    const idx = list.findIndex((r) => r.id === Number(routeId));
    if (idx === -1) return { success: false, message: 'ไม่พบสายรถ' };
    const stops = list[idx].stops || [];
    const stopId = stop.id || `${routeId}-${stops.length + 1}`;
    const newStop = { ...stop, id: stopId };
    list[idx] = {
      ...list[idx],
      stops: [...stops, newStop],
      lastUpdated: new Date().toISOString()
    };
    saveStore(STORAGE_KEYS.ROUTES, list);
    if (db) {
      try {
        await setDoc(doc(db, 'routes', `route_${routeId}`), list[idx], { merge: true });
      } catch (e) {
        console.warn('Firestore addStop error:', e);
      }
    }
    return { success: true, data: newStop, route: list[idx] };
  },

  updateStop: async (routeId, stopId, updates) => {
    const list = RouteService.getAll();
    const rIdx = list.findIndex((r) => r.id === Number(routeId));
    if (rIdx === -1) return { success: false, message: 'ไม่พบสายรถ' };
    const stops = list[rIdx].stops || [];
    const sIdx = stops.findIndex((s) => s.id === stopId);
    if (sIdx === -1) return { success: false, message: 'ไม่พบจุดจอด' };
    stops[sIdx] = { ...stops[sIdx], ...updates };
    list[rIdx] = {
      ...list[rIdx],
      stops: [...stops],
      lastUpdated: new Date().toISOString()
    };
    saveStore(STORAGE_KEYS.ROUTES, list);
    if (db) {
      try {
        await setDoc(doc(db, 'routes', `route_${routeId}`), list[rIdx], { merge: true });
      } catch (e) {
        console.warn('Firestore updateStop error:', e);
      }
    }
    return { success: true, data: stops[sIdx], route: list[rIdx] };
  },

  deleteStop: async (routeId, stopId) => {
    const list = RouteService.getAll();
    const rIdx = list.findIndex((r) => r.id === Number(routeId));
    if (rIdx === -1) return { success: false, message: 'ไม่พบสายรถ' };
    const filteredStops = (list[rIdx].stops || []).filter((s) => s.id !== stopId);
    list[rIdx] = {
      ...list[rIdx],
      stops: filteredStops,
      lastUpdated: new Date().toISOString()
    };
    saveStore(STORAGE_KEYS.ROUTES, list);
    if (db) {
      try {
        await setDoc(doc(db, 'routes', `route_${routeId}`), list[rIdx], { merge: true });
      } catch (e) {
        console.warn('Firestore deleteStop error:', e);
      }
    }
    return { success: true, route: list[rIdx] };
  }
};

// Helper to automatically link bus + date + time to driver roster/schedule
export const findDriverForBusAtTime = (busId, dateStr = '', timeStr = '') => {
  try {
    const schedules = ScheduleService.getAll();
    if (schedules && schedules.length > 0) {
      if (timeStr) {
        const timeMatch = schedules.find((s) => {
          if (s.busId !== busId) return false;
          if (s.date && dateStr && s.date !== dateStr) return false;
          if (s.startTime && s.endTime) {
            return timeStr >= s.startTime && timeStr <= s.endTime;
          }
          return true;
        });
        if (timeMatch && timeMatch.driverName) {
          return {
            driverId: timeMatch.driverId || '',
            driverName: timeMatch.driverName
          };
        }
      }
      const busSchedule = schedules.find((s) => s.busId === busId && s.driverName);
      if (busSchedule) {
        return {
          driverId: busSchedule.driverId || '',
          driverName: busSchedule.driverName
        };
      }
    }

    const drivers = DriverService.getAll();
    const driverMatch = drivers.find((d) => d.busId === busId);
    if (driverMatch) {
      return {
        driverId: driverMatch.id,
        driverName: driverMatch.name
      };
    }

    const buses = BusService.getAll();
    const busMatch = buses.find((b) => b.id === busId);
    if (busMatch && busMatch.driverName) {
      return {
        driverId: busMatch.driverId || '',
        driverName: busMatch.driverName
      };
    }
  } catch (e) {
    console.warn('findDriverForBusAtTime error:', e);
  }

  return {
    driverId: '',
    driverName: 'พนักงานขับรถ มวล.'
  };
};

export const ReportService = {
  getAll: () => loadStore(STORAGE_KEYS.REPORTS, INITIAL_REPORTS),

  subscribeReports: (callback) => {
    if (!db) return () => {};
    try {
      const unsub = onSnapshot(collection(db, 'reports'), (snapshot) => {
        const list = [];
        snapshot.forEach((doc) => list.push(doc.data()));
        list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        saveStore(STORAGE_KEYS.REPORTS, list);
        callback(list);
      }, (err) => {
        console.warn('Firestore reports subscription error:', err);
      });
      return unsub;
    } catch (e) {
      console.warn('subscribeReports error:', e);
      return () => {};
    }
  },

  add: async (report) => {
    const list = ReportService.getAll();
    const resolved = findDriverForBusAtTime(report.busId || 'WU-101', report.incidentDate, report.incidentTime);
    const newReport = {
      id: report.id || `REP-${Date.now().toString().slice(-4)}`,
      busId: report.busId || 'WU-101',
      driverId: report.driverId || resolved.driverId || '',
      driverName: report.driverName || resolved.driverName || 'พนักงานขับรถ มวล.',
      userId: report.userId || 'anonymous',
      userName: report.userName || 'ผู้โดยสาร',
      userDept: report.userDept || 'มหาวิทยาลัยวลัยลักษณ์',
      userRole: report.userRole || 'นักศึกษา',
      category: report.category || 'ข้อร้องเรียนทั่วไป',
      incidentDate: report.incidentDate || new Date().toISOString().split('T')[0],
      incidentTime: report.incidentTime || new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      location: report.location || 'มหาวิทยาลัยวลัยลักษณ์',
      timestamp: report.timestamp || new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.',
      details: report.details || '',
      scoreImpact: report.scoreImpact != null ? report.scoreImpact : -3,
      status: 'รอตรวจสอบ',
      adminNote: '',
      resolvedAt: null,
      createdAt: new Date().toISOString()
    };
    saveStore(STORAGE_KEYS.REPORTS, [newReport, ...list]);

    // Sync to Firestore
    if (db) {
      try {
        await setDoc(doc(db, 'reports', newReport.id), newReport);
      } catch (e) {
        console.warn('Firestore setDoc report error:', e);
      }
    }
    return { success: true, data: newReport };
  },

  update: async (id, updates) => {
    const list = ReportService.getAll();
    const idx = list.findIndex((r) => r.id === id);
    if (idx === -1) return { success: false, message: 'ไม่พบข้อร้องเรียน' };

    const updated = {
      ...list[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    list[idx] = updated;
    saveStore(STORAGE_KEYS.REPORTS, list);

    if (db) {
      try {
        await setDoc(doc(db, 'reports', id), updated, { merge: true });
      } catch (e) {
        console.warn('Firestore setDoc report error:', e);
      }
    }
    return { success: true, data: updated };
  },

  driverResolve: async (id, driverResponse) => {
    const timeStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';
    return await ReportService.update(id, {
      status: 'แก้ไขเรียบร้อย',
      driverResponse,
      driverResolvedAt: timeStr,
      resolvedAt: timeStr
    });
  },

  updateStatus: async (id, status, adminNote = '', deductScore = 0, extraUpdates = {}) => {
    const list = ReportService.getAll();
    const idx = list.findIndex((r) => r.id === id);
    if (idx === -1) return { success: false, message: 'ไม่พบข้อร้องเรียน' };

    const target = list[idx];
    const resolvedAt = (status === 'แก้ไขเรียบร้อย' || status === 'ตักเตือน/หักคะแนน')
      ? new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.'
      : target.resolvedAt;

    const updates = {
      status,
      adminNote: adminNote !== undefined && adminNote !== '' ? adminNote : target.adminNote,
      resolvedAt,
      ...extraUpdates,
      updatedAt: new Date().toISOString()
    };

    list[idx] = { ...target, ...updates };
    saveStore(STORAGE_KEYS.REPORTS, list);

    // Sync to Firestore
    if (db) {
      try {
        await setDoc(doc(db, 'reports', id), list[idx], { merge: true });
      } catch (e) {
        console.warn('Firestore setDoc report error:', e);
      }
    }

    // Deduct driver score if applicable
    if (deductScore > 0 && (target.busId || target.driverId || target.driverName)) {
      const drivers = DriverService.getAll();
      const driver = drivers.find((d) =>
        (target.driverId && String(d.id) === String(target.driverId)) ||
        (target.driverName && d.name === target.driverName) ||
        (target.busId && d.busId === target.busId)
      );
      if (driver) {
        const nextScore = Math.max(0, (driver.score || 100) - deductScore);
        await DriverService.update(driver.id, { score: nextScore });
      }
    }

    return { success: true, data: list[idx] };
  },

  delete: async (id) => {
    const list = ReportService.getAll();
    saveStore(STORAGE_KEYS.REPORTS, list.filter((r) => String(r.id) !== String(id)));

    // Sync to Firestore
    if (db) {
      try {
        await deleteDoc(doc(db, 'reports', String(id))).catch(() => {});
        try {
          const snap = await getDocs(collection(db, 'reports'));
          for (const d of snap.docs) {
            const data = d.data();
            if (String(d.id) === String(id) || String(data.id) === String(id)) {
              await deleteDoc(doc(db, 'reports', d.id));
            }
          }
        } catch (e) {}
      } catch (e) {
        console.warn('Firestore deleteDoc report error:', e);
      }
    }
    return { success: true };
  }
};

// ======================================================================
// 6. AnnouncementService (Collection: announcements)
// ======================================================================
export const AnnouncementService = {
  getAll: () => loadStore(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS),

  subscribeAnnouncements: (callback) => {
    if (!db) return () => {};
    try {
      const unsub = onSnapshot(collection(db, 'announcements'), (snapshot) => {
        if (snapshot.empty) {
          saveStore(STORAGE_KEYS.ANNOUNCEMENTS, []);
          callback([]);
          return;
        }
        const list = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            ...data,
            id: data.id != null ? data.id : docSnap.id,
            _docId: docSnap.id
          });
        });
        list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        saveStore(STORAGE_KEYS.ANNOUNCEMENTS, list);
        callback(list);
      }, (err) => {
        console.warn('Firestore announcements subscription error:', err);
      });
      return unsub;
    } catch (e) {
      console.warn('subscribeAnnouncements error:', e);
      return () => {};
    }
  },

  add: async (item) => {
    const list = AnnouncementService.getAll();
    const id = `ann_${Date.now()}`;
    const newItem = {
      id: item.id || id,
      title: item.title,
      text: item.text,
      category: item.category || 'ข่าวสารบริการ',
      urgent: Boolean(item.urgent),
      time: 'เมื่อสักครู่',
      createdAt: new Date().toISOString()
    };
    saveStore(STORAGE_KEYS.ANNOUNCEMENTS, [newItem, ...list]);

    // Sync to Firestore
    if (db) {
      try {
        await setDoc(doc(db, 'announcements', String(newItem.id)), newItem);
      } catch (e) {
        console.warn('Firestore setDoc announcement error:', e);
      }
    }
    return { success: true, data: newItem };
  },

  update: async (id, updates) => {
    const list = AnnouncementService.getAll();
    const idx = list.findIndex((a) =>
      String(a.id) === String(id) ||
      String(a._docId) === String(id) ||
      (a.title && a.title === id)
    );
    if (idx === -1) return { success: false, message: 'ไม่พบประกาศ' };
    const docId = list[idx]._docId || (String(list[idx].id).startsWith('ann_') ? list[idx].id : `ann_${list[idx].id}`);
    list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
    saveStore(STORAGE_KEYS.ANNOUNCEMENTS, list);

    if (db) {
      try {
        await setDoc(doc(db, 'announcements', String(docId)), list[idx], { merge: true });
      } catch (e) {
        console.warn('Firestore setDoc announcement update error:', e);
      }
    }
    return { success: true, data: list[idx] };
  },

  delete: async (id) => {
    const list = AnnouncementService.getAll();
    const itemToDelete = list.find((a) =>
      String(a.id) === String(id) ||
      String(a._docId) === String(id) ||
      (a.title && a.title === id)
    );

    const updated = list.filter((a) =>
      String(a.id) !== String(id) &&
      String(a._docId) !== String(id) &&
      (!itemToDelete || a.id !== itemToDelete.id)
    );
    saveStore(STORAGE_KEYS.ANNOUNCEMENTS, updated);

    // Sync to Firestore
    if (db) {
      try {
        const targets = new Set();
        if (id) {
          targets.add(String(id));
          if (!String(id).startsWith('ann_')) targets.add(`ann_${id}`);
        }
        if (itemToDelete?._docId) targets.add(String(itemToDelete._docId));
        if (itemToDelete?.id) {
          targets.add(String(itemToDelete.id));
          if (!String(itemToDelete.id).startsWith('ann_')) targets.add(`ann_${itemToDelete.id}`);
        }

        // 1. Direct delete attempts
        for (const docId of targets) {
          try {
            await deleteDoc(doc(db, 'announcements', docId));
          } catch (e) {}
        }

        // 2. Query scan deletion to guarantee complete Firestore deletion
        try {
          const snap = await getDocs(collection(db, 'announcements'));
          for (const d of snap.docs) {
            const data = d.data();
            const isMatch =
              String(d.id) === String(id) ||
              String(d.id) === `ann_${id}` ||
              String(data.id) === String(id) ||
              (itemToDelete && String(data.id) === String(itemToDelete.id)) ||
              (itemToDelete && String(d.id) === String(itemToDelete._docId)) ||
              (itemToDelete && data.title && data.title === itemToDelete.title);
            if (isMatch) {
              await deleteDoc(doc(db, 'announcements', d.id));
            }
          }
        } catch (e) {
          console.warn('Firestore scan deleteDoc announcement error:', e);
        }
      } catch (e) {
        console.warn('Firestore deleteDoc announcement error:', e);
      }
    }
    return { success: true };
  }
};

// ======================================================================
// 7. ChatbotService (Collection: chatbot_faq)
// ======================================================================
export const ChatbotService = {
  getAll: () => loadStore(STORAGE_KEYS.CHATBOT, INITIAL_CHATBOT_FAQ),

  subscribeFaqs: (callback) => {
    if (!db) return () => {};
    try {
      const unsub = onSnapshot(collection(db, 'chatbot_faq'), (snapshot) => {
        if (!snapshot.empty) {
          const list = [];
          snapshot.forEach((doc) => list.push(doc.data()));
          saveStore(STORAGE_KEYS.CHATBOT, list);
          callback(list);
        }
      }, (err) => {
        console.warn('Firestore chatbot_faq subscription error:', err);
      });
      return unsub;
    } catch (e) {
      console.warn('subscribeFaqs error:', e);
      return () => {};
    }
  },

  add: async (faq) => {
    const list = ChatbotService.getAll();
    const newFaq = {
      id: faq.id || `FAQ-${Date.now().toString().slice(-4)}`,
      question: faq.question,
      answer: faq.answer,
      category: faq.category || 'ทั่วไป',
      updatedAt: new Date().toISOString()
    };
    saveStore(STORAGE_KEYS.CHATBOT, [...list, newFaq]);

    // Sync to Firestore
    if (db) {
      try {
        await setDoc(doc(db, 'chatbot_faq', newFaq.id), newFaq);
      } catch (e) {
        console.warn('Firestore setDoc chatbot_faq error:', e);
      }
    }
    return { success: true, data: newFaq };
  },

  update: async (id, updates) => {
    const list = ChatbotService.getAll();
    const idx = list.findIndex((f) => String(f.id) === String(id));
    if (idx === -1) return { success: false, message: 'ไม่พบคำถาม-คำตอบ' };
    list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
    saveStore(STORAGE_KEYS.CHATBOT, list);

    if (db) {
      try {
        await setDoc(doc(db, 'chatbot_faq', String(id)), list[idx], { merge: true });
      } catch (e) {
        console.warn('Firestore setDoc chatbot_faq error:', e);
      }
    }
    return { success: true, data: list[idx] };
  },

  delete: async (id) => {
    const list = ChatbotService.getAll();
    saveStore(STORAGE_KEYS.CHATBOT, list.filter((f) => String(f.id) !== String(id)));

    // Sync to Firestore
    if (db) {
      try {
        await deleteDoc(doc(db, 'chatbot_faq', String(id))).catch(() => {});
        try {
          const snap = await getDocs(collection(db, 'chatbot_faq'));
          for (const d of snap.docs) {
            const data = d.data();
            if (String(d.id) === String(id) || String(data.id) === String(id)) {
              await deleteDoc(doc(db, 'chatbot_faq', d.id));
            }
          }
        } catch (e) {}
      } catch (e) {
        console.warn('Firestore deleteDoc chatbot_faq error:', e);
      }
    }
    return { success: true };
  }
};

// ======================================================================
// 8. WaitingService (Collection: waiting_passengers)
// ======================================================================
export const WaitingService = {
  getAll: () => loadStore(STORAGE_KEYS.WAITING, []),

  subscribeWaitingStops: (callback) => {
    if (!db) return () => {};
    try {
      const unsub = onSnapshot(collection(db, 'waiting_passengers'), (snapshot) => {
        if (!snapshot.empty) {
          const list = [];
          snapshot.forEach((doc) => list.push(doc.data()));
          saveStore(STORAGE_KEYS.WAITING, list);
          callback(list);
        }
      }, (err) => {
        console.warn('Firestore waiting_passengers subscription error:', err);
      });
      return unsub;
    } catch (e) {
      console.warn('subscribeWaitingStops error:', e);
      return () => {};
    }
  },

  pinStop: async ({ stopId, stopName, routeId, busId, userId }) => {
    const list = WaitingService.getAll();
    const filtered = list.filter((w) => w.userId !== userId);
    const newEntry = {
      id: `WAIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      stopId,
      stopName,
      routeId: Number(routeId) || 1,
      busId: busId || null,
      userId,
      timestamp: new Date().toISOString()
    };
    const updated = [...filtered, newEntry];
    saveStore(STORAGE_KEYS.WAITING, updated);

    if (db) {
      try {
        await setDoc(doc(db, 'waiting_passengers', newEntry.id), newEntry);
      } catch (e) {
        console.warn('Firestore setDoc waiting_passengers error:', e);
      }
    }
    return { success: true, data: newEntry, list: updated };
  },

  unpinStop: async (userId) => {
    const list = WaitingService.getAll();
    const toRemove = list.filter((w) => w.userId === userId);
    const remaining = list.filter((w) => w.userId !== userId);
    saveStore(STORAGE_KEYS.WAITING, remaining);

    if (db) {
      for (const item of toRemove) {
        try {
          await deleteDoc(doc(db, 'waiting_passengers', item.id));
        } catch (e) {
          console.warn('Firestore deleteDoc waiting_passengers error:', e);
        }
      }
      try {
        const snap = await getDocs(collection(db, 'waiting_passengers'));
        for (const d of snap.docs) {
          if (String(d.data()?.userId) === String(userId)) {
            await deleteDoc(doc(db, 'waiting_passengers', d.id));
          }
        }
      } catch (e) {}
    }
    return { success: true, list: remaining };
  },

  clearStop: async (stopId, busId = null) => {
    const list = WaitingService.getAll();
    const toRemove = list.filter((w) => {
      const matchStop = w.stopId === stopId || w.stopName === stopId;
      if (!matchStop) return false;
      if (!busId) return true;
      return !w.busId || w.busId === busId;
    });
    const remaining = list.filter((w) => !toRemove.some((r) => r.id === w.id));
    saveStore(STORAGE_KEYS.WAITING, remaining);

    if (db) {
      for (const item of toRemove) {
        try {
          await deleteDoc(doc(db, 'waiting_passengers', item.id));
        } catch (e) {
          console.warn('Firestore deleteDoc waiting_passengers error:', e);
        }
      }
      try {
        const snap = await getDocs(collection(db, 'waiting_passengers'));
        for (const d of snap.docs) {
          const data = d.data();
          const matchStop = data.stopId === stopId || data.stopName === stopId;
          const matchBus = !busId || !data.busId || data.busId === busId;
          if (matchStop && matchBus) {
            await deleteDoc(doc(db, 'waiting_passengers', d.id));
          }
        }
      } catch (e) {}
    }
    return { success: true, list: remaining };
  }
};

// ======================================================================
// 9. ScheduleService (Collection: schedules)
// ======================================================================
export const ScheduleService = {
  getAll: () => loadStore(STORAGE_KEYS.SCHEDULES, INITIAL_SCHEDULES),

  subscribeSchedules: (callback) => {
    if (!db) return () => {};
    try {
      const unsub = onSnapshot(collection(db, 'schedules'), (snapshot) => {
        if (!snapshot.empty) {
          const list = [];
          snapshot.forEach((doc) => list.push(doc.data()));
          list.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
          saveStore(STORAGE_KEYS.SCHEDULES, list);
          callback(list);
        }
      }, (err) => {
        console.warn('Firestore schedules subscription error:', err);
      });
      return unsub;
    } catch (e) {
      console.warn('subscribeSchedules error:', e);
      return () => {};
    }
  },

  add: async (newSchedule) => {
    const list = ScheduleService.getAll();
    const id = newSchedule.id || `SCH-${Date.now().toString().slice(-4)}`;
    const schedule = {
      ...newSchedule,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [schedule, ...list];
    saveStore(STORAGE_KEYS.SCHEDULES, updated);

    if (db) {
      try {
        await setDoc(doc(db, 'schedules', id), schedule);
      } catch (e) {
        console.warn('Firestore setDoc schedule error:', e);
      }
    }
    return { success: true, data: schedule };
  },

  update: async (id, updates) => {
    const list = ScheduleService.getAll();
    const idx = list.findIndex((s) => s.id === id);
    if (idx === -1) return { success: false, message: 'ไม่พบตารางเดินรถ' };
    list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
    saveStore(STORAGE_KEYS.SCHEDULES, list);

    if (db) {
      try {
        await setDoc(doc(db, 'schedules', String(id)), list[idx], { merge: true });
      } catch (e) {
        console.warn('Firestore setDoc schedule error:', e);
      }
    }
    return { success: true, data: list[idx] };
  },

  delete: async (id) => {
    const list = ScheduleService.getAll();
    saveStore(STORAGE_KEYS.SCHEDULES, list.filter((s) => s.id !== id));

    if (db) {
      try {
        await deleteDoc(doc(db, 'schedules', String(id))).catch(() => {});
        try {
          const snap = await getDocs(collection(db, 'schedules'));
          for (const d of snap.docs) {
            if (String(d.id) === String(id) || String(d.data()?.id) === String(id)) {
              await deleteDoc(doc(db, 'schedules', d.id));
            }
          }
        } catch (e) {}
      } catch (e) {
        console.warn('Firestore deleteDoc schedule error:', e);
      }
    }
    return { success: true };
  },

  getByDriver: (driverId) => {
    const list = ScheduleService.getAll();
    return list.filter((s) => String(s.driverId) === String(driverId));
  },

  getByBus: (busId) => {
    const list = ScheduleService.getAll();
    return list.filter((s) => s.busId === busId);
  }
};

// ======================================================================
// 10. SensorService (Collection: sensors)
// ======================================================================
export const SensorService = {
  getAll: () => loadStore(STORAGE_KEYS.SENSORS, INITIAL_SENSORS),

  subscribeSensors: (callback) => {
    if (!db) return () => {};
    try {
      const unsub = onSnapshot(collection(db, 'sensors'), (snapshot) => {
        if (!snapshot.empty) {
          const list = [];
          snapshot.forEach((doc) => list.push(doc.data()));
          list.sort((a, b) => a.id.localeCompare(b.id));
          saveStore(STORAGE_KEYS.SENSORS, list);
          callback(list);
        }
      }, (err) => {
        console.warn('Firestore sensors subscription error:', err);
      });
      return unsub;
    } catch (e) {
      console.warn('subscribeSensors error:', e);
      return () => {};
    }
  },

  add: async (newSensor) => {
    const list = SensorService.getAll();
    if (list.some((s) => s.id === newSensor.id)) {
      return { success: false, message: 'รหัสเซนเซอร์นี้มีอยู่ในระบบแล้ว' };
    }
    const sensor = {
      ...newSensor,
      lastPing: 'เมื่อสักครู่',
      status: newSensor.status || 'ปกติ',
      accuracy: newSensor.accuracy || '99.5%',
      createdAt: new Date().toISOString()
    };
    const updated = [...list, sensor];
    saveStore(STORAGE_KEYS.SENSORS, updated);

    if (db) {
      try {
        await setDoc(doc(db, 'sensors', sensor.id), sensor);
      } catch (e) {
        console.warn('Firestore setDoc sensor error:', e);
      }
    }
    return { success: true, data: sensor };
  },

  update: async (id, updates) => {
    const list = SensorService.getAll();
    const idx = list.findIndex((s) => s.id === id);
    if (idx === -1) return { success: false, message: 'ไม่พบรหัสเซนเซอร์' };
    list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
    saveStore(STORAGE_KEYS.SENSORS, list);

    if (db) {
      try {
        await setDoc(doc(db, 'sensors', String(id)), list[idx], { merge: true });
      } catch (e) {
        console.warn('Firestore setDoc sensor error:', e);
      }
    }
    return { success: true, data: list[idx] };
  },

  delete: async (id) => {
    const list = SensorService.getAll();
    saveStore(STORAGE_KEYS.SENSORS, list.filter((s) => s.id !== id));

    if (db) {
      try {
        await deleteDoc(doc(db, 'sensors', String(id))).catch(() => {});
        try {
          const snap = await getDocs(collection(db, 'sensors'));
          for (const d of snap.docs) {
            if (String(d.id) === String(id) || String(d.data()?.id) === String(id)) {
              await deleteDoc(doc(db, 'sensors', d.id));
            }
          }
        } catch (e) {}
      } catch (e) {
        console.warn('Firestore deleteDoc sensor error:', e);
      }
    }
    return { success: true };
  },

  checkSensor: async (id) => {
    // Diagnostic / Ping test simulation
    const latency = Math.floor(Math.random() * 25) + 12; // 12-36 ms
    const packetLoss = 0;
    const nowStr = 'เมื่อสักครู่';
    await SensorService.update(id, {
      lastPing: nowStr,
      status: 'ปกติ'
    });
    // Log telemetry
    await SensorService.recordTelemetry(id, {
      action: 'DIAGNOSTIC_PING',
      latency: `${latency}ms`,
      packetLoss: `${packetLoss}%`,
      status: 'HEALTHY'
    });
    return { success: true, latency, packetLoss, timestamp: new Date().toLocaleTimeString('th-TH') };
  },

  getTelemetryLogs: () => {
    return loadStore(STORAGE_KEYS.TELEMETRY, [
      { id: 'LOG-01', sensorId: 'SNS-101-GPS', action: 'GPS_TELEMETRY', value: '8.6475, 99.8936', status: 'OK', timestamp: '19:25:10' },
      { id: 'LOG-02', sensorId: 'SNS-101-SEAT', action: 'SEAT_PRESSURE_SYNC', value: '14/20 Occupied', status: 'OK', timestamp: '19:25:12' },
      { id: 'LOG-03', sensorId: 'SNS-101-IR', action: 'PASSENGER_IN_OUT', value: 'Boarding +2, Alighting -1', status: 'OK', timestamp: '19:25:15' },
      { id: 'LOG-04', sensorId: 'SNS-201-GPS', action: 'GPS_TELEMETRY', value: '8.6495, 99.8798', status: 'OK', timestamp: '19:25:20' },
      { id: 'LOG-05', sensorId: 'SNS-STP-THB', action: 'STATION_BEACON_PING', value: 'Station Online (7 Waiting)', status: 'OK', timestamp: '19:25:25' }
    ]);
  },

  subscribeTelemetry: (callback) => {
    if (!db) return () => {};
    try {
      const unsub = onSnapshot(collection(db, 'telemetry'), (snapshot) => {
        if (!snapshot.empty) {
          const list = [];
          snapshot.forEach((doc) => list.push(doc.data()));
          list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          saveStore(STORAGE_KEYS.TELEMETRY, list);
          callback(list);
        }
      }, (err) => {
        console.warn('Firestore telemetry subscription error:', err);
      });
      return unsub;
    } catch (e) {
      console.warn('subscribeTelemetry error:', e);
      return () => {};
    }
  },

  recordTelemetry: async (sensorId, payload) => {
    const logs = SensorService.getTelemetryLogs();
    const newLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      sensorId,
      ...payload,
      timestamp: new Date().toLocaleTimeString('th-TH'),
      createdAt: new Date().toISOString()
    };
    const updated = [newLog, ...logs].slice(0, 30);
    saveStore(STORAGE_KEYS.TELEMETRY, updated);

    if (db) {
      try {
        await setDoc(doc(db, 'telemetry', newLog.id), newLog);
      } catch (e) {
        console.warn('Firestore setDoc telemetry error:', e);
      }
    }
    return newLog;
  }
};

// ======================================================================
// 12. NotificationService (Aggregated Alerts: Complaints, Bus & System Issues, Announcements)
// ======================================================================
export const NotificationService = {
  getAll: () => NotificationService.getAllNotifications(),

  getAllNotifications: () => {
    const notifications = [];

    // 1. สิ่งที่ผู้ใช้ร้องเรียน (User Complaints from ReportService)
    try {
      const reports = ReportService.getAll() || [];
      reports.forEach((rep) => {
        const isPending = rep.status === 'รอตรวจสอบ' || rep.status === 'กำลังดำเนินการ';
        notifications.push({
          id: `notif_rep_${rep.id}`,
          sourceId: rep.id,
          type: 'complaint',
          categoryLabel: 'สิ่งที่ผู้ใช้ร้องเรียน',
          title: `ข้อร้องเรียน: ${rep.category || 'ข้อร้องเรียนทั่วไป'} (${rep.busId ? `รถ ${rep.busId}` : 'ทั่วไป'})`,
          description: rep.details || 'ไม่มีรายละเอียดเพิ่มเติม',
          location: rep.location || 'มหาวิทยาลัยวลัยลักษณ์',
          target: rep.busId ? `รถ ${rep.busId}` : (rep.driverName ? `พนักงาน ${rep.driverName}` : 'ระบบโดยสาร'),
          busId: rep.busId,
          driverName: rep.driverName,
          status: rep.status || 'รอตรวจสอบ',
          urgent: isPending,
          time: rep.timestamp || 'เมื่อสักครู่',
          createdAt: rep.createdAt || new Date().toISOString(),
          rawData: rep,
          actionTarget: 'reports'
        });
      });
    } catch (e) {
      console.warn('NotificationService reports aggregation error:', e);
    }

    // 2. ระบบ หรือ รถมีปัญหา (Bus Fleet & IoT System Incidents)
    try {
      const buses = BusService.getAll() || [];
      const sensors = SensorService.getAll() || [];
      let foundBusIssues = 0;

      // Check each bus for issues
      buses.forEach((b) => {
        // Late bus
        if (b.late && Number(b.late) >= 5) {
          foundBusIssues++;
          notifications.push({
            id: `notif_bus_late_${b.id}`,
            sourceId: b.id,
            type: 'bus_issue',
            categoryLabel: 'ปัญหารถมันม่วง',
            title: `รถ ${b.id} ล่าช้ากว่ากำหนด ${b.late} นาที`,
            description: `รถสาย ${b.route} ประจำโดย ${b.driverName || 'พนักงานขับ'} มีเวลาล่าช้าสะสม ${b.late} นาที ส่งผลต่อรอบตารางเดินรถ`,
            location: `สาย ${b.route}`,
            target: `รถ ${b.id}`,
            busId: b.id,
            driverName: b.driverName,
            status: 'ล่าช้า',
            urgent: true,
            time: 'ขณะนี้',
            createdAt: new Date().toISOString(),
            actionTarget: 'buses'
          });
        }

        // Maintenance / Offline
        if (b.status === 'ซ่อมบำรุง' || b.status === 'ไม่พร้อมให้บริการ' || b.status === 'ระงับการเดินรถ') {
          foundBusIssues++;
          notifications.push({
            id: `notif_bus_maint_${b.id}`,
            sourceId: b.id,
            type: 'bus_issue',
            categoryLabel: 'ปัญหารถมันม่วง',
            title: `รถ ${b.id} อยู่ในสถานะระงับวิ่ง / ส่งซ่อมบำรุง`,
            description: `ระบบตรวจพบข้อขัดข้องและนำรถเข้าตรวจสภาพตามรอบมาตรฐานความปลอดภัย`,
            location: 'ศูนย์ซ่อมบำรุงยานพาหนะ มวล.',
            target: `รถ ${b.id}`,
            busId: b.id,
            driverName: b.driverName,
            status: 'ซ่อมบำรุง',
            urgent: true,
            time: 'วันนี้',
            createdAt: new Date().toISOString(),
            actionTarget: 'buses'
          });
        }

        // High Speed Warning
        if (b.speed && Number(b.speed) > 35) {
          foundBusIssues++;
          notifications.push({
            id: `notif_bus_speed_${b.id}`,
            sourceId: b.id,
            type: 'bus_issue',
            categoryLabel: 'ระบบความปลอดภัย',
            title: `ตรวจพบความเร็วเกินกำหนด: รถ ${b.id} (${b.speed} km/h)`,
            description: `เซนเซอร์ GPS รายงานความเร็วเกิน 30 km/h ในเขตควบคุมความเร็วภายในมหาวิทยาลัยวลัยลักษณ์`,
            location: `สาย ${b.route}`,
            target: `รถ ${b.id}`,
            busId: b.id,
            driverName: b.driverName,
            status: 'เตือนความเร็ว',
            urgent: true,
            time: 'เมื่อสักครู่',
            createdAt: new Date().toISOString(),
            actionTarget: 'buses'
          });
        }

        // Readiness issue
        if (b.readiness && b.readiness.isReady === false) {
          foundBusIssues++;
          notifications.push({
            id: `notif_bus_readiness_${b.id}`,
            sourceId: b.id,
            type: 'bus_issue',
            categoryLabel: 'ตรวจสภาพความพร้อม',
            title: `รถ ${b.id} ยังไม่ผ่านการตรวจสอบความพร้อมก่อนเดินรถ`,
            description: `พบรายการตรวจเช็กลมยางหรือระบบเบรกไม่ครบตามเกณฑ์มาตรฐาน Pre-trip Inspection`,
            location: 'จุดตรวจยานพาหนะ',
            target: `รถ ${b.id}`,
            busId: b.id,
            driverName: b.driverName,
            status: 'รอตรวจสภาพ',
            urgent: true,
            time: 'ก่อนออกวิ่ง',
            createdAt: new Date().toISOString(),
            actionTarget: 'buses'
          });
        }
      });

      // Check IoT Sensors
      sensors.forEach((s) => {
        if (s.status && s.status !== 'ปกติ' && s.status !== 'กำลังส่งข้อมูล') {
          notifications.push({
            id: `notif_sensor_${s.id}`,
            sourceId: s.id,
            type: 'system_issue',
            categoryLabel: 'ระบบ & เซนเซอร์',
            title: `เซนเซอร์ ${s.name} พบข้อขัดข้อง`,
            description: `อุปกรณ์ประจำ ${s.location} ส่งสัญญาณเตือน: ${s.status} (ค่าอ่าน: ${s.reading || 'ขาดการเชื่อมต่อ'})`,
            location: s.location || 'อุปกรณ์ IoT',
            target: s.busId ? `รถ ${s.busId}` : s.id,
            busId: s.busId,
            status: s.status,
            urgent: true,
            time: s.lastPing || 'เมื่อสักครู่',
            createdAt: new Date().toISOString(),
            actionTarget: 'buses'
          });
        }
      });

      // Default baseline system & bus incidents
      if (foundBusIssues === 0) {
        notifications.push({
          id: 'notif_bus_default_1',
          sourceId: 'WU-301',
          type: 'bus_issue',
          categoryLabel: 'ปัญหารถมันม่วง',
          title: 'รถ WU-301 รายงานความล่าช้าสะสม 7 นาที (สาย 3)',
          description: 'เนื่องจากมีผู้โดยสารขึ้น-ลงหนาแน่นบริเวณศูนย์การแพทย์และอาคารเรียนรวม ทำให้รอบวิ่งล่าช้ากว่ากำหนด',
          location: 'สาย 3 (ศูนย์การแพทย์)',
          target: 'รถ WU-301',
          busId: 'WU-301',
          driverName: 'ประเสริฐ เจริญดี',
          status: 'ล่าช้า',
          urgent: true,
          time: 'ขณะนี้',
          createdAt: new Date().toISOString(),
          actionTarget: 'buses'
        });
        notifications.push({
          id: 'notif_bus_default_2',
          sourceId: 'WU-104',
          type: 'bus_issue',
          categoryLabel: 'การตรวจสภาพรถ',
          title: 'กำหนดรอบตรวจเช็กความพร้อมระบบเบรกและยาง รถ WU-104',
          description: 'แจ้งเตือนรอบการบำรุงรักษาเชิงป้องกัน (Preventive Maintenance) ประจำสัปดาห์สำหรับรถสาย 1',
          location: 'ศูนย์ซ่อมบำรุง มวล.',
          target: 'รถ WU-104',
          busId: 'WU-104',
          driverName: 'ณรงค์ มีสุข',
          status: 'แจ้งรอบตรวจ',
          urgent: false,
          time: 'วันนี้',
          createdAt: new Date().toISOString(),
          actionTarget: 'buses'
        });
      }
    } catch (e) {
      console.warn('NotificationService bus issues aggregation error:', e);
    }

    // 3. ประกาศและแจ้งเตือนด่วน (Broadcast Notifications from AnnouncementService)
    try {
      const announcements = AnnouncementService.getAll() || [];
      announcements.forEach((ann) => {
        notifications.push({
          id: `notif_ann_${ann.id}`,
          sourceId: ann.id,
          type: 'announcement',
          categoryLabel: ann.urgent ? 'ประกาศด่วนพิเศษ' : 'ประกาศข่าวสาร',
          title: ann.title || 'ประกาศระบบ',
          description: ann.text || '',
          location: 'ส่วนกลางมหาวิทยาลัยวลัยลักษณ์',
          target: ann.category || 'ผู้ใช้บริการทุกท่าน',
          status: ann.urgent ? 'ด่วน' : 'ข่าวสาร',
          urgent: Boolean(ann.urgent),
          time: ann.time || 'วันนี้',
          createdAt: ann.createdAt || new Date().toISOString(),
          rawData: ann,
          actionTarget: 'chatbot'
        });
      });
    } catch (e) {
      console.warn('NotificationService announcements aggregation error:', e);
    }

    // Sort: Urgent items first, then newer items
    notifications.sort((a, b) => {
      if (a.urgent && !b.urgent) return -1;
      if (!a.urgent && b.urgent) return 1;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    return notifications;
  },

  getUnreadCount: () => {
    const list = NotificationService.getAllNotifications();
    return list.filter((n) => n.urgent).length;
  },

  subscribeNotifications: (callback) => {
    callback(NotificationService.getAllNotifications());

    const unsubs = [];
    if (typeof window !== 'undefined') {
      const onStorage = (e) => {
        if (
          e.key === STORAGE_KEYS.REPORTS ||
          e.key === STORAGE_KEYS.BUSES ||
          e.key === STORAGE_KEYS.ANNOUNCEMENTS ||
          e.key === STORAGE_KEYS.SENSORS
        ) {
          callback(NotificationService.getAllNotifications());
        }
      };
      window.addEventListener('storage', onStorage);
      unsubs.push(() => window.removeEventListener('storage', onStorage));
    }

    const unsubRep = ReportService.subscribeReports(() => callback(NotificationService.getAllNotifications()));
    const unsubAnn = AnnouncementService.subscribeAnnouncements(() => callback(NotificationService.getAllNotifications()));
    const unsubBus = BusService.subscribeBuses(() => callback(NotificationService.getAllNotifications()));

    unsubs.push(unsubRep, unsubAnn, unsubBus);

    return () => {
      unsubs.forEach((u) => {
        try {
          if (typeof u === 'function') u();
        } catch (e) {}
      });
    };
  }
};
