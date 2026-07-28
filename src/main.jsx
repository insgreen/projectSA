import React, { useEffect, useMemo, useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Bus, Map, Route, Search, Bell, Flag, User, Moon, Sun, LogOut,
  Gauge, Clock3, Users, Armchair, Navigation, ShieldCheck, Menu,
  X, ChevronRight, CircleAlert, CheckCircle2, LayoutDashboard,
  CalendarClock, Star, Settings, Database, MapPin, Activity,
  MessageSquareWarning, Eye, EyeOff, RefreshCw, AlertTriangle,
  Info, Filter, ArrowUpRight, Check, Sliders, Play, Pause, Zap,
  ShoppingBag, Thermometer
} from 'lucide-react';
import L from 'leaflet';
import './styles.css';

// ----------------------------------------------------------------------
// 1. ROUTE & STOP DEFINITIONS (EXACT SPECIFICATION FROM PROMPT)
// ----------------------------------------------------------------------
const ROUTES = [
  {
    id: 1,
    name: 'สาย 1 (หอพัก - อาคารเรียน)',
    color: '#22a447', // Green (matching ViaBus screenshots)
    bgColor: 'rgba(34, 164, 71, 0.12)',
    borderColor: '#22a447',
    polyline: [
      { lat: 8.6475, lng: 99.8936 }, // ตึกกิจกรรม
      { lat: 8.6478, lng: 99.8936 },
      { lat: 8.6478, lng: 99.8929 }, //หัวเลี้ยวหอ 5
      { lat: 8.6475, lng: 99.8928 }, //หัวเลี้ยวหอ 5 (2)
      { lat: 8.6475, lng: 99.8904 },
      { lat: 8.6479, lng: 99.8904 },
      { lat: 8.6486, lng: 99.8904 }, // หอพัก Residence
      { lat: 8.6487, lng: 99.8874 },
      { lat: 8.6479, lng: 99.8873 },
      { lat: 8.64795, lng: 99.8893 }, // ลัก 18
      { lat: 8.64795, lng: 99.8904 },
      { lat: 8.6475, lng: 99.8904 },
      { lat: 8.6475, lng: 99.8928 }, //หัวเลี้ยวหอ 5 (2)
      { lat: 8.6478, lng: 99.8929 }, //หัวเลี้ยวหอ 5
      { lat: 8.6478, lng: 99.8936 },
      { lat: 8.6469, lng: 99.8936 }, // ตึกกิจกรรม
      { lat: 8.6469, lng: 99.8940 }, //แยก อบ
      { lat: 8.6456, lng: 99.8940 }, //ทางผ่านเอดี
      { lat: 8.6451, lng: 99.8942 },
      { lat: 8.6444, lng: 99.8948 },
      { lat: 8.6461, lng: 99.89665 },  //  ทางไปไทยบุรี
      { lat: 8.6459, lng: 99.8970 },
      { lat: 8.6458, lng: 99.8975 },   //หน้าไทยบุรี
      { lat: 8.6458, lng: 99.8978 },
      { lat: 8.6461, lng: 99.8982 },
      { lat: 8.6434, lng: 99.9011 }, //ทางไปตึกบริหาร
      { lat: 8.6426, lng: 99.9019 },
      { lat: 8.6421, lng: 99.9012 },
      { lat: 8.6420, lng: 99.9012 },
      { lat: 8.6419, lng: 99.9018 },
      { lat: 8.6417, lng: 99.9019 },
      { lat: 8.6415, lng: 99.9019 },
      { lat: 8.6413, lng: 99.9017 },
      { lat: 8.6412, lng: 99.9013 },
      { lat: 8.6411, lng: 99.9012 },
      { lat: 8.6405, lng: 99.9017 },
      { lat: 8.6367, lng: 99.8979 },
      { lat: 8.6367, lng: 99.8973 },
      { lat: 8.6369, lng: 99.8967 },
      { lat: 8.6412, lng: 99.8925 },
      { lat: 8.6416, lng: 99.8924 },
      { lat: 8.6420, lng: 99.8925 },
      { lat: 8.6444, lng: 99.8948 }

    ],
    stops: [
      { id: '1-1', name: 'อาคารกิจกรรม', lat: 8.6474, lng: 99.8937 },
      { id: '1-2', name: 'หอพัก Residence', lat: 8.6479, lng: 99.8876 },
      { id: '1-3', name: 'หอพักลักษณานิเวศ 18', lat: 8.6479, lng: 99.8893 },
      { id: '1-4', name: 'หอพักลักษณานิเวศ 5', lat: 8.6475, lng: 99.8921 },
      { id: '1-5', name: 'ตรงข้ามอาคารกิจกรรมนักศึกษา', lat: 8.6474, lng: 99.8936 },
      { id: '1-6', name: 'ศูนย์รวมรถ', lat: 8.6463, lng: 99.8940 },
      { id: '1-7', name: 'อาคารสถาปัตยกรรมและการออกแบบ', lat: 8.6450, lng: 99.8943 },
      { id: '1-8', name: 'อาคารเรียนรวม 3', lat: 8.6446, lng: 99.8951 },
      { id: '1-9', name: 'อาคารไทยบุรี', lat: 8.6458, lng: 99.8975 },
      { id: '1-10', name: 'ตรงข้ามอาคาร ST', lat: 8.6447, lng: 99.8997 },
      { id: '1-11', name: 'อาคารบริหาร (หน้าเสาธง)', lat: 8.6419, lng: 99.9014 },
      { id: '1-12', name: 'โรงพยาบาลสัตว์ใหญ่', lat: 8.6385, lng: 99.8997 },
      { id: '1-13', name: 'ตรงข้ามอาคารวิชาการ 5', lat: 8.6381, lng: 99.8955 },
      { id: '1-14', name: 'ตรงข้ามครัวโปรเชฟ', lat: 8.6392, lng: 99.8944 },
      { id: '1-15', name: 'ตรงข้ามอาคารกายวิภาค', lat: 8.6428, lng: 99.8933 },
    ]
  },
  {
    id: 2,
    name: 'สาย 2 (หอพัก - สนามกีฬา)',
    color: '#d4a900', // Yellow/Gold (from ViaBus screenshot)
    bgColor: 'rgba(212, 169, 0, 0.12)',
    borderColor: '#d4a900',
    polyline: [
      { lat: 8.6475, lng: 99.8936 }, // ตึกกิจกรรม
      { lat: 8.6478, lng: 99.8936 },
      { lat: 8.6478, lng: 99.8929 }, //หัวเลี้ยวหอ 5
      { lat: 8.6475, lng: 99.8928 }, //หัวเลี้ยวหอ 5 (2)
      { lat: 8.6475, lng: 99.8904 },
      { lat: 8.6479, lng: 99.8904 },
      { lat: 8.6486, lng: 99.8904 }, // หอพัก Residence
      { lat: 8.6487, lng: 99.8874 },
      { lat: 8.6479, lng: 99.8873 },
      { lat: 8.64795, lng: 99.8893 }, // ลัก 18
      { lat: 8.64795, lng: 99.8904 },
      { lat: 8.6470, lng: 99.8902 }, //แยกป้อมหอเรส
      { lat: 8.6469, lng: 99.8871 },
      { lat: 8.6477, lng: 99.8823 }, //แยกคอร์ด
      { lat: 8.6490, lng: 99.8825 },
      { lat: 8.6495, lng: 99.8798 }, //วงเวียนสนามกีฬา
      { lat: 8.6496, lng: 99.8798 },
      { lat: 8.6495, lng: 99.8797 },
      { lat: 8.6494, lng: 99.8797 },
      { lat: 8.6495, lng: 99.8798 }
    ],
    stops: [
      { id: '2-1', name: 'อาคารกิจกรรม', lat: 8.6474, lng: 99.8937 },
      { id: '2-2', name: 'หอพัก Residence', lat: 8.6479, lng: 99.8876 },
      { id: '2-3', name: 'หอพักลักษณานิเวศ 18', lat: 8.6479, lng: 99.8893 },
      { id: '2-4', name: 'ตรงข้ามสนามแบดมินตัน', lat: 8.6483, lng: 99.8824 },
      { id: '2-5', name: 'ตรงข้ามอาคารพลศึกษา', lat: 8.6492, lng: 99.8814 },
      { id: '2-6', name: 'สระว่ายน้ำ', lat: 8.6493, lng: 99.8806 },
      { id: '2-7', name: 'สนามเทนนิส', lat: 8.6494, lng: 99.8801 },
    ]
  },
  {
    id: 3,
    name: 'สาย 3 (สวนวลัยลักษณ์ - โลตัส)',
    color: '#7e22ce', // Purple
    bgColor: 'rgba(126, 34, 206, 0.12)',
    borderColor: '#7e22ce',
    polyline: [
      { lat: 8.6555, lng: 99.8815 }, // ท่ารถสาย 1, 2
    ],
    stops: [
      { id: '3-1', name: 'ท่ารถสาย 1, 2', lat: 8.6555, lng: 99.8815 },
    ]
  },
  {
    id: 4,
    name: 'สาย 4 (สายรอบมหาวิทยาลัย)',
    color: '#f97316', // Orange
    bgColor: 'rgba(249, 115, 22, 0.12)',
    borderColor: '#f97316',
    polyline: [
      { lat: 8.6555, lng: 99.8815 }, // ท่ารถสาย 1, 2
    ],
    stops: [
      { id: '4-1', name: 'ท่ารถสาย 1, 2', lat: 8.6555, lng: 99.8815 },
    ]
  }
];

// Initial Bus Telemetry Data
const INITIAL_BUSES = [
  {
    id: 'WU-101',
    route: 1,
    progressIndex: 3,
    speed: 34,
    eta: 3,
    passengers: 24,
    seated: 13,
    standing: 11,
    status: 'กำลังให้บริการ',
    late: 0,
    driverName: 'สมชาย ดีเยี่ยม',
    seats: ['occupied','occupied','free','occupied','occupied','occupied','disabled','free','occupied','occupied','occupied','free','occupied','occupied']
  },
  {
    id: 'WU-102',
    route: 1,
    progressIndex: 7,
    speed: 28,
    eta: 6,
    passengers: 30,
    seated: 14,
    standing: 16,
    status: 'รถเต็ม',
    late: 2,
    driverName: 'อนันต์ สุขใจ',
    seats: Array(14).fill('occupied')
  },
  {
    id: 'WU-201',
    route: 2,
    progressIndex: 2,
    speed: 24,
    eta: 4,
    passengers: 17,
    seated: 11,
    standing: 6,
    status: 'กำลังให้บริการ',
    late: 0,
    driverName: 'วิชัย มั่นคง',
    seats: ['occupied','free','occupied','occupied','free','occupied','free','occupied','occupied','free','occupied','occupied','free','free']
  },
  {
    id: 'WU-301',
    route: 3,
    progressIndex: 4,
    speed: 18,
    eta: 9,
    passengers: 12,
    seated: 9,
    standing: 3,
    status: 'รถมาสายเกิน 5 นาที',
    late: 7,
    driverName: 'ประเสริฐ เจริญดี',
    seats: ['occupied','free','free','occupied','free','occupied','free','occupied','free','occupied','free','free','occupied','occupied']
  },
  {
    id: 'WU-401',
    route: 4,
    progressIndex: 1,
    speed: 26,
    eta: 2,
    passengers: 15,
    seated: 10,
    standing: 5,
    status: 'กำลังให้บริการ',
    late: 0,
    driverName: 'กิตติศักดิ์ พรหมมินทร์',
    seats: ['occupied','occupied','free','free','occupied','occupied','free','occupied','free','occupied','occupied','free','free','occupied']
  }
];

