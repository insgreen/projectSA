import React, { useState, useEffect, useRef } from 'react';
import {
  Gauge, Star, Users, CheckCircle2, CircleAlert, User, BellRing, X, MapPin,
  Play, Square, Radio, Navigation, ShieldCheck, UserCheck, CalendarClock, Clock, CheckSquare
} from 'lucide-react';
import Shell from './Shell';
import ProfilePage from './ProfilePage';
import BackButton from './BackButton';
import BusCabinSeatMap from './BusCabinSeatMap';
import NotificationsPage from './NotificationsPage';
import { driverNav, ROUTES } from '../data/routesData';
import { ScheduleService, BusService } from '../data/dataStore.js';

export default function DriverDashboard({
  dark,
  setDark,
  logout,
  reports = [],
  score,
  buses,
  setBuses,
  userInfo,
  waitingStops = [],
  onDriverAcknowledgeStop,
  onDriverResolve,
  onSwitchToAdmin
}) {
  const [active, setActive] = useState('driver-home');
  const [historyStack, setHistoryStack] = useState(['driver-home']);
  const [newReportToast, setNewReportToast] = useState(null);
  const [isDriving, setIsDriving] = useState(true);
  const [isGpsBroadcasting, setIsGpsBroadcasting] = useState(true);
  const [tripToast, setTripToast] = useState('');
  const [driverResolvingReport, setDriverResolvingReport] = useState(null);
  const [driverResponseText, setDriverResponseText] = useState('');
  const [driverSchedules, setDriverSchedules] = useState([]);
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [driverInspectionChecklist, setDriverInspectionChecklist] = useState({
    tires: true, brakes: true, lights: true, gps: true, seatSensors: true, doors: true
  });
  const prevReportCountRef = useRef(null);

  const handleOpenDriverResolve = (rep) => {
    setDriverResolvingReport(rep);
    setDriverResponseText('');
  };

  const handleSaveDriverResolve = async (e) => {
    e.preventDefault();
    if (!driverResolvingReport || !driverResponseText.trim()) return;

    await onDriverResolve?.(driverResolvingReport.id, driverResponseText.trim());
    setTripToast(`บันทึกผลการแก้ไขเรื่อง #${driverResolvingReport.id} และส่งสถานะกลับไปยังผู้ใช้เรียบร้อยแล้ว`);
    setDriverResolvingReport(null);
    setDriverResponseText('');
    setTimeout(() => setTripToast(''), 4000);
  };

  const handleNavigate = (newTab) => {
    if (newTab === active) return;
    setHistoryStack((prev) => [...prev, newTab]);
    setActive(newTab);
  };

  const handleGoBack = () => {
    if (historyStack.length > 1) {
      const updated = [...historyStack];
      updated.pop();
      const prevPage = updated[updated.length - 1];
      setHistoryStack(updated);
      setActive(prevPage);
    } else {
      setActive('driver-home');
    }
  };

  // Dynamically resolve driver's assigned bus and route from userInfo
  const driverBusId = userInfo?.busId || (userInfo?.userDept?.includes('WU-') ? `WU-${userInfo.userDept.split('WU-')[1].trim()}` : 'WU-101');
  const myBus = buses.find((b) => b.id === driverBusId) || buses[0];
  const myRoute = userInfo?.route || myBus.route || 1;
  const driverName = userInfo?.userName || 'สมชาย ดีเยี่ยม';

  // Route & Stops telemetry
  const routeData = ROUTES.find((r) => r.id === myRoute) || ROUTES[0];
  const stopsWithWaiting = (routeData?.stops || []).map((stop, idx) => {
    const baseCount = (idx % 3 === 0) ? 9 : (idx % 2 === 0) ? 5 : 3;
    const pinnedList = (waitingStops || []).filter(
      (w) => (w.stopId === stop.id || w.stopName === stop.name) && (!w.routeId || Number(w.routeId) === Number(myRoute))
    );
    const pinnedMyBusSpecific = pinnedList.filter((w) => w.busId === myBus.id).length;
    const pinnedGeneral = pinnedList.filter((w) => !w.busId).length;
    const myBusPinnedCount = pinnedMyBusSpecific + pinnedGeneral;
    const pinnedOtherList = pinnedList.filter((w) => w.busId && w.busId !== myBus.id);
    const pinnedOtherCount = pinnedOtherList.length;
    const otherBusIds = [...new Set(pinnedOtherList.map((w) => w.busId))];

    return {
      ...stop,
      pinnedCount: myBusPinnedCount,
      pinnedMyBusSpecific,
      pinnedGeneral,
      pinnedOtherCount,
      otherBusIds,
      waitingCount: baseCount + myBusPinnedCount
    };
  });

  // Calculate spatial distance from bus position on polyline to actual route stops
  const getNextStopIndex = () => {
    if (!routeData || !routeData.polyline || !routeData.stops || routeData.stops.length === 0) return 0;
    const busPos = routeData.polyline[myBus?.progressIndex || 0] || routeData.polyline[0];
    if (!busPos) return 0;

    let minDistance = Infinity;
    let closestStopIdx = 0;

    routeData.stops.forEach((stop, idx) => {
      const dist = Math.hypot(stop.lat - busPos.lat, stop.lng - busPos.lng);
      if (dist < minDistance) {
        minDistance = dist;
        closestStopIdx = idx;
      }
    });

    return closestStopIdx;
  };

  const totalWaitingPassengers = stopsWithWaiting.reduce((sum, s) => sum + s.waitingCount, 0);
  const nextStopIndex = getNextStopIndex();
  const nextStop = stopsWithWaiting[nextStopIndex] || stopsWithWaiting[0];

  // Filter reports for this bus or driver (only show those accepted/processed by admin)
  const myReports = reports.filter((r) =>
    ((r.driverId && (String(r.driverId) === String(userInfo?.userId) || String(r.driverId) === String(userInfo?.id))) ||
    (r.driverName && r.driverName === driverName) ||
    (r.busId && (r.busId === myBus.id || r.busId === driverBusId))) &&
    r.status && r.status !== 'รอตรวจสอบ'
  );

  // Dynamic Score Calculation: 100 minus sum of report deductions for this driver/bus
  const totalDeduction = myReports.reduce((acc, r) => acc + Math.abs(r.scoreImpact || 3), 0);
  const currentScore = Math.max(0, 100 - totalDeduction);

  const effectiveUserInfo = {
    ...userInfo,
    userName: driverName,
    userDept: 'กำลังให้บริการ',
    userStatus: userInfo?.userStatus || 'กำลังให้บริการ'
  };

  // Watch for new reports and trigger toast notification
  useEffect(() => {
    if (prevReportCountRef.current === null) {
      prevReportCountRef.current = myReports.length;
      return;
    }
    if (myReports.length > prevReportCountRef.current) {
      const latest = myReports[0];
      setNewReportToast(latest);
      const timer = setTimeout(() => setNewReportToast(null), 6000);
      prevReportCountRef.current = myReports.length;
      return () => clearTimeout(timer);
    }
    prevReportCountRef.current = myReports.length;
  }, [myReports.length]);

  // Load and subscribe to driver schedules
  useEffect(() => {
    const list = ScheduleService.getAll();
    const myId = String(userInfo?.userId || userInfo?.id || '600101');
    const filtered = list.filter((s) => String(s.driverId) === myId || s.driverName === driverName || s.busId === myBus?.id);
    setDriverSchedules(filtered.length > 0 ? filtered : list.filter((s) => s.busId === myBus?.id));

    const unsub = ScheduleService.subscribeSchedules((all) => {
      const match = all.filter((s) => String(s.driverId) === myId || s.driverName === driverName || s.busId === myBus?.id);
      setDriverSchedules(match.length > 0 ? match : all.filter((s) => s.busId === myBus?.id));
    });
    return () => unsub();
  }, [userInfo?.userId, userInfo?.id, driverName, myBus?.id]);

  const currentDriverId = String(userInfo?.userId || userInfo?.id || '600101');
  const driverSchedule = driverSchedules.find((s) => String(s.driverId) === currentDriverId || s.driverName === driverName)
    || ScheduleService.getAll().find((s) => String(s.driverId) === currentDriverId || s.driverName === driverName)
    || driverSchedules[0];
  const assignedBusId = driverSchedule?.busId || myBus?.id || 'WU-101';

  const handleSaveDriverInspection = async (e) => {
    e.preventDefault();
    await BusService.checkReadiness(myBus.id, {
      inspector: driverName,
      checklist: driverInspectionChecklist
    });
    setBuses?.(BusService.getAll());
    setIsInspectionModalOpen(false);
    setTripToast(`ตรวจสอบความพร้อมรถ ${myBus.id} เรียบร้อยแล้ว (ผ่านการประเมิน 100%) พร้อมเริ่มการเดินรถ`);
    setTimeout(() => setTripToast(''), 4000);
  };

  const categoryColor = (cat) => {
    if (!cat) return 'var(--danger)';
    if (cat.includes('เร็ว') || cat.includes('อันตราย')) return '#ef4444';
    if (cat.includes('จอด') || cat.includes('รับ')) return '#f59e0b';
    if (cat.includes('มารยาท') || cat.includes('พฤติกรรม')) return '#8b5cf6';
    return '#ef4444';
  };

  return (
    <Shell
      dark={dark}
      setDark={setDark}
      logout={logout}
      active={active}
      setActive={handleNavigate}
      userInfo={effectiveUserInfo}
      onSwitchToAdmin={onSwitchToAdmin}
      navItems={driverNav}
      title="Driver Console"
      subtitle="ระบบรายงานสถานะสำหรับคนขับรถมันม่วง"
      onProfileClick={() => handleNavigate('profile')}
      driverReports={myReports}
    >
      {/* Toast Notification */}
      {newReportToast && (
        <div style={{
          position: 'fixed', top: '90px', right: '20px', zIndex: 9999,
          background: '#1c1024', border: '1.5px solid #ef4444',
          borderRadius: '20px', padding: '16px 20px', maxWidth: '320px',
          boxShadow: '0 16px 48px rgba(239,68,68,0.25)',
          animation: 'fadeIn 0.3s ease',
          display: 'flex', alignItems: 'flex-start', gap: '12px'
        }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(239,68,68,0.15)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <BellRing size={18} color="#ef4444" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#ef4444', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ข้อร้องเรียนใหม่</div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff', marginBottom: '2px' }}>{newReportToast.category}</div>
            <div style={{ fontSize: '12px', color: '#c4b5d4', fontWeight: 500 }}>{newReportToast.busId ? `ป้ายทะเบียนรถ: ${newReportToast.busId}` : (newReportToast.details || '')}</div>
            <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>{newReportToast.incidentDate ? `${newReportToast.incidentDate} ` : ''}{newReportToast.incidentTime || newReportToast.timestamp}</div>
          </div>
          <button onClick={() => setNewReportToast(null)} style={{ background: 'transparent', border: 0, color: '#9ca3af', cursor: 'pointer', padding: '2px' }}>
            <X size={16} />
          </button>
        </div>
      )}

      <div className="contentPage">
        {active === 'driver-home' && (
          <div className="driverWorkspace">
            {/* Banner */}
            <div className="driverBannerCard">
              <div className="dAvatarBig">
                <User size={32} />
              </div>
              <div>

                <h2>ยินดีต้อนรับ {driverName}</h2>
                <p>คะแนนการปฏิบัติงานสะสม: {currentScore} คะแนน</p>
              </div>
            </div>

            {/* TRIP OPERATIONS & GPS BROADCASTING CONTROLS (ตาม Activity Diagram: เริ่มการเดินรถ & ส่งข้อมูลตำแหน่งรถ) */}
            <div style={{
              background: 'var(--card)',
              borderRadius: '24px',
              border: '1.5px solid var(--border)',
              padding: '20px 24px',
              marginBottom: '24px',
              boxShadow: 'var(--shadow)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '10px', height: '10px', borderRadius: '50%',
                    background: isDriving ? 'var(--success)' : '#f59e0b',
                    boxShadow: isDriving ? '0 0 10px rgba(16, 185, 129, 0.6)' : 'none'
                  }} />
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>
                    {isDriving ? 'อยู่ในช่วงเวลางาน' : 'หยุดพักชั่วคราว '}
                  </h3>
                </div>
                <div style={{ margin: '4px 0 0 18px', fontSize: '13px', color: 'var(--muted)', fontWeight: 600 }}>
                  ขับรถป้ายทะเบียน: <strong style={{ color: 'var(--text)', fontWeight: 800 }}>{assignedBusId}</strong>{driverSchedule?.route ? ` (สาย ${driverSchedule.route})` : ''}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setIsInspectionModalOpen(true)}
                  className="secondaryBtn"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '10px 18px', fontSize: '14px', borderRadius: '14px',
                    borderColor: 'var(--wu-purple-light)', color: 'var(--wu-purple-light)',
                    fontWeight: 700
                  }}
                  title="ตรวจสอบความพร้อมของรถก่อนให้บริการ"
                >
                  <CheckSquare size={16} />
                  <span>ตรวจความพร้อมรถ</span>
                </button>
              </div>
            </div>

            {tripToast && (
              <div style={{
                background: 'var(--success-bg)', border: '1.5px solid var(--success)',
                color: 'var(--success)', borderRadius: '16px', padding: '12px 18px',
                marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px',
                fontWeight: 700, fontSize: '14px', animation: 'fadeIn 0.3s ease'
              }}>
                <CheckCircle2 size={18} />
                <span>{tripToast}</span>
              </div>
            )}

            {/* Next Station Live Alert Banner */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.14), rgba(16, 185, 129, 0.08))',
              border: '1.5px solid rgba(34, 197, 94, 0.4)',
              borderRadius: '24px',
              padding: '20px 24px',
              marginBottom: '24px',
              boxShadow: '0 8px 24px rgba(34, 197, 94, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '16px',
                  background: 'var(--success)', color: '#ffffff',
                  display: 'grid', placeItems: 'center', flexShrink: 0,
                  boxShadow: '0 6px 18px rgba(34, 197, 94, 0.35)'
                }}>
                  <MapPin size={26} />
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '3px' }}>
                     สถานีถัดไป
                  </div>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: 'var(--text)' }}>
                    {nextStop?.name || 'อาคารกิจกรรม'}
                  </h3>
                  {nextStop?.pinnedCount > 0 ? (
                    <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{
                        background: 'rgba(92, 6, 140, 0.15)',
                        color: 'var(--wu-purple-light)',
                        border: '1.5px solid var(--wu-purple-light)',
                        borderRadius: '99px',
                        padding: '3px 10px',
                        fontSize: '11px',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <UserCheck size={12} /> {nextStop.pinnedMyBusSpecific > 0 ? `มีผู้โดยสารระบุรอขึ้นรถคันนี้ (${myBus.id}) ${nextStop.pinnedMyBusSpecific} คน!` : `มีผู้โดยสารปักหมุดรอ ${nextStop.pinnedCount} คน!`}
                      </span>
                      {nextStop.pinnedOtherCount > 0 && (
                        <span style={{
                          background: 'rgba(234, 179, 8, 0.15)',
                          color: '#b45309',
                          border: '1px solid rgba(234, 179, 8, 0.4)',
                          borderRadius: '99px',
                          padding: '3px 10px',
                          fontSize: '11px',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          ผู้โดยสารระบุรอคันอื่น ({nextStop.otherBusIds?.join(', ')}) {nextStop.pinnedOtherCount} คน
                        </span>
                      )}
                      {onDriverAcknowledgeStop && (
                        <button
                          type="button"
                          onClick={() => {
                            onDriverAcknowledgeStop(nextStop.id, myBus.id);
                            setTripToast(`รับผู้โดยสารที่สถานี "${nextStop.name}" เรียบร้อยแล้ว`);
                            setTimeout(() => setTripToast(''), 3000);
                          }}
                          style={{
                            background: 'var(--success)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '4px 10px',
                            fontSize: '11px',
                            fontWeight: 800,
                            cursor: 'pointer'
                          }}
                        >
                          รับแล้ว / เคลียร์
                        </button>
                      )}
                    </div>
                  ) : nextStop?.pinnedOtherCount > 0 ? (
                    <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{
                        background: 'rgba(234, 179, 8, 0.15)',
                        color: '#b45309',
                        border: '1px solid rgba(234, 179, 8, 0.4)',
                        borderRadius: '99px',
                        padding: '3px 10px',
                        fontSize: '11px',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        ผู้โดยสารระบุรอคันอื่น ({nextStop.otherBusIds?.join(', ')}) {nextStop.pinnedOtherCount} คน
                      </span>
                    </div>
                  ) : (
                    <p style={{ margin: '3px 0 0', fontSize: '13px', color: 'var(--muted)', fontWeight: 600 }}>
                    </p>
                  )}
                </div>
              </div>

              
            </div>

            {/* Stats */}
            <div className="driverStatsGrid">
              <div className="dStatCard">
                <Gauge size={28} />
                <div>
                  <b>{myBus.speed} km/h</b>
                  <small>ความเร็วปัจจุบัน</small>
                </div>
              </div>
              <div className="dStatCard">
                <Users size={28} />
                <div>
                  <b>{Math.min(20, myBus.passengers || 0)}/20 ที่นั่ง</b>
                  <small>ผู้โดยสารบนรถ</small>
                </div>
              </div>
              <div className="dStatCard scoreCard" style={{
                borderColor: totalDeduction > 0 ? '#fca5a5' : undefined,
                background: totalDeduction > 0 ? 'rgba(239, 68, 68, 0.05)' : undefined
              }}>
                <Star size={28} color={totalDeduction > 0 ? '#ef4444' : undefined} />
                <div>
                  <b style={{ color: totalDeduction > 0 ? '#ef4444' : undefined }}>{currentScore} / 100</b>
                  <small>{totalDeduction > 0 ? `หักลบ -${totalDeduction} คะแนน` : 'คะแนนสะสม'}</small>
                </div>
              </div>

              <div className="dStatCard">
                <MapPin size={28} color="var(--success)" />
                <div>
                  <b style={{ color: 'var(--success)' }}>{nextStop?.waitingCount || 5} คน</b>
                  <small>รอ ณ สถานีถัดไป</small>
                </div>
              </div>
            </div>

            {/* 2-Column Responsive Layout: Left: Seat Map Card | Right: Operational & Complaint Cards */}
            <div className="driverHomeGrid">
              {/* Left Column: Seat Map Card */}
              <div className="driverSeatCard">
                <div className="sectionHeadRow" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <h3 className="sectionHeading" style={{ margin: 0, fontSize: '16px' }}>ผังที่นั่ง ({myBus.id})</h3>
                    <small style={{ color: 'var(--muted)', fontSize: '11.5px', fontWeight: 600 }}>ความจุ 20 ที่นั่ง</small>
                  </div>
                  <div className="seatLegend" style={{ margin: 0 }}>
                    <span><i className="legendDot free" /> ว่าง</span>
                    <span><i className="legendDot occupied" /> ไม่ว่าง</span>
                  </div>
                </div>

                <div className="seatCabinInner">
                  <BusCabinSeatMap seats={myBus.seats || Array(20).fill('free')} />
                </div>

                <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 700 }}>
                    <span style={{ color: 'var(--muted)' }}>ที่นั่งว่าง:</span>
                    <span style={{ color: 'var(--success)' }}>{Math.max(0, 20 - (myBus.passengers || 0))} ที่นั่ง</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 700 }}>
                    <span style={{ color: 'var(--muted)' }}>จำนวนผู้โดยสารบนรถ:</span>
                    <span style={{ color: 'var(--wu-purple-light)' }}>{Math.min(20, myBus.passengers || 0)} ที่นั่ง</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Shift & Complaints Cards */}
              <div className="driverSideCol">
                {/* Current Shift & Schedule Card */}
                <div className="driverSectionCard">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(147, 51, 234, 0.12)', display: 'grid', placeItems: 'center' }}>
                        <CalendarClock size={20} color="var(--wu-purple-light)" />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>ข้อมูลปฏิบัติงานและเส้นทาง</h3>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActive('driver-schedule');
                        setHistoryStack((prev) => [...prev, 'driver-schedule']);
                      }}
                      style={{
                        background: 'var(--wu-purple-subtle)',
                        color: 'var(--wu-purple-light)',
                        border: '1px solid rgba(147, 51, 234, 0.2)',
                        borderRadius: '10px',
                        padding: '6px 14px',
                        fontSize: '12px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      ดูตารางงานทั้งหมด
                    </button>
                  </div>

                  <div className="driverShiftGrid">
                    <div className="driverShiftMiniCard" title={`รถประจำการ: ${assignedBusId} (สาย ${myBus?.route || 1})`}>
                      <small>รถประจำการ</small>
                      <b>{assignedBusId} (สาย {myBus?.route || 1})</b>
                    </div>
                    <div className="driverShiftMiniCard" title={`ช่วงเวลาปฏิบัติงาน: ${driverSchedule?.startTime || '07:00'} - ${driverSchedule?.endTime || '12:00'} น.`}>
                      <small>ช่วงเวลาปฏิบัติงาน</small>
                      <b style={{ color: 'var(--wu-purple-light)' }}>{driverSchedule?.startTime || '07:00'} - {driverSchedule?.endTime || '12:00'} น.</b>
                    </div>
                    <div className="driverShiftMiniCard" title={`กะปฏิบัติงาน: ${driverSchedule?.shiftName || 'กะเช้า (Morning Rush)'}`}>
                      <small>กะปฏิบัติงาน</small>
                      <b>{driverSchedule?.shiftName || 'กะเช้า (Morning Rush)'}</b>
                    </div>
                  </div>


                  <div style={{ marginTop: '12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '14px', padding: '12px 14px' }}>
                    <small style={{ color: 'var(--muted)', fontSize: '11.5px', fontWeight: 700, display: 'block', marginBottom: '2px' }}>เส้นทาง / บันทึกเพิ่มเติม</small>
                    <span style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 600 }}>{driverSchedule?.notes || 'วิ่งวนรอบหอพัก - อาคารเรียนรวม 3 - อาคารไทยบุรี'}</span>
                  </div>
                </div>

                {/* Recent Complaints Section */}
                <div className="driverSectionCard">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', display: 'grid', placeItems: 'center' }}>
                        <CircleAlert size={20} color="#ef4444" />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>ข้อร้องเรียนที่ได้รับ</h3>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)', fontWeight: 500 }}>จากผู้โดยสาร • รถ {myBus.id}</p>
                      </div>
                    </div>
                    {myReports.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '99px', padding: '4px 12px', fontSize: '12px', fontWeight: 800 }}>
                          {myReports.length} รายการ
                        </span>
                        <span style={{ background: '#fef2f2', color: '#ef4444', border: '1.5px solid #fca5a5', borderRadius: '99px', padding: '4px 14px', fontSize: '12px', fontWeight: 900, boxShadow: '0 2px 8px rgba(239,68,68,0.12)' }}>
                          คะแนนคงเหลือ: {currentScore} / 100 
                        </span>
                      </div>
                    )}
                  </div>

                  {myReports.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {myReports.map((rep, i) => (
                        <div key={rep.id} style={{
                          background: 'var(--card)', border: `1.5px solid ${i === 0 ? '#fca5a5' : 'var(--border)'}`,
                          borderRadius: '18px', padding: '16px 20px',
                          boxShadow: i === 0 ? '0 4px 20px rgba(239,68,68,0.08)' : '0 2px 8px rgba(0,0,0,0.03)',
                          display: 'flex', gap: '14px', alignItems: 'flex-start',
                          transition: 'all 0.2s ease',
                          animation: i === 0 ? 'fadeIn 0.4s ease' : 'none'
                        }}>
                          <div style={{
                            width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
                            background: `${categoryColor(rep.category)}18`,
                            display: 'grid', placeItems: 'center'
                          }}>
                            <CircleAlert size={20} color={categoryColor(rep.category)} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                              <span style={{
                                background: `${categoryColor(rep.category)}18`,
                                color: categoryColor(rep.category),
                                fontSize: '11px', fontWeight: 800,
                                padding: '3px 10px', borderRadius: '99px'
                              }}>{rep.category}</span>
                              <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>{rep.timestamp}</span>
                              {i === 0 && (
                                <span style={{ background: '#fef2f2', color: '#ef4444', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '99px', border: '1px solid #fecaca' }}>ใหม่</span>
                              )}
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>
                              {rep.location}
                            </div>
                            <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)', lineHeight: 1.5 }}>{rep.details}</p>
                            
                            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fef2f2', color: '#ef4444', padding: '3px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 800 }}>
                                หัก {Math.abs(rep.scoreImpact)} คะแนน
                              </span>
                              <span style={{
                                padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 800,
                                background: rep.status === 'แก้ไขเรียบร้อย' ? 'var(--success-bg)' : 'var(--warning-bg)',
                                color: rep.status === 'แก้ไขเรียบร้อย' ? 'var(--success)' : 'var(--warning)'
                              }}>
                                สถานะ: {rep.status || 'รอตรวจสอบ'}
                              </span>
                            </div>

                            {rep.adminNote && (
                              <div style={{
                                marginTop: '8px', padding: '8px 12px', borderRadius: '10px',
                                background: 'var(--bg)', border: '1px solid var(--border)', fontSize: '12px'
                              }}>
                                <strong style={{ color: 'var(--wu-purple-light)' }}>ข้อความจากผู้ดูแลระบบ (Admin): </strong>
                                <span style={{ color: 'var(--text)' }}>{rep.adminNote}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '28px 16px' }}>
                      <CheckCircle2 size={40} color="var(--success)" style={{ margin: '0 auto 12px', display: 'block' }} />
                      <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 800 }}>ไม่มีข้อร้องเรียน</h4>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {active === 'driver-schedule' && (
          <div className="driverWorkspace">
            <BackButton onClick={handleGoBack} label="ย้อนกลับ" />
            <div className="pageIntro" style={{ marginBottom: '20px', marginTop: '4px' }}>
              <h2>ตารางการขับรถของฉัน (My Shift Schedule)</h2>
              <p style={{ marginTop: '4px', color: 'var(--muted)', fontSize: '14px', lineHeight: 1.5 }}>รอบเวลาและภารกิจการเดินรถที่ได้รับมอบหมาย ประจำรถ {myBus.id} สาย {myRoute}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {driverSchedules.length > 0 ? (
                driverSchedules.map((sch) => (
                  <div
                    key={sch.id}
                    style={{
                      background: 'var(--card)',
                      border: '1.5px solid var(--border)',
                      borderRadius: '20px',
                      padding: '20px',
                      boxShadow: 'var(--shadow)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                      <div>
                        <span style={{
                          display: 'inline-block',
                          fontSize: '11px',
                          fontWeight: 800,
                          background: 'rgba(92, 6, 140, 0.1)',
                          color: 'var(--wu-purple-light)',
                          padding: '3px 10px',
                          borderRadius: '99px',
                          marginBottom: '6px'
                        }}>
                          {sch.id}
                        </span>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>{sch.shiftName}</h3>
                      </div>
                      <span className={`tag ${sch.status === 'กำลังปฏิบัติหน้าที่' ? 'ok' : 'info'}`}>
                        {sch.status}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', background: 'var(--bg)', padding: '14px', borderRadius: '14px', border: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>ช่วงเวลาปฏิบัติหน้าที่</div>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)', marginTop: '2px' }}>
                          <Clock size={16} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px', color: 'var(--wu-purple-light)' }} />
                          {sch.startTime} - {sch.endTime} น.
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>สายรถ & รถประจำการ</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginTop: '2px' }}>
                          สาย {sch.route} (รถ {sch.busId})
                        </div>
                      </div>
                    </div>

                    {sch.notes && (
                      <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--muted)' }}>
                        <strong style={{ color: 'var(--text)' }}>หมายเหตุ / เส้นทางเฉพาะ:</strong> {sch.notes}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: '20px', padding: '32px', textAlign: 'center' }}>
                  <CalendarClock size={40} color="var(--wu-purple-light)" style={{ margin: '0 auto 12px', display: 'block' }} />
                  <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 800 }}>ไม่พบตารางการเดินรถที่มอบหมาย</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)' }}>โปรดติดต่อผู้ดูแลระบบศูนย์ควบคุมยานพาหนะ</p>
                </div>
              )}
            </div>
          </div>
        )}

        {active === 'driver-stops' && (() => {
          return (
            <div className="driverWorkspace">
              <BackButton onClick={handleGoBack} label="ย้อนกลับ" />
              <div className="pageIntro" style={{ marginBottom: '20px', marginTop: '4px' }}>
                <h2>ตารางจุดจอด {routeData.name}</h2>
                <p style={{ marginTop: '4px', color: 'var(--muted)', fontSize: '14px', lineHeight: 1.5 }}>แสดงจุดจอดตามลำดับ</p>
              </div>
              <div className="stopsTimeline">
                {stopsWithWaiting.map((stop, idx) => {
                  const isCurrentNextStop = idx === nextStopIndex;
                  return (
                    <div
                      key={stop.id}
                      className="timelineItem"
                      style={{
                        borderColor: isCurrentNextStop ? 'var(--success)' : 'var(--border)',
                        background: isCurrentNextStop ? 'var(--success-bg)' : 'var(--card)'
                      }}
                    >
                      <div
                        className="timelineDot"
                        style={{
                          background: isCurrentNextStop ? 'var(--success)' : idx === 0 ? routeData.color : 'var(--wu-purple-light)',
                          boxShadow: isCurrentNextStop ? '0 0 0 3px rgba(34, 197, 94, 0.4)' : undefined
                        }}
                      />
                      <div className="timelineContent">
                        <div className="timelineStopName">
                          <strong>{idx + 1}. {stop.name}</strong>
                          {idx === 0 && <span className="stopBadge start">จุดจอดต้นทาง</span>}
                          {idx === stopsWithWaiting.length - 1 && <span className="stopBadge end">จุดจอดปลายทาง</span>}
                          {isCurrentNextStop && (
                            <span style={{
                              fontSize: '10px', fontWeight: 800,
                              background: 'var(--success)', color: '#ffffff',
                              padding: '2px 8px', borderRadius: '99px'
                            }}>
                              จุดจอดถัดไป
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{
                            background: 'rgba(34, 197, 94, 0.12)', color: 'var(--success)',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            fontSize: '12px', fontWeight: 800,
                            padding: '4px 12px', borderRadius: '99px',
                            display: 'inline-flex', alignItems: 'center', gap: '4px'
                          }}>
                            รอรถ {stop.waitingCount} คน
                          </span>

                          {stop.pinnedCount > 0 && (
                            <>
                              <span style={{
                                background: 'rgba(92, 6, 140, 0.15)', color: 'var(--wu-purple-light)',
                                border: '1.5px solid var(--wu-purple-light)',
                                fontSize: '11px', fontWeight: 800,
                                padding: '3px 10px', borderRadius: '99px',
                                display: 'inline-flex', alignItems: 'center', gap: '4px'
                              }}>
                                <UserCheck size={12} /> {stop.pinnedMyBusSpecific > 0 ? `ระบุรอขึ้นรถคันนี้ (${stop.pinnedMyBusSpecific} คน)` : `แจ้งรอผ่านแอป (${stop.pinnedCount} คน)`}
                              </span>

                              {onDriverAcknowledgeStop && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onDriverAcknowledgeStop(stop.id, myBus.id);
                                    setTripToast(`รับผู้โดยสารที่สถานี "${stop.name}" เรียบร้อยแล้ว`);
                                    setTimeout(() => setTripToast(''), 3000);
                                  }}
                                  style={{
                                    background: 'var(--success)', color: '#fff', border: 'none',
                                    fontSize: '11px', fontWeight: 800, padding: '4px 10px',
                                    borderRadius: '8px', cursor: 'pointer'
                                  }}
                                >
                                  รับแล้ว / เคลียร์
                                </button>
                              )}
                            </>
                          )}

                          {stop.pinnedOtherCount > 0 && (
                            <span style={{
                              background: 'rgba(234, 179, 8, 0.15)', color: '#b45309',
                              border: '1px solid rgba(234, 179, 8, 0.35)',
                              fontSize: '11px', fontWeight: 700,
                              padding: '3px 8px', borderRadius: '99px',
                              display: 'inline-flex', alignItems: 'center', gap: '4px'
                            }}>
                              รอคันอื่น ({stop.otherBusIds?.join(', ')}) {stop.pinnedOtherCount} คน
                            </span>
                          )}

                          <span className="stopMetaTag">
                            จุดจอดที่ {idx + 1}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {active === 'driver-reports' && (
          <div className="driverWorkspace">
            <BackButton onClick={handleGoBack} label="ย้อนกลับ" />
            <div className="pageIntro" style={{ marginBottom: '20px', marginTop: '4px' }}>
              <h2>ประวัติข้อร้องเรียนทั้งหมด</h2>
              <p style={{ marginTop: '4px', color: 'var(--muted)', fontSize: '14px', lineHeight: 1.5 }}>รายการข้อร้องเรียน • รถ {myBus.id}</p>
            </div>
            <div className="announcementsList" style={{ marginTop: '14px' }}>
              {myReports.length > 0 ? (
                myReports.map((rep) => (
                  <div key={rep.id} className="announcementCard urgent">
                    <div className="annIcon"><CircleAlert size={22} /></div>
                    <div className="annContent">
                      <div className="annHead">
                        <span className="annCategory">{rep.category}</span>
                        <span className="annTime">{rep.timestamp}</span>
                      </div>
                      <h3>{rep.category} (หัก {Math.abs(rep.scoreImpact)} คะแนน)</h3>
                      <p>{rep.details}</p>

                      <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 800,
                          background: rep.status === 'แก้ไขเรียบร้อย' ? 'var(--success-bg)' : rep.status === 'ส่งให้คนขับแก้ไข' ? 'rgba(2, 132, 199, 0.12)' : 'var(--warning-bg)',
                          color: rep.status === 'แก้ไขเรียบร้อย' ? 'var(--success)' : rep.status === 'ส่งให้คนขับแก้ไข' ? '#0284c7' : 'var(--warning)'
                        }}>
                          สถานะ: {rep.status || 'รอตรวจสอบ'}
                        </span>

                        {rep.status === 'ส่งให้คนขับแก้ไข' && (
                          <span style={{
                            padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 800,
                            background: 'rgba(239, 68, 68, 0.12)', color: 'var(--danger)',
                            display: 'inline-flex', alignItems: 'center', gap: '4px'
                          }}>
                            แอดมินมอบหมายให้คุณดำเนินการแก้ไข
                          </span>
                        )}
                      </div>

                      {rep.adminNote && (
                        <div style={{
                          marginTop: '8px', padding: '8px 12px', borderRadius: '10px',
                          background: 'var(--bg)', border: '1px solid var(--border)', fontSize: '12px'
                        }}>
                          <strong style={{ color: 'var(--wu-purple-light)' }}>ข้อความ/คำสั่งจากผู้ดูแลระบบ: </strong>
                          <span style={{ color: 'var(--text)' }}>{rep.adminNote}</span>
                        </div>
                      )}

                      {rep.driverResponse && (
                        <div style={{
                          marginTop: '8px', padding: '8px 12px', borderRadius: '10px',
                          background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', fontSize: '12px'
                        }}>
                          <strong style={{ color: '#10b981' }}>ผลการแก้ไขและคำชี้แจงของคุณ ({rep.driverResolvedAt || 'เรียบร้อย'}): </strong>
                          <span style={{ color: 'var(--text)' }}>"{rep.driverResponse}"</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="emptyNotice" style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: '20px', padding: '32px', textAlign: 'center' }}>
                  <CheckCircle2 size={42} color="var(--success)" style={{ margin: '0 auto 12px' }} />
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>ไม่มีรายงานข้อร้องเรียน</h4>
                </div>
              )}
            </div>
          </div>
        )}

        {active === 'profile' && (
          <ProfilePage
            logout={logout}
            dark={dark}
            setDark={setDark}
            userInfo={effectiveUserInfo}
            setActive={handleNavigate}
            onGoBack={handleGoBack}
          />
        )}

        {active === 'notifications' && (
          <NotificationsPage
            setActive={handleNavigate}
            onGoBack={handleGoBack}
            userInfo={effectiveUserInfo}
          />
        )}
      </div>



      {/* DRIVER PRE-TRIP INSPECTION MODAL */}
      {isInspectionModalOpen && (
        <div className="modalOverlay" onClick={() => setIsInspectionModalOpen(false)}>
          <div className="modalCard" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', width: '92%' }}>
            <div className="modalHeader" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckSquare size={20} color="var(--wu-purple-light)" />
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
                  ตรวจความพร้อมรถ ({myBus.id})
                </h3>
              </div>
              <button onClick={() => setIsInspectionModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveDriverInspection} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ margin: '0 0 2px', fontSize: '13px', color: 'var(--muted)', fontWeight: 600, textAlign: 'left' }}>
                ตรวจสอบรายการความปลอดภัย
              </p>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                background: 'var(--bg)',
                padding: '12px 14px',
                borderRadius: '16px',
                border: '1px solid var(--border)'
              }}>
                {[
                  { key: 'tires', label: 'แรงดันลมยางและสภาพล้อรถ' },
                  { key: 'brakes', label: 'ระบบเบรกและเบรกมือ' },
                  { key: 'lights', label: 'ไฟหน้า ไฟท้าย ไฟเลี้ยว และไฟฉุกเฉิน' },
                  { key: 'gps', label: 'กล่องสัญญาณ GPS Tracker บนตัวรถ' },
                  { key: 'seatSensors', label: 'ระบบเซนเซอร์ตรวจจับที่นั่ง 20 จุด' },
                  { key: 'doors', label: 'ระบบเปิด-ปิดและเซนเซอร์ประตูผู้โดยสาร' }
                ].map((item) => (
                  <label
                    key={item.key}
                    className="inspectionCheckItem"
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      gap: '12px',
                      padding: '8px 10px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      margin: 0,
                      userSelect: 'none'
                    }}
                  >
                    <input
                      type="checkbox"
                      style={{
                        width: '18px',
                        height: '18px',
                        accentColor: 'var(--wu-purple-light)',
                        cursor: 'pointer',
                        flexShrink: 0,
                        margin: 0
                      }}
                      checked={driverInspectionChecklist[item.key] || false}
                      onChange={(e) => setDriverInspectionChecklist({ ...driverInspectionChecklist, [item.key]: e.target.checked })}
                    />
                    <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', textAlign: 'left', flex: 1, lineHeight: 1.4 }}>
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginTop: '10px'
              }}>
                <button
                  type="button"
                  onClick={() => setIsInspectionModalOpen(false)}
                  style={{
                    width: '100%',
                    minHeight: '46px',
                    border: '1.5px solid var(--border)',
                    background: 'var(--card)',
                    color: 'var(--text)',
                    borderRadius: '14px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                    margin: 0,
                    padding: '10px 16px'
                  }}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    minHeight: '46px',
                    border: 'none',
                    background: 'linear-gradient(135deg, var(--wu-purple-light), var(--wu-purple))',
                    color: '#ffffff',
                    borderRadius: '14px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    boxShadow: '0 4px 14px var(--wu-purple-glow)',
                    transition: 'all 0.2s ease',
                    margin: 0,
                    padding: '10px 16px'
                  }}
                >
                  บันทึกผล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Shell>
  );
}
