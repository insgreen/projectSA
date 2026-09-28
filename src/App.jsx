import React, { useState, useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import SplashScreen from './components/SplashScreen';
import LoginPage from './components/LoginPage';
import PassengerDashboard from './components/PassengerDashboard';
import DriverDashboard from './components/DriverDashboard';
import AdminDashboard from './components/AdminDashboard';
import { ROUTES, INITIAL_BUSES, INITIAL_REPORTS, MOCK_DRIVERS } from './data/routesData';
import { BusService, ReportService, WaitingService, ScheduleService } from './data/dataStore.js';
import { db } from "./firebase";

export default function App() {
  const [stage, setStage] = useState('splash'); // 'splash' | 'login' | 'app'
  const [role, setRole] = useState('student'); // 'student' | 'guest' | 'driver'
  const [auth, setAuth] = useState(null); // 'passenger' | 'driver' | 'admin'
  const [dark, setDark] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [buses, setBuses] = useState(() => BusService.getAll());
  const [reports, setReports] = useState(() => ReportService.getAll());
  const [driverScore, setDriverScore] = useState(92);
  const [waitingStops, setWaitingStops] = useState(() => WaitingService.getAll());
  const [userWaitingStop, setUserWaitingStop] = useState(null);
  const [arrivalNoticeToast, setArrivalNoticeToast] = useState('');

  const [userInfo, setUserInfo] = useState(null);
  const [isLiveActive, setIsLiveActive] = useState(true);
  const [liveSpeed, setLiveSpeed] = useState(1); // 1 = Normal 1s, 2 = Fast 0.5s
  const [lastUpdateSec, setLastUpdateSec] = useState(0);

  // Sync userWaitingStop whenever userInfo or waitingStops changes
  useEffect(() => {
    const uid = userInfo?.id || '68108596';
    const found = waitingStops.find((w) => w.userId === uid);
    setUserWaitingStop(found || null);
  }, [userInfo, waitingStops]);

  // Real-time Firestore Subscriptions for buses, reports, schedules, and waiting stops
  useEffect(() => {
    const unsubBuses = BusService.subscribeBuses((liveBuses) => {
      if (liveBuses && liveBuses.length > 0) {
        setBuses(liveBuses);
      }
    });

    const unsubReports = ReportService.subscribeReports((liveReports) => {
      if (liveReports) {
        setReports(liveReports);
      }
    });

    const unsubWaiting = WaitingService.subscribeWaitingStops((liveWaiting) => {
      if (liveWaiting) {
        setWaitingStops(liveWaiting);
      }
    });

    const unsubSchedules = ScheduleService.subscribeSchedules(() => {
      setBuses(BusService.getAll());
    });

    return () => {
      unsubBuses();
      unsubReports();
      unsubWaiting();
      unsubSchedules();
    };
  }, []);

  // 15-Minute Session Expiration Check (15 minutes = 900,000 ms)
  const SESSION_DURATION_MS = 15 * 60 * 1000;

  useEffect(() => {
    try {
      const savedSession = localStorage.getItem('wu_bus_session_v1');
      if (savedSession) {
        const { auth: savedAuth, role: savedRole, userInfo: savedInfo, timestamp } = JSON.parse(savedSession);
        const elapsed = Date.now() - (timestamp || 0);

        if (savedAuth && elapsed < SESSION_DURATION_MS) {
          // Session valid (< 15 mins) -> Auto login into app
          const parsed = JSON.parse(savedSession);
          setAuth(savedAuth);
          if (savedRole) setRole(savedRole);
          if (savedInfo) setUserInfo(savedInfo);
          if (parsed.driverScore != null) setDriverScore(parsed.driverScore);
          const timer = setTimeout(() => setStage('app'), 1200);
          return () => clearTimeout(timer);
        } else {
          // Session expired (>= 15 mins) -> Clear session & prompt login
          localStorage.removeItem('wu_bus_session_v1');
          setAuth(null);
          setUserInfo(null);
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

  // Active 15-Minute Auto-Logout Timer (Checks every 3 seconds while user is logged in)
  useEffect(() => {
    if (stage !== 'app' || !auth) return;

    const sessionCheckInterval = setInterval(() => {
      try {
        const savedSession = localStorage.getItem('wu_bus_session_v1');
        if (savedSession) {
          const { timestamp } = JSON.parse(savedSession);
          const elapsed = Date.now() - (timestamp || 0);
          if (elapsed >= SESSION_DURATION_MS) {
            handleLogout();
          }
        } else {
          handleLogout();
        }
      } catch (e) {
        handleLogout();
      }
    }, 3000);

    return () => clearInterval(sessionCheckInterval);
  }, [stage, auth]);

  // Theme Sync
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }, [dark]);

  // High-frequency Real-time GPS & Seat Sensor Telemetry Loop (3-second interval sync)
  useEffect(() => {
    if (stage !== 'app' || !isLiveActive) return;

    const intervalMs = liveSpeed === 2 ? 1500 : 3000;
    const interval = setInterval(() => {
      setLastUpdateSec((s) => (s + 3) % 60);

      const allSchedules = ScheduleService.getAll();
      setBuses((prevBuses) =>
        prevBuses.map((bus) => {
          const busSchedule = allSchedules.find((s) => s.busId === bus.id);

          if (bus.status === 'ซ่อมบำรุง') {
            return {
              ...bus,
              speed: 0,
              passengers: 0,
              seated: 0,
              standing: 0,
              status: 'ซ่อมบำรุง'
            };
          }

          if (busSchedule && busSchedule.status === 'ยังไม่ถึงเวลางาน') {
            return {
              ...bus,
              speed: 0,
              passengers: 0,
              seated: 0,
              standing: 0,
              status: 'ยังไม่ถึงเวลางาน',
              shiftName: busSchedule.shiftName
            };
          }

          if (busSchedule && busSchedule.status === 'เสร็จสิ้นงาน') {
            return {
              ...bus,
              speed: 0,
              passengers: 0,
              seated: 0,
              standing: 0,
              status: 'เสร็จสิ้นรอบวิ่ง',
              shiftName: busSchedule.shiftName
            };
          }

          const route = ROUTES.find((r) => r.id === bus.route);
          if (!route || !route.polyline || route.polyline.length === 0) return bus;

          const nextIndex = (bus.progressIndex + 1) % route.polyline.length;

          let dwellTicks = bus.dwellTicks || 0;
          if (nextIndex === 0 && dwellTicks === 0) {
            dwellTicks = 3;
          } else if (dwellTicks > 0) {
            dwellTicks -= 1;
          }

          let newSeats = [...(bus.seats || Array(20).fill('free'))].slice(0, 20);
          if (Math.random() < 0.55) {
            const randVal = Math.random();
            const targetSeat = Math.floor(Math.random() * 20);
            const currentSeat = newSeats[targetSeat];

            if (currentSeat === 'free') {
              newSeats[targetSeat] = 'occupied';
            } else {
              if (randVal < 0.45) newSeats[targetSeat] = 'free';
            }
          }

          const seatedCount = newSeats.filter((s) => s === 'occupied').length;
          const totalPassengers = seatedCount;
          const busStatus = totalPassengers >= 20 ? 'ที่นั่งเต็ม' : 'กำลังให้บริการ';

          return {
            ...bus,
            progressIndex: dwellTicks > 0 ? bus.progressIndex : nextIndex,
            dwellTicks,
            speed: dwellTicks > 0 ? 0 : Math.floor(22 + Math.random() * 14),
            passengers: totalPassengers,
            seated: seatedCount,
            standing: 0,
            status: busStatus,
            shiftName: busSchedule?.shiftName || bus.shiftName,
            seats: newSeats
          };
        })
      );
    }, intervalMs);

    return () => clearInterval(interval);
  }, [stage, isLiveActive, liveSpeed]);

  const handleReportSubmit = async (newReport) => {
    await ReportService.add(newReport);
    setReports(ReportService.getAll());
    if (newReport.scoreImpact) {
      setDriverScore((prev) => {
        const next = Math.max(40, prev + newReport.scoreImpact);
        // Persist updated score to session
        try {
          const saved = JSON.parse(localStorage.getItem('wu_bus_session_v1') || '{}');
          saved.driverScore = next;
          localStorage.setItem('wu_bus_session_v1', JSON.stringify(saved));
        } catch (e) {}
        return next;
      });
    }
  };

  const handleUpdateReport = async (reportId, updates) => {
    await ReportService.update(reportId, updates);
    setReports(ReportService.getAll());
  };

  const handleDeleteReport = async (reportId) => {
    await ReportService.delete(reportId);
    setReports(ReportService.getAll());
  };

  const handleDriverResolveReport = async (reportId, driverResponse) => {
    await ReportService.driverResolve(reportId, driverResponse);
    setReports(ReportService.getAll());
  };

  const handleLogout = () => {
    setAuth(null);
    setUserInfo(null);
    setActiveTab('home');
    setStage('login');
    localStorage.removeItem('wu_bus_session_v1');
  };

  const handleLoginSuccess = (authedRole, info) => {
    const details = info || {
      userId: authedRole === 'admin' ? 'ADMIN-01' : authedRole === 'driver' ? 'DRIVER-600' : 'USER-101',
      roleLabel: authedRole === 'admin' ? 'ผู้ดูแลระบบ (Fleet Admin)' : authedRole === 'driver' ? 'คนขับรถ' : 'นักศึกษา',
      role: role,
      loginTime: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.',
      loginDate: new Date().toLocaleDateString('th-TH')
    };

    // Set driver score from MOCK_DRIVERS data based on logged-in userId
    let initialScore = 92;
    if (authedRole === 'driver' && details.userId) {
      const driverData = MOCK_DRIVERS.find((d) => d.id === details.userId);
      if (driverData?.score != null) initialScore = driverData.score;
    }
    setDriverScore(initialScore);

    setAuth(authedRole);
    setUserInfo(details);
    setActiveTab('home');
    setStage('app');
    localStorage.setItem(
      'wu_bus_session_v1',
      JSON.stringify({
        auth: authedRole,
        role: role,
        userInfo: details,
        driverScore: initialScore,
        timestamp: Date.now()
      })
    );
  };

  const handleSwitchToAdmin = () => {
    handleLoginSuccess('admin', {
      userId: 'admin',
      userName: 'ผู้ดูแลระบบกลาง มวล. (Super Admin)',
      userDept: 'ศูนย์เทคโนโลยีดิจิทัล (DTC)',
      userStatus: 'ผู้ดูแลระบบหลัก',
      roleLabel: 'ผู้ดูแลระบบ (Admin)',
      role: 'admin',
      loginTime: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.',
      loginDate: new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })
    });
  };

  const handlePinStop = async ({ stopId, stopName, routeId, busId }) => {
    const userId = userInfo?.id || '68108596';
    const res = await WaitingService.pinStop({ stopId, stopName, routeId, busId, userId });
    setWaitingStops(res.list);
    setUserWaitingStop(res.data);
    return res;
  };

  const handleUnpinStop = async () => {
    const userId = userInfo?.id || '68108596';
    const res = await WaitingService.unpinStop(userId);
    setWaitingStops(res.list);
    setUserWaitingStop(null);
    return res;
  };

  // Auto-complete waiting when pinned bus arrives at the stop
  useEffect(() => {
    if (!userWaitingStop || !buses || buses.length === 0) return;

    let targetBus = null;
    if (userWaitingStop.busId) {
      targetBus = buses.find((b) => b.id === userWaitingStop.busId);
    } else if (userWaitingStop.routeId) {
      targetBus = buses.find((b) => b.route === userWaitingStop.routeId);
    }

    if (!targetBus) return;

    const route = ROUTES.find((r) => r.id === targetBus.route);
    if (!route || !route.polyline || route.polyline.length === 0) return;

    const stop = (route.stops || []).find(
      (s) => s.id === userWaitingStop.stopId || s.name === userWaitingStop.stopName
    );
    if (!stop) return;

    let minStopDist = Infinity;
    let stopPolylineIdx = 0;
    route.polyline.forEach((p, idx) => {
      const dist = Math.hypot(p.lat - stop.lat, p.lng - stop.lng);
      if (dist < minStopDist) {
        minStopDist = dist;
        stopPolylineIdx = idx;
      }
    });

    const busIdx = targetBus.progressIndex || 0;
    const polyLen = route.polyline.length;
    const steps = (stopPolylineIdx - busIdx + polyLen) % polyLen;

    if (steps === 0 || (steps === 1 && targetBus.speed === 0)) {
      const arrivedBusId = targetBus.id;
      const arrivedRouteId = targetBus.route;
      const stopTitle = userWaitingStop.stopName;

      handleUnpinStop();

      setArrivalNoticeToast(
        `รถบัส ${arrivedBusId} (สาย ${arrivedRouteId}) มาถึงจุดจอด "${stopTitle}" เรียบร้อยแล้ว สิ้นสุดการรออัตโนมัติ ขอให้เดินทางโดยสวัสดิภาพ`
      );
      setTimeout(() => {
        setArrivalNoticeToast('');
      }, 7000);
    }
  }, [buses, userWaitingStop]);

  const handleDriverAcknowledgeStop = async (stopId, busId = null) => {
    const res = await WaitingService.clearStop(stopId, busId);
    setWaitingStops(res.list);
    return res;
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
        userInfo={userInfo}
        waitingStops={waitingStops}
        onDriverAcknowledgeStop={handleDriverAcknowledgeStop}
        onDriverResolve={handleDriverResolveReport}
        onSwitchToAdmin={handleSwitchToAdmin}
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
        userInfo={userInfo}
      />
    );
  }

  return (
    <>
      <PassengerDashboard
        dark={dark}
        setDark={setDark}
        logout={handleLogout}
        active={activeTab}
        setActive={setActiveTab}
        buses={buses}
        setBuses={setBuses}
        reports={reports}
        isLiveActive={isLiveActive}
        setIsLiveActive={setIsLiveActive}
        liveSpeed={liveSpeed}
        setLiveSpeed={setLiveSpeed}
        onReportSubmit={handleReportSubmit}
        onUpdateReport={handleUpdateReport}
        onDeleteReport={handleDeleteReport}
        userInfo={userInfo}
        waitingStops={waitingStops}
        userWaitingStop={userWaitingStop}
        onPinStop={handlePinStop}
        onUnpinStop={handleUnpinStop}
        onSwitchToAdmin={handleSwitchToAdmin}
      />
      {arrivalNoticeToast && (
        <div className="arrivalNoticeToast">
          <div className="arrivalNoticeIcon">
            <CheckCircle2 size={24} />
          </div>
          <div className="arrivalNoticeContent">
            <strong>รถมันม่วงมาถึงจุดจอดแล้ว!</strong>
            <p>{arrivalNoticeToast}</p>
          </div>
          <button
            type="button"
            className="arrivalNoticeClose"
            onClick={() => setArrivalNoticeToast('')}
            aria-label="ปิดการแจ้งเตือน"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </>
  );
}