// Initial Driver Reports (Anonymous to driver view)
const INITIAL_REPORTS = [
  {
    id: 'REP-082',
    busId: 'WU-201',
    category: 'ไม่จอดรับผู้โดยสาร',
    location: 'บริเวณอาคารสถาปัตยกรรมฯ',
    timestamp: '10:15 น. (วันนี้)',
    details: 'รถขับผ่านจุดจอดโดยไม่ชะลอรับนักศึกษาที่ยืนรออยู่',
    scoreImpact: -3
  },
  {
    id: 'REP-079',
    busId: 'WU-201',
    category: 'ขับรถเร็ว',
    location: 'เส้นทางหน้าอาคารบริหาร',
    timestamp: 'เมื่อวาน 14:30 น.',
    details: 'ขับขี่ด้วยความเร็วเกินกำหนดในเขตชุมชนชะลอความเร็ว',
    scoreImpact: -5
  }
];

// Campus Buildings for Search
const CAMPUS_BUILDINGS = [
  { name: 'อาคารไทยบุรี', x: 48, y: 52, category: 'อาคารเรียนรวม', route: 1 },
  { name: 'อาคารบริหาร (ตรงข้ามเสาธง)', x: 45, y: 42, category: 'สำนักงานบริหาร', route: 2 },
  { name: 'อาคารกิจกรรมนักศึกษา', x: 63, y: 72, category: 'ศูนย์กิจกรรม', route: 1 },
  { name: 'อาคารสถาปัตยกรรมฯ', x: 42, y: 72, category: 'อาคารเรียน', route: 2 },
  { name: 'โรงพยาบาลสัตว์ใหญ่', x: 34, y: 38, category: 'ศูนย์การแพทย์', route: 2 },
  { name: 'สวนวลัยลักษณ์', x: 32, y: 28, category: 'สวนสาธารณะ', route: 3 },
  { name: 'อาคารพลศึกษา / สระว่ายน้ำ', x: 48, y: 84, category: 'ศูนย์กีฬา', route: 4 },
  { name: 'หอพัก Residence / ลักษณานิเวศ', x: 80, y: 45, category: 'หอพักนักศึกษา', route: 1 }
];

// System Announcements
const INITIAL_ANNOUNCEMENTS = [
  {
    id: 1,
    title: 'สาย 3 เพิ่มเที่ยววิ่งช่วงพักเที่ยง',
    time: '10 นาทีที่แล้ว',
    category: 'ข่าวสารบริการ',
    urgent: false,
    text: 'เพื่อรองรับผู้ใช้บริการช่วงเวลา 11:30 - 13:30 น. เพิ่มความถี่วิ่งทุก 8 นาที'
  },
  {
    id: 2,
    title: 'แจ้งเตือน: รถ WU-301 ล่าช้า 7 นาที',
    time: '25 นาทีที่แล้ว',
    category: 'สถานะการเดินรถ',
    urgent: true,
    text: 'เนื่องจากมีปริมาณการจราจรหนาแน่นบริเวณประตูทางเข้ามหาวิทยาลัย'
  },
  {
    id: 3,
    title: 'ติดตั้งเซนเซอร์ตรวจจับที่นั่งว่างเวอร์ชันใหม่ครบทุกคัน',
    time: 'เมื่อวานนี้',
    category: 'อัปเดตระบบ',
    urgent: false,
    text: 'เซนเซอร์บนที่นั่ง 14 จุดและเซนเซอร์นับผู้โดยสารยืน 16 จุด ส่งข้อมูลแม่นยำแบบ Real-time 100%'
  }
];

