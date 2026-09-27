import React, { useState } from 'react';
import Shell from './Shell';
import MapPage from './MapPage';
import HomePage from './HomePage';
import RoutesPage from './RoutesPage';
import SearchPage from './SearchPage';
import NotificationsPage from './NotificationsPage';
import ReportPage from './ReportPage';
import ProfilePage from './ProfilePage';
import SeatStatusPage from './SeatStatusPage';
import { passengerNav } from '../data/routesData';

export default function PassengerDashboard({
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
  reports,
  onReportSubmit,
  onUpdateReport,
  onDeleteReport,
  userInfo,
  waitingStops = [],
  userWaitingStop = null,
  onPinStop,
  onUnpinStop,
  onSwitchToAdmin
}) {
  const DEFAULT_STOP = { id: '1-1', name: 'อาคารกิจกรรม', lat: 8.6474, lng: 99.8937 };
  const [selectedBusId, setSelectedBusId] = useState('WU-101');
  const [selectedStop, setSelectedStop] = useState(DEFAULT_STOP);
  const [selectedRouteFilter, setSelectedRouteFilter] = useState(0);

  // Real visited-page history stack for true step-by-step back button
  const [historyStack, setHistoryStack] = useState(['home']);

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
      setActive('home');
    }
  };

  const handleSelectBus = (busOrId) => {
    const busId = typeof busOrId === 'string' ? busOrId : busOrId.id;
    setSelectedBusId(busId);
    setSelectedStop(null);
    handleNavigate('map');
  };

  const handleSelectRoute = (routeId) => {
    setSelectedRouteFilter(routeId);
    setSelectedStop(null);
    handleNavigate('map');
  };

  const getPageTitle = () => {
    switch (active) {
      case 'map': return 'ตำแหน่งรถ';
      case 'home': return 'หน้าแรก';
      case 'seats': return 'ที่นั่งว่าง';
      case 'routes': return 'ตารางเส้นทาง & จุดจอด';
      case 'search': return 'ค้นหาจุดจอด';
      case 'notifications': return 'การแจ้งเตือน';
      case 'report': return 'ร้องเรียนคนขับ / แจ้งปัญหา';
      default: return 'ข้อมูลผู้ใช้งาน';
    }
  };

  const currentUserId = userInfo?.userId || userInfo?.id || '68108596';
  const currentUserName = userInfo?.userName || userInfo?.name || '';
  const myReports = (reports || []).filter(
    (r) => String(r.userId) === String(currentUserId) || (currentUserName && r.userName === currentUserName)
  );

  return (
    <Shell
      dark={dark}
      setDark={setDark}
      logout={logout}
      active={active}
      setActive={handleNavigate}
      userInfo={userInfo}
      onSwitchToAdmin={onSwitchToAdmin}
      navItems={passengerNav}
      title={getPageTitle()}
      subtitle="ติดตามรถมันม่วง มหาวิทยาลัยวลัยลักษณ์"
      reportNotifs={myReports}
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
          selectedRouteFilter={selectedRouteFilter}
          setSelectedRouteFilter={setSelectedRouteFilter}
          onSelectBus={handleSelectBus}
          setActive={handleNavigate}
          waitingStops={waitingStops}
          userWaitingStop={userWaitingStop}
          onPinStop={onPinStop}
          onUnpinStop={onUnpinStop}
        />
      )}
      {active === 'home' && (
        <HomePage
          setActive={handleNavigate}
          buses={buses}
          onSelectBus={handleSelectBus}
          onSelectRoute={handleSelectRoute}
        />
      )}
      {active === 'seats' && (
        <SeatStatusPage
          buses={buses}
          setActive={handleNavigate}
          onGoBack={handleGoBack}
          onSelectBus={handleSelectBus}
        />
      )}
      {active === 'routes' && (
        <RoutesPage setActive={handleNavigate} onSelectRoute={handleSelectRoute} onGoBack={handleGoBack} />
      )}
      {active === 'search' && <SearchPage setActive={handleNavigate} onGoBack={handleGoBack} />}
      {active === 'notifications' && <NotificationsPage setActive={handleNavigate} onGoBack={handleGoBack} />}
      {active === 'report' && (
        <ReportPage
          onReportSubmit={onReportSubmit}
          onUpdateReport={onUpdateReport}
          onDeleteReport={onDeleteReport}
          reports={reports}
          userInfo={userInfo}
          buses={buses}
          selectedBusId={selectedBusId}
          setActive={handleNavigate}
          onGoBack={handleGoBack}
        />
      )}
      {active === 'profile' && (
        <ProfilePage logout={logout} dark={dark} setDark={setDark} userInfo={userInfo} setActive={handleNavigate} onGoBack={handleGoBack} />
      )}
    </Shell>
  );
}