// ----------------------------------------------------------------------
// MAIN APPLICATION COMPONENT
// ----------------------------------------------------------------------
export default function App() {
  const [stage, setStage] = useState('splash'); // 'splash' | 'login' | 'app'
  const [role, setRole] = useState('student'); // 'student' | 'guest' | 'driver'
  const [auth, setAuth] = useState(null); // 'passenger' | 'driver' | 'admin'
  const [dark, setDark] = useState(false);
  const [activeTab, setActiveTab] = useState('map');
  const [buses, setBuses] = useState(INITIAL_BUSES);
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [driverScore, setDriverScore] = useState(92); // Default driver score

  const [isLiveActive, setIsLiveActive] = useState(true);
  const [liveSpeed, setLiveSpeed] = useState(1); // 1 = Normal 1s, 2 = Fast 0.5s
  const [lastUpdateSec, setLastUpdateSec] = useState(0);

  // 24-Hour Session Persistence Check (24 hours = 86,400,000 ms)
  const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

  useEffect(() => {
    try {
      const savedSession = localStorage.getItem('wu_bus_session_v1');
      if (savedSession) {
        const { auth: savedAuth, role: savedRole, timestamp } = JSON.parse(savedSession);
        const elapsed = Date.now() - (timestamp || 0);

        if (savedAuth && elapsed < SESSION_DURATION_MS) {
          // Session valid (< 24 hrs) -> Auto login into app
          setAuth(savedAuth);
          if (savedRole) setRole(savedRole);
          const timer = setTimeout(() => setStage('app'), 1200);
          return () => clearTimeout(timer);
        } else {
          // Session expired (>= 24 hrs) -> Clear session & prompt login
          localStorage.removeItem('wu_bus_session_v1');
          const timer = setTimeout(() => setStage('login'), 1200);
          return () => clearTimeout(timer);
        }
      } else {
        const timer = setTimeout(() => setStage('login'), 1500);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      const timer = setTimeout(() => setStage('login'), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Theme Sync
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }, [dark]);

  // High-frequency Real-time GPS & Seat Sensor Telemetry Loop (3-second interval sync)
  useEffect(() => {
    if (stage !== 'app' || !isLiveActive) return;

    // 3-second refresh cycle for realistic telemetry update
    const intervalMs = liveSpeed === 2 ? 1500 : 3000;
    const interval = setInterval(() => {
      setLastUpdateSec((s) => (s + 3) % 60);

      setBuses((prevBuses) =>
        prevBuses.map((bus) => {
          const route = ROUTES.find((r) => r.id === bus.route);
          if (!route) return bus;

          const pLength = route.polyline.length;

          // If bus is currently dwelling at a stop (จอดรับ-ส่งผู้โดยสาร)
          if (bus.dwellTicks && bus.dwellTicks > 0) {
            // Realistic Passenger Boarding & Alighting Simulation at Stop
            let newSeats = [...(bus.seats || Array(14).fill('free'))];
            
            // 1-2 passengers alight (get off) or board (get on)
            const changeCount = Math.floor(Math.random() * 2) + 1;
            for (let i = 0; i < changeCount; i++) {
              const targetSeat = Math.floor(Math.random() * 14);
              if (newSeats[targetSeat] !== 'disabled') {
                const randVal = Math.random();
                if (randVal < 0.45) newSeats[targetSeat] = 'human';
                else if (randVal < 0.65) newSeats[targetSeat] = 'free';
                else if (randVal < 0.8) newSeats[targetSeat] = 'object';
              }
            }

            const seatedCount = newSeats.filter((s) => s === 'human' || s === 'occupied').length;
            const standingDelta = Math.floor(Math.random() * 5) - 2; // -2 to +2 standing
            const newStanding = Math.min(16, Math.max(0, bus.standing + standingDelta));
            const totalPass = Math.min(30, seatedCount + newStanding);

            return {
              ...bus,
              dwellTicks: bus.dwellTicks - 1,
              speed: 0,
              passengers: totalPass,
              seated: seatedCount,
              standing: newStanding,
              seats: newSeats,
              status: 'จอดรับ-ส่งผู้โดยสาร ณ จุดจอด'
            };
          }

          // Moving bus simulation: advance along polyline segment
          let currIndex = bus.progressIndex || 0;
          let subProg = (bus.subProgress || 0) + 0.15; // Advance ~15% per 3s tick
          let newDwell = 0;

          if (subProg >= 1) {
            currIndex = (currIndex + 1) % pLength;
            subProg = 0;
            newDwell = 2; // Dwell for 2 ticks (6 seconds total) at bus stop
          }

          // Minor variance while moving
          let newSeats = [...(bus.seats || Array(14).fill('free'))];
          if (Math.random() > 0.8) {
            const idx = Math.floor(Math.random() * 14);
            if (newSeats[idx] !== 'disabled') {
              if (newSeats[idx] === 'human' && Math.random() > 0.5) newSeats[idx] = 'free';
            }
          }

          const seatedCount = newSeats.filter((s) => s === 'human' || s === 'occupied').length;
          const standingDelta = Math.floor(Math.random() * 3) - 1;
          const newStanding = Math.min(16, Math.max(0, bus.standing + standingDelta));
          const totalPass = Math.min(30, seatedCount + newStanding);

          let status = 'กำลังให้บริการ';
          if (totalPass >= 30) status = 'รถเต็ม';
          else if (bus.late > 5) status = 'รถมาสายเกิน 5 นาที';

          // Realistic speed variation between 18 and 35 km/h
          const newSpeed = newDwell > 0 ? 0 : Math.floor(18 + Math.random() * 17);
          const remainingStops = pLength - currIndex;
          const newEta = Math.max(1, Math.ceil(remainingStops * 1.2));

          return {
            ...bus,
            progressIndex: currIndex,
            subProgress: subProg,
            dwellTicks: newDwell,
            passengers: totalPass,
            seated: seatedCount,
            standing: newStanding,
            seats: newSeats,
            status,
            speed: newSpeed,
            eta: newEta
          };
        })
      );
    }, intervalMs);

    return () => clearInterval(interval);
  }, [stage, isLiveActive, liveSpeed]);

  const handleReportSubmit = (newReport) => {
    setReports(prev => [newReport, ...prev]);
    if (newReport.busId === 'WU-201') {
      setDriverScore(prev => Math.max(40, prev + newReport.scoreImpact));
    }
  };

  const handleLogout = () => {
    setAuth(null);
    setStage('login');
    localStorage.removeItem('wu_bus_session_v1');
  };

  const handleLoginSuccess = (authedRole) => {
    setAuth(authedRole);
    setStage('app');
    localStorage.setItem(
      'wu_bus_session_v1',
      JSON.stringify({
        auth: authedRole,
        role: role,
        timestamp: Date.now()
      })
    );
  };

  if (stage === 'splash') {
    return <SplashScreen onSkip={() => setStage('login')} />;
  }

  if (!auth) {
    return (
      <LoginPage
        role={role}
        setRole={setRole}
        onLogin={handleLoginSuccess}
        dark={dark}
        setDark={setDark}
      />
    );
  }

  if (auth === 'driver') {
    return (
      <DriverDashboard
        dark={dark}
        setDark={setDark}
        logout={handleLogout}
        reports={reports}
        score={driverScore}
        buses={buses}
        setBuses={setBuses}
      />
    );
  }

  if (auth === 'admin') {
    return (
      <AdminDashboard
        dark={dark}
        setDark={setDark}
        logout={handleLogout}
        buses={buses}
        setBuses={setBuses}
        reports={reports}
      />
    );
  }

  return (
    <PassengerDashboard
      dark={dark}
      setDark={setDark}
      logout={handleLogout}
      active={activeTab}
      setActive={setActiveTab}
      buses={buses}
      setBuses={setBuses}
      isLiveActive={isLiveActive}
      setIsLiveActive={setIsLiveActive}
      liveSpeed={liveSpeed}
      setLiveSpeed={setLiveSpeed}
      onReportSubmit={handleReportSubmit}
    />
  );
}

// ----------------------------------------------------------------------
// 2. BRAND & HEADER COMPONENTS
// ----------------------------------------------------------------------
function Brand({ compact = false }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className={`brand ${compact ? 'compact' : ''}`}>
      <div className="brandLogoWrap">
        {!imgError ? (
          <img
            src="https://www.wu.ac.th/th/images/logo-wu.png"
            alt="Walailak University Emblem"
            className="wuLogoImg"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="brandIconFallback">
            <Bus size={compact ? 20 : 26} />
          </div>
        )}
      </div>
      <div className="brandText">
        <strong className="brandTitle">WU BUS</strong>
        <span className="brandSub">น้องมันม่วง Connect</span>
        {!compact && (
          <span className="brandTagline">Walailak University Smart Bus Tracking System</span>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 3. SPLASH SCREEN
// ----------------------------------------------------------------------
function SplashScreen({ onSkip }) {
  const [imgError, setImgError] = useState(false);

  return (
    <main className="splash">
      <div className="splashGlow" />
      <div className="splashCard">
        <div className="logoPulse">
          {!imgError ? (
            <img
              src="https://www.wu.ac.th/th/images/logo-wu.png"
              alt="Walailak University"
              className="splashLogo"
              onError={() => setImgError(true)}
            />
          ) : (
            <Bus size={48} className="busIconSplash" />
          )}
        </div>
        <div className="splashBadge">มหาวิทยาลัยวลัยลักษณ์</div>
        <h1>WU BUS</h1>
        <h2>น้องมันม่วง Connect</h2>
        <p>Walailak University Smart Bus Tracking System</p>
        <div className="loader">
          <span />
        </div>
        <button className="skipSplashBtn" onClick={onSkip}>
          เข้าสู่ระบบทันที <ChevronRight size={16} />
        </button>
      </div>
    </main>
  );
}

// ----------------------------------------------------------------------
// 4. LOGIN PAGE (3 ROLES WITH VALIDATION)
// ----------------------------------------------------------------------
function LoginPage({ role, setRole, onLogin, dark, setDark }) {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [successToast, setSuccessToast] = useState('');

  const roleConfig = {
    student: {
      label: 'นักศึกษา',
      placeholder: 'รหัสนักศึกษา 8 หลัก (เช่น 66123456)',
      len: 8,
      hint: 'กรุณากรอกรหัสนักศึกษา 8 หลัก',
      defaultDemo: '66109876'
    },
    guest: {
      label: 'บุคคลภายนอก',
      placeholder: 'เลขบัตรประชาชน 13 หลัก',
      len: 13,
      hint: 'กรุณากรอกเลขบัตรประชาชน 13 หลัก',
      defaultDemo: '1809900123456'
    },
    driver: {
      label: 'คนขับรถ',
      placeholder: 'รหัสคนขับ 6 หลัก (เช่น 600101)',
      len: 6,
      hint: 'กรุณากรอกรหัสคนขับ 6 หลัก',
      defaultDemo: '600101'
    }
  }[role];

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setId('');
    setError('');
  };

  const handleQuickFill = () => {
    setId(roleConfig.defaultDemo);
    setPw('1234');
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!id.trim()) {
      setError(`กรุณากรอก${roleConfig.label === 'นักศึกษา' ? 'รหัสนักศึกษา' : roleConfig.label === 'บุคคลภายนอก' ? 'เลขบัตรประชาชน' : 'รหัสคนขับ'}`);
      return;
    }

    if (!/^\d+$/.test(id) || id.length !== roleConfig.len) {
      setError(`ข้อมูลไม่ถูกต้อง: ${roleConfig.hint}`);
      return;
    }

    if (!pw.trim() || pw.length < 4) {
      setError('กรุณากรอกรหัสผ่านอย่างน้อย 4 ตัวอักษร');
      return;
    }

    setSuccessToast('เข้าสู่ระบบสำเร็จ กำลังพาคุณเข้าสู่ระบบ...');
    setTimeout(() => {
      onLogin(role === 'driver' ? 'driver' : 'passenger');
    }, 600);
  };

  return (
    <main className="loginPage">
      <button
        className="themeFloating"
        onClick={() => setDark(!dark)}
        title="เปลี่ยนธีม Dark/Light"
      >
        {dark ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Visual Left Banner */}
      <section className="loginVisual">
        <div className="visualOverlay" />
        <div className="visualInner">
          <Brand />
          <h1>
            ระบบติดตามรถโดยสารสมาร์ทบัส<br />
            <span>มหาวิทยาลัยวลัยลักษณ์</span>
          </h1>
          <p>
            เข้าถึงตำแหน่งรถเรียลไทม์ ตรวจสอบจำนวนที่นั่งว่างด้วยเซนเซอร์อัจฉริยะ
            และวางแผนการเดินทางภายในแคปัสวลัยลักษณ์อย่างแม่นยำ
          </p>
          <div className="miniStats">
            <div>
              <Navigation />
              <b>4 สาย</b>
              <span>เส้นทางรอบ มวล.</span>
            </div>
            <div>
              <MapPin />
              <b>30+ จุดจอด</b>
              <span>เชื่อมต่อทุกอาคาร</span>
            </div>
            <div>
              <Zap />
              <b>Sensor Live</b>
              <span>เช็กที่นั่งเรียลไทม์</span>
            </div>
          </div>
        </div>
      </section>

      {/* Form Right Panel */}
      <section className="loginPanel">
        <form className="loginCard" onSubmit={handleSubmit}>
          <div className="mobileBrand">
            <Brand compact />
          </div>

          <div className="eyebrow">WALAI LAK UNIVERSITY SMART BUS</div>
          <h2>เข้าสู่ระบบ WU BUS</h2>
          <p className="muted">โปรดเลือกประเภทบัญชีของคุณก่อนกรอกข้อมูลเข้าสู่ระบบ</p>

          {/* Account Role Selector */}
          <div className="roleTabs">
            {[
              ['student', 'นักศึกษา'],
              ['guest', 'บุคคลภายนอก'],
              ['driver', 'คนขับรถ']
            ].map(([k, v]) => (
              <button
                type="button"
                className={role === k ? 'active' : ''}
                onClick={() => handleRoleChange(k)}
                key={k}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Input ID */}
          <label>
            {roleConfig.label === 'นักศึกษา' ? 'รหัสนักศึกษา (8 หลัก)' : roleConfig.label === 'บุคคลภายนอก' ? 'เลขบัตรประชาชน (13 หลัก)' : 'รหัสคนขับรถ (6 หลัก)'}
            <div className="inputWrap">
              <User size={18} />
              <input
                inputMode="numeric"
                value={id}
                onChange={(e) =>
                  setId(e.target.value.replace(/\D/g, '').slice(0, roleConfig.len))
                }
                placeholder={roleConfig.placeholder}
              />
              <span className="charCounter">
                {id.length}/{roleConfig.len}
              </span>
            </div>
          </label>

          {/* Input Password */}
          <label>
            รหัสผ่าน
            <div className="inputWrap">
              <ShieldCheck size={18} />
              <input
                type={showPw ? 'text' : 'password'}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="••••••••"
              />
              <button
                type="button"
                className="eyeToggleBtn"
                onClick={() => setShowPw(!showPw)}
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          {/* Error & Success Messages */}
          {error && (
            <div className="formError">
              <CircleAlert size={18} />
              <span>{error}</span>
            </div>
          )}

          {successToast && (
            <div className="formSuccess">
              <CheckCircle2 size={18} />
              <span>{successToast}</span>
            </div>
          )}

          {/* Submit */}
          <button type="submit" className="primaryBtn">
            เข้าสู่ระบบ <ChevronRight size={19} />
          </button>

          <div className="quickFillRow">
            <button type="button" className="quickFillBtn" onClick={handleQuickFill}>
              <Zap size={14} /> ใส่ข้อมูลทดสอบ ({roleConfig.label})
            </button>
          </div>

          <div className="adminDivider">
            <span>หรือสำหรับผู้ทดสอบระบบ</span>
          </div>

          <button
            type="button"
            className="adminLink"
            onClick={() => onLogin('admin')}
          >
            <ShieldCheck size={17} /> เข้าสู่ระบบผู้ดูแลระบบ (Admin Mode)
          </button>

          <p className="demoHint">
            ระบบตรวจสอบสิทธิ์และพาเข้าสู่ Dashboard ของผู้ใช้แต่ละประเภทโดยอัตโนมัติ
          </p>
        </form>
      </section>
    </main>
  );
}

// ----------------------------------------------------------------------
// 5. SHELL CONTAINER FOR DASHBOARDS
// ----------------------------------------------------------------------
function Shell({
  children,
  dark,
  setDark,
  logout,
  title,
  subtitle,
  navItems,
  active,
  setActive,
  badgeText = 'LIVE CONNECTED'
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="appShell">
      {/* Sidebar Navigation */}
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sideTop">
          <Brand compact />
          <button
            className="closeMobile"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav>
          {navItems.map((n) => (
            <button
              key={n.id}
              className={active === n.id ? 'active' : ''}
              onClick={() => {
                setActive?.(n.id);
                setMobileOpen(false);
              }}
            >
              <n.icon size={20} />
              <span>{n.label}</span>
              {n.badge && <span className="navBadge">{n.badge}</span>}
            </button>
          ))}
        </nav>

        <div className="sideBottom">
          <button onClick={() => setDark(!dark)}>
            {dark ? <Sun size={19} /> : <Moon size={19} />}
            <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button onClick={logout} className="logoutBtn">
            <LogOut size={19} />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="mainArea">
        <header className="topbar">
          <button
            className="mobileMenu"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          <div className="headerTitles">
            <div className="titleRow">
              <h1>{title}</h1>
              <span className="liveStatusBadge">
                <i className="pingDot" /> {badgeText}
              </span>
            </div>
            <p>{subtitle}</p>
          </div>

          <div className="topActions">
            <button
              className="iconTopBtn"
              title="การแจ้งเตือน"
              onClick={() => setActive?.('notifications')}
            >
              <Bell size={20} />
              <i className="bellDot" />
            </button>
            <div className="avatar">WU</div>
          </div>
        </header>

        <div className="pageContainer">{children}</div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 6. PASSENGER DASHBOARD & PAGES
// ----------------------------------------------------------------------
const passengerNav = [
  { id: 'home', label: 'Home', icon: LayoutDashboard },
  { id: 'map', label: 'Bus Map', icon: Map },
  { id: 'routes', label: 'Bus Routes', icon: Route },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'notifications', label: 'Notifications', icon: Bell, badge: '3' },
  { id: 'report', label: 'Report Driver', icon: Flag },
  { id: 'profile', label: 'Profile', icon: User }
];

function PassengerDashboard({
  dark,
  setDark,
  logout,
  active,
  setActive,
  buses,
  setBuses,
  isLiveActive,
  setIsLiveActive,
  liveSpeed,
  setLiveSpeed,
  onReportSubmit
}) {
  const [selectedBusId, setSelectedBusId] = useState('WU-101');
  const [selectedStop, setSelectedStop] = useState(null);

  const handleSelectBus = (busOrId) => {
    const busId = typeof busOrId === 'string' ? busOrId : busOrId.id;
    setSelectedBusId(busId);
    setSelectedStop(null);
    setActive('map');
  };

  return (
    <Shell
      dark={dark}
      setDark={setDark}
      logout={logout}
      active={active}
      setActive={setActive}
      navItems={passengerNav}
      title={
        active === 'map'
          ? 'Bus Map (แผนที่เรียลไทม์)'
          : active === 'home'
          ? 'Passenger Dashboard'
          : active === 'routes'
          ? 'Bus Routes & Schedule'
          : active === 'search'
          ? 'Search Bus & Stops'
          : active === 'notifications'
          ? 'Notifications'
          : active === 'report'
          ? 'Report Driver'
          : 'User Profile'
      }
      subtitle="ระบบติดตามรถโดยสาร มหาวิทยาลัยวลัยลักษณ์"
    >
      {active === 'map' && (
        <MapPage
          buses={buses}
          setBuses={setBuses}
          isLiveActive={isLiveActive}
          setIsLiveActive={setIsLiveActive}
          liveSpeed={liveSpeed}
          setLiveSpeed={setLiveSpeed}
          onReportSubmit={onReportSubmit}
          selectedBusId={selectedBusId}
          setSelectedBusId={setSelectedBusId}
          selectedStop={selectedStop}
          setSelectedStop={setSelectedStop}
          onSelectBus={handleSelectBus}
        />
      )}
      {active === 'home' && (
        <HomePage
          setActive={setActive}
          buses={buses}
          onSelectBus={handleSelectBus}
        />
      )}
      {active === 'routes' && <RoutesPage />}
      {active === 'search' && <SearchPage setActive={setActive} />}
      {active === 'notifications' && <NotificationsPage />}
      {active === 'report' && <ReportPage onReportSubmit={onReportSubmit} buses={buses} />}
      {active === 'profile' && <ProfilePage logout={logout} dark={dark} setDark={setDark} />}
    </Shell>
  );
}

// ----------------------------------------------------------------------
// REAL INTERACTIVE LEAFLET MAP OF WALAILAK UNIVERSITY
// ----------------------------------------------------------------------
function LeafletMapComponent({
  visibleRoutes,
  visibleBuses,
  selectedBus,
  setSelectedBus,
  selectedStop,
  setSelectedStop
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerGroupRef = useRef(null);
  const pinnedMarkerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    
    // Support module import (L) or CDN global (window.L)
    const leafletObj = (typeof L !== 'undefined' && L.map) ? L : (typeof window !== 'undefined' ? window.L : null);
    if (!leafletObj) return;

    // Centered on Walailak University campus (Thasala, Nakhon Si Thammarat)
    const map = leafletObj.map(containerRef.current, {
      center: [8.6445, 99.8970],
      zoom: 15,
      zoomControl: false
    });

    // Zoom Controls
    leafletObj.control.zoom({ position: 'bottomright' }).addTo(map);

    // Single OpenStreetMap Standard Tile Layer (Exact clean ViaBus map style)
    leafletObj.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Passenger Pickup Pin Drop on Map Click
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      
      if (pinnedMarkerRef.current) {
        map.removeLayer(pinnedMarkerRef.current);
      }

      const pinIcon = leafletObj.divIcon({
        className: 'customPickupPinIcon',
        html: `
          <div style="position: relative; text-align: center;">
            <div style="background: #5C068C; color: white; padding: 4px 10px; border-radius: 14px; font-weight: bold; font-size: 11px; white-space: nowrap; box-shadow: 0 4px 12px rgba(92,6,140,0.4); border: 2px solid white; display: inline-block;">
              📍 จุดที่คุณต้องการขึ้นรถ
            </div>
            <div style="width: 12px; height: 12px; background: #5C068C; border: 2px solid white; border-radius: 50%; margin: -2px auto 0; box-shadow: 0 2px 6px rgba(0,0,0,0.4);"></div>
          </div>
        `,
        iconSize: [160, 42],
        iconAnchor: [80, 42]
      });

      const newMarker = leafletObj.marker([lat, lng], { icon: pinIcon }).addTo(map);
      newMarker.bindPopup(`<b>📍 จุดเรียกรถของคุณ</b><br/>พิกัด: ${lat.toFixed(4)}, ${lng.toFixed(4)}<br/><span style="color:#5C068C; font-weight:bold;">ส่งตำแหน่งให้รถบัสเรียบร้อย!</span>`).openPopup();
      pinnedMarkerRef.current = newMarker;
    });

    const layerGroup = leafletObj.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Sync Layers (Polylines, Stops, Bus Markers) on data update
  useEffect(() => {
    const map = mapRef.current;
    const layerGroup = layerGroupRef.current;
    const leafletObj = (typeof L !== 'undefined' && L.map) ? L : (typeof window !== 'undefined' ? window.L : null);
    if (!map || !layerGroup || !leafletObj) return;

    layerGroup.clearLayers();

    // 1. Render Route Polylines & Stop Markers
    visibleRoutes.forEach((route) => {
      const latLngs = route.polyline.map((p) => [p.lat, p.lng]);

      // Glow backdrop
      leafletObj.polyline(latLngs, {
        color: route.color,
        weight: 9,
        opacity: 0.35,
        lineCap: 'round'
      }).addTo(layerGroup);

      // Core Animated Dashed Polyline
      leafletObj.polyline(latLngs, {
        color: route.color,
        weight: 5,
        opacity: 0.95,
        dashArray: '10, 10',
        className: 'animatedDashedPolyline',
        lineCap: 'round'
      }).addTo(layerGroup);

      // Bus Stops
      route.stops.forEach((stop) => {
        const isSelected = selectedStop?.id === stop.id;
        const iconHtml = `
          <div class="leafletStopMarker ${isSelected ? 'active' : ''}" style="border-color: ${route.color}">
            <div class="stopDot" style="background: ${route.color}"></div>
          </div>
        `;
        const divIcon = leafletObj.divIcon({
          html: iconHtml,
          className: 'customStopDivIcon',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        const marker = leafletObj.marker([stop.lat, stop.lng], { icon: divIcon }).addTo(layerGroup);
        marker.bindPopup(`<b>${stop.name}</b><br/>สาย: ${route.name}`);
        marker.on('click', () => setSelectedStop(stop));
      });
    });

    // 2. Render Moving Bus Markers
    visibleBuses.forEach((bus) => {
      const route = ROUTES.find((r) => r.id === bus.route);
      if (!route) return;

      const pLen = route.polyline.length;
      const idx = bus.progressIndex || 0;
      const subProg = bus.subProgress || 0;

      const p1 = route.polyline[idx] || route.polyline[0];
      const p2 = route.polyline[(idx + 1) % pLen] || p1;

      // Linear interpolation between Lat/Lng GPS coordinates
      const curLat = p1.lat + (p2.lat - p1.lat) * subProg;
      const curLng = p1.lng + (p2.lng - p1.lng) * subProg;

      const isSelected = selectedBus?.id === bus.id;
      const densityPercent = Math.round((bus.passengers / 30) * 100);
      const isFull = bus.passengers >= 30;
      const barColor = densityPercent > 90 ? '#ef4444' : densityPercent > 60 ? '#f59e0b' : '#22c55e';

      const busHtml = `
        <div class="leafletBusWrapper ${isSelected ? 'active' : ''}">
          <div class="markerEtaBadge ${isFull ? 'full' : bus.late > 5 ? 'late' : ''}">
            ${isFull ? '🚫 รถเต็ม (30/30)' : `⏱️ ${bus.eta} นาที • ${bus.passengers}/30`}
          </div>
          <div class="busMarker" style="background: ${route.color}">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4c-1.1 0-2.1.8-2.4 1.8l-1.4 5C.1 13.2 0 13.6 0 14c0 .4.1.8.2 1.2C.5 16.3 1 18 1 18h3"/><circle cx="6.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/></svg>
          </div>
          <div class="markerProgressBarTrack">
            <div class="markerProgressBarFill" style="width: ${densityPercent}%; background: ${barColor}"></div>
          </div>
        </div>
      `;

      const divIcon = leafletObj.divIcon({
        html: busHtml,
        className: 'customBusDivIcon',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const marker = leafletObj.marker([curLat, curLng], { icon: divIcon }).addTo(layerGroup);
      marker.on('click', () => {
        setSelectedBus(bus);
        setSelectedStop(null);
      });
    });
  }, [visibleRoutes, visibleBuses, selectedBus, selectedStop]);

  return <div ref={containerRef} className="leafletMapCanvas" />;
}

// ----------------------------------------------------------------------
// 7. BUS MAP PAGE (PRIMARY CORE COMPONENT)
// ----------------------------------------------------------------------
function MapPage({
  buses,
  setBuses,
  isLiveActive = true,
  setIsLiveActive,
  liveSpeed = 1,
  setLiveSpeed,
  onReportSubmit,
  selectedBusId: propSelectedBusId,
  setSelectedBusId: propSetSelectedBusId,
  selectedStop: propSelectedStop,
  setSelectedStop: propSetSelectedStop,
  onSelectBus
}) {
  const [selectedRouteFilter, setSelectedRouteFilter] = useState(0); // 0 = All lines
  const [localSelectedBusId, setLocalSelectedBusId] = useState(buses[0]?.id || 'WU-101');
  const [localSelectedStop, setLocalSelectedStop] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightCoords, setHighlightCoords] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const selectedBusId = propSelectedBusId !== undefined ? propSelectedBusId : localSelectedBusId;
  const setSelectedBusId = propSetSelectedBusId || setLocalSelectedBusId;

  const selectedStop = propSelectedStop !== undefined ? propSelectedStop : localSelectedStop;
  const setSelectedStop = propSetSelectedStop || setLocalSelectedStop;

  // Dynamic lookup ensures currentActiveBus ALWAYS receives live telemetry updates from buses array
  const currentActiveBus = buses.find((b) => b.id === selectedBusId) || buses[0] || INITIAL_BUSES[0];

  const setSelectedBus = (bus) => {
    if (bus && bus.id) {
      if (onSelectBus) {
        onSelectBus(bus.id);
      } else {
        setSelectedBusId(bus.id);
        setSelectedStop(null);
      }
    }
  };

  const [isSyncing, setIsSyncing] = useState(false);

  const handleUpdateStatus = () => {
    setIsSyncing(true);
    const targetBusId = currentActiveBus.id;

    // Refresh telemetry status (sync GPS position, update speed & ETA based on actual route movement)
    setBuses?.((prevBuses) =>
      prevBuses.map((b) => {
        if (b.id !== targetBusId) return b;
        
        // Preserve current seats array, just sync status parameters
        const seatedCount = (b.seats || []).filter((s) => s === 'human' || s === 'occupied').length;
        const totalPass = Math.min(30, seatedCount + (b.standing || 0));
        
        return {
          ...b,
          lastSyncTime: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          speed: Math.floor(20 + Math.random() * 10),
          passengers: totalPass,
          status: totalPass >= 30 ? 'หนาแน่นมาก' : totalPass >= 18 ? 'ปานกลาง' : 'ว่าง'
        };
      })
    );

    setTimeout(() => {
      setIsSyncing(false);
    }, 600);
  };

  // Interactive Dual-Sensor (Weight + Thermal IR) state toggling
  const toggleSeatState = (seatIdx) => {
    const targetBusId = currentActiveBus.id;
    setBuses?.((prevBuses) =>
      prevBuses.map((b) => {
        if (b.id !== targetBusId) return b;
        const newSeats = [...(b.seats || Array(14).fill('free'))];
        const curState = newSeats[seatIdx];
        if (curState !== 'disabled') {
          // Cycle: free -> human (occupied) -> object -> free
          if (curState === 'free') newSeats[seatIdx] = 'human';
          else if (curState === 'human' || curState === 'occupied') newSeats[seatIdx] = 'object';
          else newSeats[seatIdx] = 'free';
        }
        const newSeated = newSeats.filter((s) => s === 'human' || s === 'occupied').length;
        const totalPass = Math.min(30, newSeated + b.standing);
        return {
          ...b,
          seats: newSeats,
          seated: newSeated,
          passengers: totalPass
        };
      })
    );
  };

  const simulateBoarding = () => {
    const targetBusId = currentActiveBus.id;
    setBuses?.((prevBuses) =>
      prevBuses.map((b) => {
        if (b.id !== targetBusId) return b;
        const newSeats = [...(b.seats || Array(14).fill('free'))];
        const freeIdx = newSeats.findIndex((s) => s === 'free');
        if (freeIdx !== -1) {
          newSeats[freeIdx] = 'human';
        }
        const newSeated = newSeats.filter((s) => s === 'human' || s === 'occupied').length;
        const totalPass = Math.min(30, newSeated + b.standing);
        return {
          ...b,
          seats: newSeats,
          seated: newSeated,
          passengers: totalPass
        };
      })
    );
  };

  const simulateAddObject = () => {
    const targetBusId = currentActiveBus.id;
    setBuses?.((prevBuses) =>
      prevBuses.map((b) => {
        if (b.id !== targetBusId) return b;
        const newSeats = [...(b.seats || Array(14).fill('free'))];
        const freeIdx = newSeats.findIndex((s) => s === 'free');
        if (freeIdx !== -1) {
          newSeats[freeIdx] = 'object';
        }
        const newSeated = newSeats.filter((s) => s === 'human' || s === 'occupied').length;
        const totalPass = Math.min(30, newSeated + b.standing);
        return {
          ...b,
          seats: newSeats,
          seated: newSeated,
          passengers: totalPass
        };
      })
    );
  };

  const simulateAlighting = () => {
    const targetBusId = currentActiveBus.id;
    setBuses?.((prevBuses) =>
      prevBuses.map((b) => {
        if (b.id !== targetBusId) return b;
        const newSeats = [...(b.seats || Array(14).fill('free'))];
        const occIdx = newSeats.findIndex((s) => s === 'human' || s === 'occupied' || s === 'object');
        if (occIdx !== -1) {
          newSeats[occIdx] = 'free';
        }
        const newSeated = newSeats.filter((s) => s === 'human' || s === 'occupied').length;
        const totalPass = Math.min(30, newSeated + b.standing);
        return {
          ...b,
          seats: newSeats,
          seated: newSeated,
          passengers: totalPass
        };
      })
    );
  };

  const randomizeSeats = () => {
    const targetBusId = currentActiveBus.id;
    setBuses?.((prevBuses) =>
      prevBuses.map((b) => {
        if (b.id !== targetBusId) return b;
        const states = ['free', 'human', 'human', 'object', 'free'];
        const newSeats = Array(14)
          .fill(0)
          .map(() => states[Math.floor(Math.random() * states.length)]);
        const newSeated = newSeats.filter((s) => s === 'human' || s === 'occupied').length;
        const totalPass = Math.min(30, newSeated + b.standing);
        return {
          ...b,
          seats: newSeats,
          seated: newSeated,
          passengers: totalPass
        };
      })
    );
  };

  // Filter buses based on selected route filter (0 = all)
  const visibleBuses = useMemo(() => {
    if (selectedRouteFilter === 0) return buses;
    return buses.filter((b) => b.route === selectedRouteFilter);
  }, [buses, selectedRouteFilter]);

  // Keep selectedBusId in sync if filter changes
  useEffect(() => {
    if (selectedRouteFilter !== 0) {
      const filtered = buses.filter((b) => b.route === selectedRouteFilter);
      if (filtered.length > 0 && !filtered.some((b) => b.id === selectedBusId)) {
        setSelectedBusId(filtered[0].id);
      }
    }
  }, [selectedRouteFilter, buses, selectedBusId]);

  // Filter routes to show polylines & stops (if 0 show all, else show selected only)
  const visibleRoutes = useMemo(() => {
    if (selectedRouteFilter === 0) return ROUTES;
    return ROUTES.filter((r) => r.id === selectedRouteFilter);
  }, [selectedRouteFilter]);

  // Handle Search submit
  const runSearch = () => {
    if (!searchQuery.trim()) return;
    const queryLower = searchQuery.toLowerCase();

    // Check bus
    const foundBus = buses.find((b) => b.id.toLowerCase().includes(queryLower));
    if (foundBus) {
      setSelectedBus(foundBus);
      return;
    }

    // Check building / stop
    for (const route of ROUTES) {
      const foundStop = route.stops.find((s) => s.name.toLowerCase().includes(queryLower));
      if (foundStop) {
        setSelectedStop(foundStop);
        return;
      }
    }
  };

  const freeSeats = 14 - currentActiveBus.seated;
  const densityPercent = Math.round((currentActiveBus.passengers / 30) * 100);

  return (
    <div className="mapWorkspace">
      {/* Left Map Viewport */}
      <section className="mapPanel">
        {/* Search & Actions Bar */}
        <div className="mapToolbar">
          <div className="searchBox">
            <Search size={18} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runSearch()}
              placeholder="ค้นหาหมายเลขรถ (WU-101), จุดจอด หรืออาคารใน มวล."
            />
            <button onClick={runSearch}>ค้นหา</button>
          </div>
        </div>

        {/* Route Filter Pills */}
        <div className="routeFilters">
          <button
            className={selectedRouteFilter === 0 ? 'selected' : ''}
            onClick={() => {
              setSelectedRouteFilter(0);
              setSelectedStop(null);
            }}
          >
            <Filter size={14} /> ทุกสาย (1-4)
          </button>
          {ROUTES.map((r) => (
            <button
              key={r.id}
              className={selectedRouteFilter === r.id ? 'selected' : ''}
              onClick={() => {
                setSelectedRouteFilter(r.id);
                setSelectedStop(null);
              }}
              style={{
                borderColor: selectedRouteFilter === r.id ? r.color : undefined
              }}
            >
              <span className="routeColorDot" style={{ background: r.color }} />
              {r.name}
            </button>
          ))}
        </div>

        {/* Interactive Real Leaflet Map Canvas */}
        <div className="mapCanvas">
          <LeafletMapComponent
            visibleRoutes={visibleRoutes}
            visibleBuses={visibleBuses}
            selectedBus={currentActiveBus}
            setSelectedBus={setSelectedBus}
            selectedStop={selectedStop}
            setSelectedStop={setSelectedStop}
          />
        </div>
      </section>

      {/* Right Details Panel: Bus Detail or Selected Bus Stop Detail */}
      <aside className="busDetails">
        {selectedStop ? (
          /* SELECTED BUS STOP DETAILS */
          <div className="stopDetailContainer">
            <div className="stopDetailHead">
              <div className="stopIconWrap">
                <MapPin size={24} />
              </div>
              <div>
                <span className="stopBadge">จุดจอดรถโดยสาร</span>
                <h2>{selectedStop.name}</h2>
                <p>เลือกขึ้นรถที่จุดจอดนี้</p>
              </div>
              <button className="closeStopBtn" onClick={() => setSelectedStop(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="stopInfoNotice">
              <Info size={16} />
              <span>
                ข้อมูลรถที่จะมาถึงจุดจอดนี้ เพื่อประกอบการตัดสินใจในการรอรถ (ไม่มีระบบจองที่นั่ง)
              </span>
            </div>

            <h3>รถโดยสารที่กำลังจะมาถึง</h3>

            <div className="upcomingBusesList">
              {visibleBuses.map((b) => (
                <div key={b.id} className="upcomingBusCard" onClick={() => setSelectedBus(b)}>
                  <div
                    className="busRouteBadge"
                    style={{ background: ROUTES.find((r) => r.id === b.route)?.color }}
                  >
                    <Bus size={16} />
                    <span>สาย {b.route}</span>
                  </div>
                  <div className="upcomingInfo">
                    <strong>{b.id}</strong>
                    <small>ความหนาแน่น: {Math.round((b.passengers / 30) * 100)}%</small>
                  </div>
                  <div className="upcomingEta">
                    <b>{b.eta} นาที</b>
                    <span>ผู้โดยสาร {b.passengers}/30</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* SELECTED BUS DETAILS & SEAT MAP SENSOR */
          <div className="busDetailContainer">
            <div className="detailHead">
              <div
                className="busIcon"
                style={{
                  background: ROUTES.find((r) => r.id === currentActiveBus.route)?.bgColor,
                  color: ROUTES.find((r) => r.id === currentActiveBus.route)?.color
                }}
              >
                <Bus size={28} />
              </div>
              <div>
                <div className="headStatusRow">
                  <span className="statusDot">● LIVE SENSOR</span>
                  <span
                    className="routeTag"
                    style={{
                      background: ROUTES.find((r) => r.id === currentActiveBus.route)?.color
                    }}
                  >
                    {ROUTES.find((r) => r.id === currentActiveBus.route)?.name}
                  </span>
                </div>
                <h2>{currentActiveBus.id}</h2>
                <p>คนขับ: {currentActiveBus.driverName}</p>
              </div>
            </div>

            {/* ALERT BANNERS */}
            {currentActiveBus.passengers >= 30 && (
              <div className="alertBanner full">
                <CircleAlert size={18} />
                <span>รถเต็ม กรุณารอรถคันถัดไป</span>
              </div>
            )}

            {currentActiveBus.late > 5 && (
              <div className="alertBanner late">
                <AlertTriangle size={18} />
                <span>รถมาสายเกิน 5 นาที (ช้ากว่ากำหนด {currentActiveBus.late} นาที)</span>
              </div>
            )}

            {/* METRICS GRID */}
            <div className="metricGrid">
              <Metric icon={Gauge} label="ความเร็ว" value={`${currentActiveBus.speed} km/h`} />
              <Metric icon={Clock3} label="ETA" value={`${currentActiveBus.eta} นาที`} />
              <Metric
                icon={Users}
                label="ผู้โดยสาร"
                value={`${currentActiveBus.passengers}/30 คน`}
              />
              <Metric icon={Armchair} label="ที่นั่งว่าง" value={`${freeSeats} ที่`} />
            </div>

            {/* DENSITY PROGRESS BAR */}
            <div className="densityCard">
              <div className="densityTop">
                <b>ความหนาแน่นผู้โดยสาร</b>
                <span>{densityPercent}%</span>
              </div>
              <div className="progress">
                <i
                  style={{
                    width: `${densityPercent}%`,
                    background:
                      densityPercent > 90
                        ? '#ef4444'
                        : densityPercent > 60
                        ? '#f59e0b'
                        : '#22c55e'
                  }}
                />
              </div>
              <div className="densitySub">
                <span>นั่ง {currentActiveBus.seated}/14 คน</span>
                <span>ยืน {currentActiveBus.standing}/16 คน</span>
              </div>
            </div>

            {/* 14 SEAT DUAL-SENSOR (WEIGHT + THERMAL IR) LAYOUT */}
            <div className="seatSection">
              <div className="sectionTitle">
                <div>
                  <h3>ผังที่นั่ง Dual-Sensor (น้ำหนัก + ความร้อน)</h3>
                  <span>ตรวจจับอุณหภูมิร่างกาย (36.5°C) vs กระเป๋า/สัมภาระ (25.0°C)</span>
                </div>
                <button
                  type="button"
                  className={`refreshSensorsBtn ${isSyncing ? 'syncing' : ''}`}
                  onClick={handleUpdateStatus}
                  disabled={isSyncing}
                  title="คลิกเพื่ออัปเดตสถานะ GPS และเซนเซอร์ที่นั่งล่าสุด"
                >
                  <RefreshCw size={13} className={isSyncing ? 'spinIcon' : ''} />
                  {isSyncing ? 'กำลังอัปเดต...' : 'อัปเดตสถานะ'}
                </button>
              </div>

              {/* OBJECT DETECTED WARNING BANNER */}
              {(currentActiveBus.seats || []).some((s) => s === 'object') && (
                <div className="alertBanner objectWarning" style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', margin: '8px 0 12px' }}>
                  <ShoppingBag size={16} />
                  <span>
                    เซนเซอร์ตรวจพบกระเป๋า/สัมภาระวางบนที่นั่ง #
                    {(currentActiveBus.seats || [])
                      .map((s, i) => (s === 'object' ? i + 1 : null))
                      .filter(Boolean)
                      .join(', ')}{' '}
                    (น้ำหนัก &gt;2kg, อุณหภูมิห้อง 25°C - ไม่นับเป็นผู้โดยสาร)
                  </span>
                </div>
              )}

              <div className="seatLegend">
                <span>
                  <i className="legendDot free" /> ว่าง (0kg | 25°C)
                </span>
                <span>
                  <i className="legendDot occupied" /> ผู้โดยสาร (50kg | 36.5°C)
                </span>
                <span>
                  <i className="legendDot object" style={{ background: '#f59e0b' }} /> วางกระเป๋า (6kg | 25°C)
                </span>
                <span>
                  <i className="legendDot disabled" /> ไม่พร้อมใช้ (Gray)
                </span>
              </div>

              <div className="seatGrid">
                {(currentActiveBus.seats || Array(14).fill('free')).map((state, idx) => {
                  const isHuman = state === 'human' || state === 'occupied';
                  const isObject = state === 'object';
                  const isFree = state === 'free';
                  const seatClass = isHuman ? 'occupied' : isObject ? 'objectSeat' : state;

                  return (
                    <button
                      key={idx}
                      type="button"
                      className={`seatItem ${seatClass} interactiveSeat`}
                      onClick={() => toggleSeatState(idx)}
                      title={`ที่นั่ง #${idx + 1}: ${
                        isHuman
                          ? 'น้ำหนัก 52kg • ความร้อน 36.8°C (มนุษย์ 🧑)'
                          : isObject
                          ? 'น้ำหนัก 6.5kg • ความร้อน 25.1°C (วางสิ่งของ/กระเป๋า 🎒)'
                          : 'น้ำหนัก 0kg • ความร้อน 25.0°C (ว่าง 🟢)'
                      }`}
                    >
                      {isObject ? <ShoppingBag size={15} /> : <Armchair size={16} />}
                      <span className="seatNum">{idx + 1}</span>
                    </button>
                  );
                })}
              </div>

              <div className="sensorTelemetryInfo">
                <Thermometer size={14} />
                <span>Dual-Telemetry Matrix: FSR Weight + IR Thermal Array Active (Node: WU-SEN-0{currentActiveBus.route})</span>
              </div>
            </div>

            {/* LOCATION CARD */}
            <div className="locationCard">
              <Navigation size={20} />
              <div>
                <small>ตำแหน่งปัจจุบัน</small>
                <b>
                  {currentActiveBus.speed === 0
                    ? 'จอดรับ-ส่งผู้โดยสาร ณ จุดจอด'
                    : `กำลังมุ่งหน้าจุดจอด ${
                        ROUTES.find((r) => r.id === currentActiveBus.route)?.stops[
                          currentActiveBus.progressIndex
                        ]?.name || 'อาคารไทยบุรี'
                      }`}
                </b>
              </div>
            </div>

            {/* REPORT BUTTON */}
            <button className="reportBtn" onClick={() => setIsReportModalOpen(true)}>
              <Flag size={18} /> รายงานพฤติกรรมคนขับรถ
            </button>
          </div>
        )}
      </aside>

      {/* REPORT MODAL */}
      {isReportModalOpen && (
        <ReportModal
          close={() => setIsReportModalOpen(false)}
          busId={currentActiveBus.id}
          onReportSubmit={onReportSubmit}
        />
      )}
    </div>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="metric">
      <Icon size={20} />
      <div>
        <small>{label}</small>
        <b>{value}</b>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 8. REPORT MODAL & REPORT PAGE
// ----------------------------------------------------------------------
function ReportModal({ close, busId, onReportSubmit }) {
  const [category, setCategory] = useState('ขับรถเร็ว');
  const [details, setDetails] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newReport = {
      id: `REP-${Math.floor(100 + Math.random() * 900)}`,
      busId,
      category,
      location: 'บริเวณภายในมหาวิทยาลัยวลัยลักษณ์',
      timestamp: 'เมื่อครู่นี้',
      details: details || 'ไม่มีรายละเอียดเพิ่มเติม',
      scoreImpact: -5
    };
    onReportSubmit(newReport);
    setSent(true);
  };

  return (
    <div className="modalBackdrop">
      <div className="modalCard">
        {sent ? (
          <div className="successState">
            <CheckCircle2 size={60} className="successIcon" />
            <h2>ส่งรายงานเรียบร้อยแล้ว</h2>
            <p>
              ขอบคุณสำหรับข้อมูล ระบบได้เก็บบันทึกรายงานเพื่อนำไปปรับปรุงบริการ
              โดยไม่เปิดเผยชื่อ รหัสนักศึกษา หรือข้อมูลส่วนตัวของคุณแก่คนขับรถ
            </p>
            <button className="primaryBtn" onClick={close}>
              ตกลงและปิดหน้าต่าง
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="modalHead">
              <div>
                <h2>รายงานพฤติกรรมคนขับรถ ({busId})</h2>
                <p>รายงานของคุณจะถูกส่งไปยังผู้ดูแลระบบโดยไม่เปิดเผยตัวตน</p>
              </div>
              <button type="button" className="closeBtn" onClick={close}>
                <X size={20} />
              </button>
            </div>

            <div className="privacyNotice">
              <ShieldCheck size={18} />
              <span>
                การรับประกันความเป็นส่วนตัว: คนขับรถจะไม่สามารถดูชื่อ หรือรหัสนักศึกษาของผู้รายงานได้
              </span>
            </div>

            <label className="fieldLabel">หัวข้อการรายงาน</label>
            <div className="reportCategoryOptions">
              {[
                'ขับรถเร็ว',
                'ขับรถอันตราย',
                'พูดจาไม่สุภาพ',
                'ไม่จอดรับผู้โดยสาร',
                'ออกรถก่อนผู้โดยสารขึ้นครบ',
                'อื่น ๆ'
              ].map((cat) => (
                <label key={cat} className={`catRadio ${category === cat ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="reportCat"
                    value={cat}
                    checked={category === cat}
                    onChange={() => setCategory(cat)}
                  />
                  <span>{cat}</span>
                </label>
              ))}
            </div>

            <label className="fieldLabel">รายละเอียดเพิ่มเติม (ไม่บังคับ)</label>
            <textarea
              placeholder="ระบุสถานที่ หรือรายละเอียดเหตุการณ์..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
            />

            <div className="modalActions">
              <button type="button" className="cancelBtn" onClick={close}>
                ยกเลิก
              </button>
              <button type="submit" className="primaryBtn">
                ส่งรายงาน <ChevronRight size={18} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 9. OTHER PASSENGER PAGES (HOME, ROUTES, SEARCH, NOTIFICATIONS, PROFILE)
// ----------------------------------------------------------------------
function HomePage({ setActive, buses, onSelectBus }) {
  return (
    <div className="contentPage">
      <div className="homeHero">
        <div>
          <span className="heroBadge">WALAI LAK UNIVERSITY SMART BUS</span>
          <h2>ยินดีต้อนรับสู่ระบบ WU BUS</h2>
          <p>
            ติดตามรถโดยสารประจำทางภายในมหาวิทยาลัยวลัยลักษณ์แบบเรียลไทม์ เช็กที่นั่งว่าง
            และวางแผนการเดินทางได้อย่างสะดวกสบาย
          </p>
          <div className="heroBtns">
            <button className="primaryBtn heroBtn" onClick={() => setActive('map')}>
              <Map size={18} /> ดูแผนที่รถโดยสารเรียลไทม์
            </button>
            <button className="secondaryBtn heroBtn" onClick={() => setActive('routes')}>
              <Route size={18} /> ตารางเส้นทาง 4 สาย
            </button>
          </div>
        </div>
      </div>

      <div className="quickStatsGrid">
        <div className="qStatCard">
          <Bus size={32} />
          <div>
            <b>{buses.length} คัน</b>
            <small>รถให้บริการขณะนี้</small>
          </div>
        </div>
        <div className="qStatCard">
          <Navigation size={32} />
          <div>
            <b>4 สาย</b>
            <small>ครอบคลุมทั่วแคปัส</small>
          </div>
        </div>
        <div className="qStatCard">
          <Clock3 size={32} />
          <div>
            <b>4-6 นาที</b>
            <small>ระยะเวลารอรถเฉลี่ย</small>
          </div>
        </div>
        <div className="qStatCard">
          <Zap size={32} />
          <div>
            <b>Sensor 100%</b>
            <small>ตรวจจับที่นั่งแบบ Real-time</small>
          </div>
        </div>
      </div>

      {/* Live Arriving Buses Grid - Clickable to open Seat Sensor & Map */}
      <h3 className="sectionHeading">รถโดยสารที่กำลังจะมาถึง (คลิกที่การ์ดเพื่อดูผังที่นั่ง & พิกัด)</h3>
      <div className="upcomingBusesList homeBusGrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {buses.map((b) => {
          const route = ROUTES.find((r) => r.id === b.route);
          return (
            <div
              key={b.id}
              className="upcomingBusCard"
              style={{ cursor: 'pointer', background: 'var(--card-bg)', border: '1px solid var(--border)' }}
              onClick={() => onSelectBus?.(b.id)}
            >
              <div
                className="busRouteBadge"
                style={{ background: route?.color }}
              >
                <Bus size={16} />
                <span>สาย {b.route}</span>
              </div>
              <div className="upcomingInfo">
                <strong>{b.id}</strong>
                <small>ความหนาแน่น: {Math.round((b.passengers / 30) * 100)}%</small>
              </div>
              <div className="upcomingEta" style={{ textAlign: 'right' }}>
                <b style={{ display: 'block', color: 'var(--wu-purple-primary)', fontSize: '15px' }}>{b.eta} นาที</b>
                <span style={{ fontSize: '11px', color: '#666' }}>ผู้โดยสาร {b.passengers}/30</span>
              </div>
            </div>
          );
        })}
      </div>

      <h3 className="sectionHeading">สายรถโดยสารมหาวิทยาลัยวลัยลักษณ์ (4 สาย)</h3>
      <div className="routeCards">
        {ROUTES.map((r) => (
          <article key={r.id} className="routeOverviewCard" onClick={() => setActive('map')}>
            <div className="routeCardHead">
              <span style={{ background: r.color }}>
                <Bus size={22} />
              </span>
              <div>
                <h3>{r.name}</h3>
                <p>{r.stops.length} จุดจอดรับ-ส่ง</p>
              </div>
            </div>
            <div className="stopHighlights">
              <small>จุดจอดสำคัญ:</small>
              <p>
                {r.stops.slice(0, 4).map((s) => s.name).join(' ➔ ')} ...
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function RoutesPage() {
  return (
    <div className="contentPage">
      <div className="pageIntro">
        <h2>Bus Routes & Stops (เส้นทางและจุดจอดรถทั้ง 4 สาย)</h2>
        <p>รายละเอียดจุดจอดและเส้นทางการเดินรถตรงตามแผนที่มหาวิทยาลัยวลัยลักษณ์ 100%</p>
      </div>

      <div className="fullRouteList">
        {ROUTES.map((route) => (
          <div key={route.id} className="routeDetailBox">
            <div className="routeHeaderBanner" style={{ background: route.color }}>
              <Bus size={24} />
              <div>
                <h3>{route.name}</h3>
                <span>{route.stops.length} จุดจอดในเส้นทาง</span>
              </div>
            </div>

            <ol className="stopsTimeline">
              {route.stops.map((stop, idx) => (
                <li key={stop.id}>
                  <i style={{ borderColor: route.color }} />
                  <div className="stopIndex">{idx + 1}</div>
                  <div className="stopTitle">{stop.name}</div>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}

function SearchPage({ setActive }) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const matches = [];

    CAMPUS_BUILDINGS.forEach((b) => {
      if (b.name.toLowerCase().includes(q) || b.category.toLowerCase().includes(q)) {
        matches.push({ title: b.name, subtitle: `อาคาร/สถานที่ • สาย ${b.route}`, type: 'building' });
      }
    });

    ROUTES.forEach((r) => {
      r.stops.forEach((s) => {
        if (s.name.toLowerCase().includes(q)) {
          matches.push({ title: s.name, subtitle: `จุดจอดรถ • ${r.name}`, type: 'stop' });
        }
      });
    });

    return matches;
  }, [query]);

  return (
    <div className="contentPage">
      <div className="pageIntro">
        <h2>ค้นหารถ จุดจอด หรืออาคาร</h2>
        <p>พิมพ์ชื่อสถานที่ อาคาร หรือหมายเลขรถเพื่อค้นหาตำแหน่งบนแผนที่</p>
      </div>

      <div className="bigSearchBox">
        <Search size={22} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="เช่น อาคารไทยบุรี, อาคารบริหาร, สวนวลัยลักษณ์, WU-101..."
          autoFocus
        />
        {query && (
          <button className="clearBtn" onClick={() => setQuery('')}>
            <X size={18} />
          </button>
        )}
      </div>

      <div className="searchResultsList">
        {results.length > 0 ? (
          results.map((res, i) => (
            <div key={i} className="searchItem" onClick={() => setActive('map')}>
              <MapPin size={20} />
              <div>
                <strong>{res.title}</strong>
                <small>{res.subtitle}</small>
              </div>
              <ChevronRight size={18} />
            </div>
          ))
        ) : query ? (
          <div className="emptyFeature">
            <Search size={40} />
            <h3>ไม่พบข้อมูลสถานที่ที่ตรงกับ "{query}"</h3>
            <p>ลองค้นหาด้วยคำค้นอื่น เช่น อาคารไทยบุรี, หอพัก, สนามกีฬา</p>
          </div>
        ) : (
          <div className="searchSuggestions">
            <h4>คำค้นหายอดนิยม</h4>
            <div className="tagCloud">
              {[
                'อาคารไทยบุรี',
                'อาคารบริหาร',
                'อาคารกิจกรรมนักศึกษา',
                'สวนวลัยลักษณ์',
                'โลตัสท่าศาลา',
                'สนามพลศึกษา',
                'หอพัก Residence'
              ].map((tag) => (
                <button key={tag} onClick={() => setQuery(tag)}>
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function NotificationsPage() {
  return (
    <div className="contentPage">
      <div className="pageIntro">
        <h2>การแจ้งเตือนและข่าวสารการเดินรถ</h2>
        <p>อัปเดตข้อมูลสถานะการให้บริการล่าสุดจากศูนย์บริหารจัดการรถโดยสาร</p>
      </div>

      <div className="notificationsFeed">
        {INITIAL_ANNOUNCEMENTS.map((item) => (
          <div key={item.id} className={`announcementCard ${item.urgent ? 'urgent' : ''}`}>
            <div className="annIcon">
              {item.urgent ? <AlertTriangle size={22} /> : <Info size={22} />}
            </div>
            <div className="annBody">
              <div className="annMeta">
                <span className="annCategory">{item.category}</span>
                <span className="annTime">{item.time}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportPage({ onReportSubmit, buses }) {
  const [busId, setBusId] = useState(buses[0]?.id || 'WU-101');
  const [category, setCategory] = useState('ขับรถเร็ว');
  const [details, setDetails] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newReport = {
      id: `REP-${Math.floor(100 + Math.random() * 900)}`,
      busId,
      category,
      location: 'เส้นทางเดินรถ มวล.',
      timestamp: 'เมื่อครู่นี้',
      details: details || 'ไม่มีรายละเอียดเพิ่มเติม',
      scoreImpact: -5
    };
    onReportSubmit(newReport);
    setSent(true);
  };

  return (
    <div className="contentPage">
      <div className="pageIntro">
        <h2>รายงานพฤติกรรมคนขับรถ</h2>
        <p>ช่วยเราปรับปรุงคุณภาพบริการ ข้อมูลผู้รายงานจะถูกเก็บเป็นความลับสูงสุด</p>
      </div>

      {sent ? (
        <div className="successCard">
          <CheckCircle2 size={64} color="#16a34a" />
          <h2>ส่งรายงานเรียบร้อยแล้ว</h2>
          <p>
            ขอบคุณสำหรับการแจ้งข้อมูล ระบบจะไม่เปิดเผยชื่อ รหัสนักศึกษา
            หรือข้อมูลส่วนตัวของคุณแก่คนขับรถ
          </p>
          <button className="primaryBtn" onClick={() => setSent(false)}>
            ส่งรายงานเรื่องอื่น
          </button>
        </div>
      ) : (
        <form className="reportPageForm" onSubmit={handleSubmit}>
          <div className="privacyBanner">
            <ShieldCheck size={24} />
            <div>
              <strong>รับประกันความปลอดภัยของข้อมูลผู้แจ้ง</strong>
              <p>คนขับรถจะไม่สามารถดูชื่อ รหัสนักศึกษา หรือข้อมูลส่วนตัวของผู้ส่งรายงานได้</p>
            </div>
          </div>

          <label className="fieldLabel">เลือกรถโดยสารที่ต้องการรายงาน</label>
          <select value={busId} onChange={(e) => setBusId(e.target.value)} className="selectInput">
            {buses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.id} (สาย {b.route} - คนขับ: {b.driverName})
              </option>
            ))}
          </select>

          <label className="fieldLabel">หัวข้อการรายงาน</label>
          <div className="reportCategoryGrid">
            {[
              'ขับรถเร็ว',
              'ขับรถอันตราย',
              'พูดจาไม่สุภาพ',
              'ไม่จอดรับผู้โดยสาร',
              'ออกรถก่อนผู้โดยสารขึ้นครบ',
              'อื่น ๆ'
            ].map((cat) => (
              <button
                type="button"
                key={cat}
                className={`catBox ${category === cat ? 'active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <label className="fieldLabel">รายละเอียดเพิ่มเติม</label>
          <textarea
            rows={4}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="ระบุสถานที่ หรือรายละเอียดเพิ่มเติมเพื่อความชัดเจน..."
          />

          <button type="submit" className="primaryBtn">
            ส่งรายงานความประพฤติ <ChevronRight size={18} />
          </button>
        </form>
      )}
    </div>
  );
}

function ProfilePage({ logout, dark, setDark }) {
  return (
    <div className="contentPage">
      <div className="profileCard">
        <div className="profileAvatar">WU</div>
        <div className="profileInfo">
          <h2>นักศึกษามหาวิทยาลัยวลัยลักษณ์</h2>
          <p>รหัสนักศึกษา: 66109876</p>
          <span className="roleBadge">PASSENGER ACCOUNT</span>
        </div>
      </div>

      <div className="profileSettings">
        <h3>การตั้งค่าระบบ</h3>
        <div className="settingItem">
          <div>
            <strong>โหมดกลางคืน (Dark Mode)</strong>
            <p>สลับธีมการแสดงผลเพื่อความสบายตา</p>
          </div>
          <button className="toggleBtn" onClick={() => setDark(!dark)}>
            {dark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <div className="settingItem">
          <div>
            <strong>ออกจากระบบ</strong>
            <p>ออกจากบัญชีเพื่อสลับสิทธิ์การเข้าใช้งาน</p>
          </div>
          <button className="logoutBtnInline" onClick={logout}>
            <LogOut size={18} /> ออกจากระบบ
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 10. DRIVER DASHBOARD (SEPARATE DRIVER VIEW)
// ----------------------------------------------------------------------
function DriverDashboard({ dark, setDark, logout, reports, score, buses, setBuses }) {
  const [activeTab, setActiveTab] = useState('overview');
  const myBus = buses.find((b) => b.id === 'WU-201') || buses[0] || INITIAL_BUSES[0];

  const driverNav = [
    { id: 'overview', label: 'Driver Dashboard', icon: LayoutDashboard },
    { id: 'schedule', label: 'ตารางเดินรถ', icon: CalendarClock },
    { id: 'reports', label: 'รายงานผู้โดยสาร', icon: MessageSquareWarning },
    { id: 'profile', label: 'ข้อมูลคนขับ', icon: User }
  ];

  // Driver score alert check (< 70 pts)
  const isScoreLow = score < 70;

  return (
    <Shell
      dark={dark}
      setDark={setDark}
      logout={logout}
      active={activeTab}
      setActive={setActiveTab}
      navItems={driverNav}
      title="Driver Dashboard"
      subtitle="ระบบปฏิบัติงานสำหรับคนขับรถโดยสาร WU BUS"
      badgeText="DRIVER ONLINE"
    >
      <div className="contentPage">
        {/* DRIVER HERO CARD */}
        <div className="driverHero">
          <div>
            <span className="dutyBadge">● กำลังปฏิบัติงาน</span>
            <h2>รถ {myBus.id} • สาย 2</h2>
            <p>รอบเวลา 08:00 – 16:00 น. • สถานะ GPS ออนไลน์</p>
          </div>
          <div className={`scoreBox ${isScoreLow ? 'warningScore' : ''}`}>
            <Star size={24} />
            <b>{score}</b>
            <span>คะแนนการปฏิบัติงาน</span>
          </div>
        </div>

        {/* DRIVER EVALUATION ALERT BANNER */}
        {isScoreLow && (
          <div className="scoreAlertBanner">
            <AlertTriangle size={24} />
            <div>
              <strong>คะแนนการปฏิบัติงานต่ำกว่ากำหนด ({score}/100)</strong>
              <p>กรุณาติดต่อเข้ารับการประเมินการขับขี่และการบริการ ณ ศูนย์ยานพาหนะ มหาวิทยาลัยวลัยลักษณ์</p>
            </div>
          </div>
        )}

        {/* METRICS ROW */}
        <div className="statCards">
          <Stat title="ความเร็วปัจจุบัน" value={`${myBus.speed} km/h`} icon={Gauge} />
          <Stat title="ผู้โดยสารทั้งหมด" value={`${myBus.passengers}/30`} icon={Users} />
          <Stat title="ที่นั่งว่าง" value={`${14 - myBus.seated} ที่`} icon={Armchair} />
          <Stat title="เวลาปฏิบัติงานเหลือ" value="4 ชม. 12 นาที" icon={Clock3} />
        </div>

        {/* TWO COLUMN CONTENT */}
        <div className="twoCols">
          {/* LEFT: NEXT STOPS SCHEDULE */}
          <article className="panelCard">
            <h3>ตารางรอบการเดินรถถัดไป</h3>
            {[
              '10:20 น. - ศูนย์รวมรถ (จุดเริ่มต้น)',
              '10:32 น. - อาคารบริหาร (ตรงข้ามเสาธง)',
              '10:45 น. - โรงพยาบาลสัตว์ใหญ่',
              '10:57 น. - ตรงข้ามอาคารวิชาการ 5'
            ].map((item, i) => (
              <div className="timelineRow" key={i}>
                <i className="timelineDot" />
                <span>{item}</span>
                {i === 0 && <span className="currentBadge">รอบปัจจุบัน</span>}
              </div>
            ))}
          </article>

          {/* RIGHT: ANONYMOUS PASSENGER REPORTS RECEIVED */}
          <article className="panelCard">
            <div className="panelHeadRow">
              <h3>รายงานจากผู้โดยสาร (ไม่แสดงชื่อผู้แจ้ง)</h3>
              <span className="privacyTag">ANONYMOUS FEEDBACK</span>
            </div>

            {reports.length > 0 ? (
              reports.map((rep) => (
                <div className="reportItemCard" key={rep.id}>
                  <MessageSquareWarning size={20} className="reportIcon" />
                  <div className="reportDetails">
                    <strong>{rep.category}</strong>
                    <p>{rep.location}</p>
                    <small>{rep.details} • {rep.timestamp}</small>
                  </div>
                  <span className="scoreMinus">{rep.scoreImpact} คะแนน</span>
                </div>
              ))
            ) : (
              <p className="muted">ยังไม่มีรายงานความประพฤติ</p>
            )}
          </article>
        </div>
      </div>
    </Shell>
  );
}

// ----------------------------------------------------------------------
// 11. ADMIN DASHBOARD (SYSTEM CONTROL CENTER)
// ----------------------------------------------------------------------
function AdminDashboard({ dark, setDark, logout, buses, setBuses, reports }) {
  const [activeTab, setActiveTab] = useState('dashboard');

  const adminNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'buses', label: 'จัดการรถ', icon: Bus },
    { id: 'drivers', label: 'จัดการคนขับ', icon: User },
    { id: 'routes', label: 'เส้นทางและจุดจอด', icon: Route },
    { id: 'sensor', label: 'GPS & Sensor Telemetry', icon: Database },
    { id: 'settings', label: 'ตั้งค่าระบบ', icon: Settings }
  ];

  return (
    <Shell
      dark={dark}
      setDark={setDark}
      logout={logout}
      active={activeTab}
      setActive={setActiveTab}
      navItems={adminNav}
      title="Admin Control Center"
      subtitle="ศูนย์ควบคุมและบริหารจัดการระบบ WU BUS มหาวิทยาลัยวลัยลักษณ์"
      badgeText="SYSTEM ADMIN"
    >
      <div className="contentPage">
        {/* TOP STAT CARDS */}
        <div className="statCards">
          <Stat title="รถเปิดให้บริการ" value={`${buses.length}/14 คัน`} icon={Bus} />
          <Stat title="ผู้โดยสารวันนี้" value="1,284 คน" icon={Users} />
          <Stat title="ETA เฉลี่ยทั้งระบบ" value="5.2 นาที" icon={Clock3} />
          <Stat title="รายงานวันนี้" value={`${reports.length} เรื่อง`} icon={Flag} />
        </div>

        {/* ADMIN GRID */}
        <div className="adminGrid">
          {/* HOURLY TRAFFIC CHART */}
          <article className="panelCard chartCard">
            <h3>สถิติผู้โดยสารรายชั่วโมง (วันนี้)</h3>
            <div className="fakeChart">
              {[30, 48, 78, 62, 91, 74, 55, 68, 40, 32].map((h, i) => (
                <div key={i} className="chartBarWrap">
                  <i style={{ height: `${h}%` }} />
                  <span>{String(8 + i).padStart(2, '0')}:00</span>
                </div>
              ))}
            </div>
          </article>

          {/* ROUTE DENSITY OVERVIEW */}
          <article className="panelCard">
            <h3>ความหนาแน่นแต่ละสาย</h3>
            {ROUTES.map((r, i) => {
              const val = [82, 64, 47, 58][i];
              return (
                <div className="routeDensity" key={r.id}>
                  <span>
                    <i style={{ background: r.color }} /> {r.name}
                  </span>
                  <div className="densityBarTrack">
                    <i style={{ width: `${val}%`, background: r.color }} />
                  </div>
                  <b>{val}%</b>
                </div>
              );
            })}
          </article>

          {/* REAL-TIME FLEET TELEMETRY TABLE */}
          <article className="panelCard tableCard">
            <h3>สถานะรถโดยสารและเซนเซอร์แบบเรียลไทม์</h3>
            <div className="tableResponsive">
              <table>
                <thead>
                  <tr>
                    <th>หมายเลขรถ</th>
                    <th>สายรถ</th>
                    <th>คนขับ</th>
                    <th>ผู้โดยสาร</th>
                    <th>ความเร็ว</th>
                    <th>สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {buses.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <strong>{b.id}</strong>
                      </td>
                      <td>
                        <span
                          className="routeMiniTag"
                          style={{ background: ROUTES.find((r) => r.id === b.route)?.color }}
                        >
                          สาย {b.route}
                        </span>
                      </td>
                      <td>{b.driverName}</td>
                      <td>
                        {b.passengers}/30 <small>(นั่ง {b.seated} / ยืน {b.standing})</small>
                      </td>
                      <td>{b.speed} km/h</td>
                      <td>
                        <span className={`tag ${b.passengers >= 30 || b.late > 5 ? 'warn' : 'ok'}`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </div>
      </div>
    </Shell>
  );
}

function Stat({ title, value, icon: Icon }) {
  return (
    <article className="statCard">
      <div>
        <small>{title}</small>
        <b>{value}</b>
      </div>
      <Icon size={26} />
    </article>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("WU BUS App Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: '20px',
          background: '#5C068C',
          color: '#fff',
          fontFamily: 'sans-serif',
          textAlign: 'center'
        }}>
          <div>
            <h2>เกิดข้อผิดพลาดในการโหลดระบบ (WU BUS)</h2>
            <p style={{ opacity: 0.8, margin: '10px 0 20px' }}>{this.state.error?.toString()}</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                background: '#fff',
                color: '#5C068C',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              โหลดหน้าเว็บใหม่อีกครั้ง
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}


