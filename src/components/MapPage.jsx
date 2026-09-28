import React, { useState, useMemo } from 'react';
import {
  Bus, MapPin, Search, Filter, Play, Pause, Zap, ArrowUpRight,
  RefreshCw, CircleAlert, ShieldCheck, Flag,
  MessageSquareWarning, Star, CheckCircle2, X, Users,
  User, Navigation, Clock
} from 'lucide-react';
import LeafletMapComponent from './LeafletMapComponent';
import { ROUTES, INITIAL_BUSES, CAMPUS_BUILDINGS } from '../data/routesData';
import { ScheduleService } from '../data/dataStore';

const DEFAULT_CAMPUS_STOP = { id: '1-1', name: 'อาคารกิจกรรม', lat: 8.6474, lng: 99.8937 };

export default function MapPage({
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
  selectedRouteFilter: propSelectedRouteFilter,
  setSelectedRouteFilter: propSetSelectedRouteFilter,
  onSelectBus,
  setActive,
  waitingStops = [],
  userWaitingStop = null,
  onPinStop,
  onUnpinStop
}) {
  const [localRouteFilter, setLocalRouteFilter] = useState(0); // 0 = All lines
  const selectedRouteFilter = propSelectedRouteFilter !== undefined ? propSelectedRouteFilter : localRouteFilter;
  const setSelectedRouteFilter = propSetSelectedRouteFilter || setLocalRouteFilter;
  const [localSelectedBusId, setLocalSelectedBusId] = useState(buses[0]?.id || 'WU-101');
  const [localSelectedStop, setLocalSelectedStop] = useState(DEFAULT_CAMPUS_STOP);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchErrorNotice, setSearchErrorNotice] = useState(false);
  const [pinToast, setPinToast] = useState('');

  const selectedBusId = propSelectedBusId !== undefined ? propSelectedBusId : localSelectedBusId;
  const setSelectedBusId = propSetSelectedBusId || setLocalSelectedBusId;

  const selectedStop = propSelectedStop || localSelectedStop || DEFAULT_CAMPUS_STOP;
  const setSelectedStop = (stop) => {
    if (propSetSelectedStop) propSetSelectedStop(stop);
    setLocalSelectedStop(stop);
  };

  // Real-time Dynamic ETA calculation between bus progress and stop polyline
  const calculateBusEtaToStop = (bus, stop) => {
    const isNotServing = bus.status === 'ยังไม่ถึงเวลางาน' || bus.status === 'เสร็จสิ้นรอบวิ่ง' || bus.status === 'ซ่อมบำรุง';
    if (isNotServing) {
      return {
        etaMinutes: 9999,
        remainingStops: 0,
        label: bus.status,
        isNotServing: true
      };
    }

    const route = ROUTES.find((r) => r.id === bus.route);
    if (!route || !route.polyline || route.polyline.length === 0 || !route.stops) {
      return { etaMinutes: bus.eta || 5, remainingStops: 1, label: `${bus.eta || 5} นาที`, isNotServing: false };
    }

    let minStopDist = Infinity;
    let stopPolylineIdx = 0;
    route.polyline.forEach((p, idx) => {
      const dist = Math.hypot(p.lat - stop.lat, p.lng - stop.lng);
      if (dist < minStopDist) {
        minStopDist = dist;
        stopPolylineIdx = idx;
      }
    });

    const busIdx = bus.progressIndex || 0;
    const polyLen = route.polyline.length;
    const steps = (stopPolylineIdx - busIdx + polyLen) % polyLen;

    let etaMinutes = Math.max(1, Math.round(steps * 0.35));
    if (steps === 0) {
      return { etaMinutes: 0, remainingStops: 0, label: 'กำลังจะถึง', isNotServing: false };
    }

    let stopIdx = route.stops.findIndex((s) => s.id === stop.id || s.name === stop.name);
    if (stopIdx === -1) stopIdx = 0;

    let closestBusStopIdx = 0;
    let minBusStopDist = Infinity;
    const busPos = route.polyline[busIdx] || route.polyline[0];
    route.stops.forEach((s, idx) => {
      const dist = Math.hypot(s.lat - busPos.lat, s.lng - busPos.lng);
      if (dist < minBusStopDist) {
        minBusStopDist = dist;
        closestBusStopIdx = idx;
      }
    });

    const remainingStops = (stopIdx - closestBusStopIdx + route.stops.length) % route.stops.length;

    return {
      etaMinutes,
      remainingStops,
      label: etaMinutes <= 1 ? 'กำลังจะถึง' : `อีก ${etaMinutes} นาที`,
      isNotServing: false
    };
  };

  const allCampusStops = useMemo(() => {
    const list = [];
    ROUTES.forEach((r) => {
      r.stops.forEach((s) => {
        if (!list.some((existing) => existing.name === s.name)) {
          list.push(s);
        }
      });
    });
    return list;
  }, []);

  const allSchedules = useMemo(() => {
    try {
      return ScheduleService.getAll() || [];
    } catch (e) {
      return [];
    }
  }, [buses]);

  const busesForStop = useMemo(() => {
    if (!selectedStop) return [];
    const routeIds = ROUTES.filter((r) =>
      r.stops.some((s) => s.id === selectedStop.id || s.name === selectedStop.name)
    ).map((r) => r.id);

    return buses
      .filter((b) => routeIds.includes(b.route))
      .map((b) => {
        const sch = allSchedules.find((s) => s.busId === b.id);
        const etaData = calculateBusEtaToStop(b, selectedStop);
        return {
          ...b,
          schedule: sch || null,
          shiftName: sch?.shiftName || b.shiftName || 'ช่วงการเดินรถ',
          shiftTime: sch ? `${sch.startTime} - ${sch.endTime} น.` : '',
          etaMinutes: etaData.etaMinutes,
          remainingStops: etaData.remainingStops,
          etaLabel: etaData.label,
          isNotServing: etaData.isNotServing
        };
      })
      .sort((a, b) => {
        if (a.isNotServing && !b.isNotServing) return 1;
        if (!a.isNotServing && b.isNotServing) return -1;
        return a.etaMinutes - b.etaMinutes;
      });
  }, [buses, selectedStop, allSchedules]);

  const nextArrivingBus = busesForStop.find((b) => !b.isNotServing) || null;

  const floatingNextBus = useMemo(() => {
    if (!userWaitingStop) return null;
    const targetStop = allCampusStops.find(
      (s) => s.id === userWaitingStop.stopId || s.name === userWaitingStop.stopName
    );
    if (!targetStop) return null;

    if (userWaitingStop.busId) {
      const specificBus = buses.find((b) => b.id === userWaitingStop.busId);
      if (specificBus) {
        const etaData = calculateBusEtaToStop(specificBus, targetStop);
        return {
          ...specificBus,
          etaMinutes: etaData.etaMinutes,
          etaLabel: etaData.label,
          isSpecific: true
        };
      }
    }

    const routeIds = ROUTES.filter((r) =>
      r.stops.some((s) => s.id === targetStop.id || s.name === targetStop.name)
    ).map((r) => r.id);

    const candidates = buses
      .filter((b) => routeIds.includes(b.route))
      .map((b) => {
        const etaData = calculateBusEtaToStop(b, targetStop);
        return {
          ...b,
          etaMinutes: etaData.etaMinutes,
          etaLabel: etaData.label
        };
      })
      .sort((a, b) => a.etaMinutes - b.etaMinutes);

    return candidates[0] || null;
  }, [userWaitingStop, allCampusStops, buses]);

  const currentActiveBus = buses.find((b) => b.id === selectedBusId) || buses[0] || INITIAL_BUSES[0];

  const routesForSelectedStop = useMemo(() => {
    if (!selectedStop) return [];
    return ROUTES.filter((r) =>
      r.stops.some((s) => s.id === selectedStop.id || s.name === selectedStop.name)
    );
  }, [selectedStop]);

  const waitingCountAtStop = useMemo(() => {
    if (!selectedStop || !waitingStops) return 0;
    const found = waitingStops.find(
      (w) => w.stopId === selectedStop.id || w.stopName === selectedStop.name
    );
    return found ? (found.pinnedCount || 1) : 0;
  }, [selectedStop, waitingStops]);

  const isUserWaitingHere = Boolean(
    userWaitingStop &&
    selectedStop &&
    (userWaitingStop.stopId === selectedStop.id || userWaitingStop.stopName === selectedStop.name)
  );

  const setSelectedBus = (bus) => {
    if (bus && bus.id) {
      if (onSelectBus) {
        onSelectBus(bus.id);
      } else {
        setSelectedBusId(bus.id);
      }
    }
  };

  const visibleBuses = useMemo(() => {
    if (selectedRouteFilter === 0) return buses;
    return buses.filter((b) => b.route === selectedRouteFilter);
  }, [buses, selectedRouteFilter]);

  useMemo(() => {
    if (selectedRouteFilter !== 0) {
      const filtered = buses.filter((b) => b.route === selectedRouteFilter);
      if (filtered.length > 0 && !filtered.some((b) => b.id === selectedBusId)) {
        setSelectedBusId(filtered[0].id);
      }
    }
  }, [selectedRouteFilter, buses, selectedBusId]);

  const visibleRoutes = useMemo(() => {
    if (selectedRouteFilter === 0) return ROUTES;
    return ROUTES.filter((r) => r.id === selectedRouteFilter);
  }, [selectedRouteFilter]);

  // Live Auto-Complete Suggestions
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    const results = [];

    // 1. Buses
    buses.forEach((b) => {
      if (b.id.toLowerCase().includes(q) || `สาย ${b.route}`.includes(q)) {
        const sch = allSchedules.find((s) => s.busId === b.id);
        const isNotServing = b.status === 'ยังไม่ถึงเวลางาน' || b.status === 'เสร็จสิ้นรอบวิ่ง' || b.status === 'ซ่อมบำรุง';
        results.push({
          type: 'bus',
          title: `รถมันม่วง ${b.id}`,
          subtitle: isNotServing
            ? `สาย ${b.route} • ${b.status} (${sch?.shiftName || b.shiftName || 'ตามตาราง'})`
            : `สาย ${b.route} • ${b.passengers || 0}/20 คน • ${b.status}`,
          data: b
        });
      }
    });

    // 2. Bus Stops
    ROUTES.forEach((route) => {
      route.stops.forEach((stop) => {
        if (stop.name.toLowerCase().includes(q) && !results.some((r) => r.title === stop.name)) {
          results.push({
            type: 'stop',
            title: stop.name,
            subtitle: `จุดจอดรถ (สาย ${route.id}: ${route.name})`,
            data: stop
          });
        }
      });
    });

    // 3. Campus Buildings
    CAMPUS_BUILDINGS.forEach((bld) => {
      if (bld.name.toLowerCase().includes(q) || bld.category.toLowerCase().includes(q)) {
        let matchedStop = null;
        for (const route of ROUTES) {
          matchedStop = route.stops.find((s) => s.name.includes(bld.name) || bld.name.includes(s.name.replace('อาคาร', '').replace('ศูนย์', '')));
          if (matchedStop) break;
        }
        if (!results.some((r) => r.title === bld.name)) {
          results.push({
            type: 'building',
            title: bld.name,
            subtitle: `อาคาร (${bld.category}) • สาย ${bld.route} วิ่งผ่าน`,
            data: matchedStop || { id: `bld-${bld.name}`, name: bld.name, lat: 8.6445, lng: 99.8970 }
          });
        }
      }
    });

    return results.slice(0, 5);
  }, [searchQuery, buses]);

  const handleSelectSuggestion = (item) => {
    setSearchErrorNotice(false);
    setShowSuggestions(false);
    setSearchQuery('');
    if (item.type === 'bus') {
      setSelectedBus(item.data);
    } else {
      setSelectedStop(item.data);
    }
  };

  const runSearch = () => {
    if (!searchQuery.trim()) return;
    setSearchErrorNotice(false);

    if (searchSuggestions.length > 0) {
      handleSelectSuggestion(searchSuggestions[0]);
      return;
    }

    setSearchErrorNotice(true);
    setTimeout(() => setSearchErrorNotice(false), 4000);
  };

  return (
    <div className="mapWorkspace">
      {/* Left Map Viewport */}
      <section className="mapPanel">
        {/* Search & Actions Bar */}
        <div className="mapToolbar">
          <div className="searchBox" style={{ position: 'relative' }}>
            <Search size={18} />
            <input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
                setSearchErrorNotice(false);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') runSearch();
              }}
              placeholder="ค้นหาป้ายทะเบียนรถ (WU-101), จุดจอด หรืออาคารใน มวล."
            />
            <button onClick={runSearch}>ค้นหา</button>

            {/* Instant Suggestions Dropdown */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="searchSuggestionsPopup">
                {searchSuggestions.map((item, idx) => (
                  <div
                    key={idx}
                    className="suggestionItem"
                    onClick={() => handleSelectSuggestion(item)}
                  >
                    {item.type === 'bus' ? (
                      <Bus size={16} className="suggIcon bus" />
                    ) : (
                      <MapPin size={16} className="suggIcon stop" />
                    )}
                    <div>
                      <strong>{item.title}</strong>
                      <small>{item.subtitle}</small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {searchErrorNotice && (
            <div className="searchErrorToast">
              <CircleAlert size={14} /> ไม่พบรายการที่ค้นหา ลองพิมพ์ชื่ออาคาร เช่น "ไทยบุรี", "WU-101", "เรียนรวม"
            </div>
          )}
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
            <Filter size={14} /> ทุกสาย (1-3)
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
            userWaitingStop={userWaitingStop}
          />
        </div>

        {/* Floating Waiting Banner (Bottom of Map Panel) */}
        {userWaitingStop && (
          <div className="floatingWaitBanner">
            <div className="fwLeft">
              <div className="fwPulseIcon">
                <MapPin size={18} />
              </div>
              <div className="fwText">
                <div className="fwTitle">
                  <span className="fwBadge">คุณกำลังรอรถ</span>
                  <strong>{userWaitingStop.stopName}</strong>
                </div>
                <div className="fwSub">
                  {floatingNextBus ? (
                    <span>
                      {userWaitingStop.busId ? (
                        <>รอรถคัน: <b>{userWaitingStop.busId} (สาย {floatingNextBus.route})</b> • <b>{floatingNextBus.etaLabel}</b></>
                      ) : (
                        <>รถคันถัดไป: <b>{floatingNextBus.id} (สาย {floatingNextBus.route})</b> • <b>{floatingNextBus.etaLabel}</b></>
                      )}
                    </span>
                  ) : (
                    <span>ส่งสัญญาณแจ้งคนขับเรียบร้อย...</span>
                  )}
                </div>
              </div>
            </div>
            <div className="fwActions">
              <button
                type="button"
                className="fwViewStopBtn"
                onClick={() => {
                  const stopObj = allCampusStops.find(
                    (s) => s.id === userWaitingStop.stopId || s.name === userWaitingStop.stopName
                  );
                  if (stopObj) setSelectedStop(stopObj);
                }}
              >
                ดูจุดจอดนี้
              </button>
              <button
                type="button"
                className="fwCancelBtn"
                onClick={async () => {
                  await onUnpinStop?.();
                  setPinToast('ยกเลิกการรอรถเรียบร้อยแล้ว');
                  setTimeout(() => setPinToast(''), 3000);
                }}
                title="ยกเลิกการรอ"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Pin Toast Notification */}
        {pinToast && (
          <div className="pinToastNotification">
            <CheckCircle2 size={18} color="var(--success)" />
            <span>{pinToast}</span>
          </div>
        )}
      </section>

      {/* Right Details Panel - Dedicated Stop Waiting & Live ETA Hub */}
      <aside className="busDetails">
        <div className="stopDetailContainer">
          {/* Header & Stop Picker */}
          <div className="stopSelectorHeader">
            <div className="stopSelectorTitleRow">
              <div className="stopHeaderIcon">
                <MapPin size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <span className="stopPanelTag">จุดรอรถมันม่วง</span>
                <h2 className="stopPanelHeading">เลือกจุดรอรถ</h2>
              </div>
            </div>
            <p className="stopSelectorSub">
              เลือกจุดจอดที่คุณรอขึ้นรถ
            </p>
          </div>

          {/* Dropdown Selector */}
          <div className="stopPickerGroup">
            <label htmlFor="stop-dropdown-select" className="stopPickerLabel">
              <span>เลือกจุดจอด:</span>
            </label>
            <div className="stopSelectWrap">
              <select
                id="stop-dropdown-select"
                className="stopSelectDropdown"
                value={selectedStop?.name || 'อาคารกิจกรรม'}
                onChange={(e) => {
                  const targetStop = allCampusStops.find((s) => s.name === e.target.value);
                  if (targetStop) {
                    setSelectedStop(targetStop);
                  }
                }}
              >
                {allCampusStops.map((stop) => (
                  <option key={stop.id || stop.name} value={stop.name}>
                    {stop.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Popular Stop Chips */}
          <div className="quickStopsSection">
            <span className="quickStopsTitle">จุดรอรถยอดนิยม:</span>
            <div className="quickStopChips">
              {[
                'อาคารกิจกรรม',
                'ศูนย์รวมรถ',
                'อาคารไทยบุรี',
                'ตรงข้ามอาคาร ST',
                'อาคารเรียนรวม 3',
                'โลตัสท่าศาลา'
              ].map((name) => {
                const isCurrent = (selectedStop?.name === name);
                return (
                  <button
                    key={name}
                    type="button"
                    className={`quickStopChip ${isCurrent ? 'active' : ''}`}
                    onClick={() => {
                      const target = allCampusStops.find((s) => s.name === name);
                      if (target) setSelectedStop(target);
                    }}
                  >
                    <MapPin size={11} />
                    <span>{name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Selected Stop Summary Card */}
          <div className="currentStopCard">
            <div className="currentStopCardHead">
              <div className="currentStopBadgeRow">
                <span className="currentStopTypeBadge">จุดจอดที่เลือก</span>
                {routesForSelectedStop.map((r) => (
                  <span
                    key={r.id}
                    className="servingRouteBadge"
                    style={{ background: r.color }}
                  >
                    สาย {r.id}
                  </span>
                ))}
              </div>
              <h3 className="currentStopName">{selectedStop?.name || 'อาคารกิจกรรม'}</h3>
              <div className="currentStopMeta">
                <span>มีรถวิ่งผ่าน {routesForSelectedStop.length} สาย</span>
                {waitingCountAtStop > 0 && (
                  <span className="waitingCountBadge">
                    มีคนรอที่จุดจอดนี้ {waitingCountAtStop} คน
                  </span>
                )}
              </div>
            </div>

            {/* Stop Pin / Waiting Action Area */}
            {isUserWaitingHere ? (
              <div className="activeWaitCard">
                <div className="activeWaitHeader">
                  <div className="pulseWaitDot" />
                  <strong className="activeWaitTitle">
                    {userWaitingStop.busId ? `คุณกำลังรอรถคัน: ${userWaitingStop.busId} (สาย ${userWaitingStop.routeId})` : 'คุณกำลังรอขึ้นรถที่จุดจอดนี้'}
                  </strong>
                </div>
                <p className="activeWaitDesc">
                  คนขับจะเตรียมชะลอ เมื่อถึงจุดจอดนี้ (ระบบจะยกเลิกการรออัตโนมัติเมื่อรถมาถึง)
                </p>
                <div className="activeWaitEtaInfo">
                  <Clock size={16} color="var(--success)" />
                  <span>
                    {userWaitingStop.busId ? (
                      (() => {
                        const targetBus = buses.find((b) => b.id === userWaitingStop.busId);
                        const targetEta = targetBus ? calculateBusEtaToStop(targetBus, selectedStop) : null;
                        return (
                          <>รถ <b>{userWaitingStop.busId}</b>: <b>{targetEta ? targetEta.label : 'กำลังจะถึง'}</b></>
                        );
                      })()
                    ) : (
                      <>รถคันถัดไป: <b>{nextArrivingBus ? `${nextArrivingBus.id} (สาย ${nextArrivingBus.route})` : 'กำลังคำนวณ'}</b> • <b>{nextArrivingBus ? nextArrivingBus.etaLabel : '1 นาที'}</b></>
                    )}
                  </span>
                </div>
                <button
                  type="button"
                  className="cancelWaitBtn"
                  onClick={async () => {
                    await onUnpinStop?.();
                    setPinToast('ยกเลิกการรอรถเรียบร้อยแล้ว');
                    setTimeout(() => setPinToast(''), 3000);
                  }}
                >
                  <X size={15} /> ยกเลิกการรอรถ
                </button>
              </div>
            ) : userWaitingStop ? (
              <div className="pinWaitActionBox">
                <button
                  type="button"
                  className="pinWaitBtn switch"
                  onClick={async () => {
                    await onPinStop?.({
                      stopId: selectedStop.id,
                      stopName: selectedStop.name,
                      routeId: nextArrivingBus?.route || selectedStop.id?.split('-')[0] || 1,
                      busId: nextArrivingBus?.id || null
                    });
                    setPinToast(`ย้ายมารอที่ "${selectedStop.name}" เรียบร้อยแล้ว`);
                    setTimeout(() => setPinToast(''), 3500);
                  }}
                >
                  <MapPin size={18} />
                  <div className="pinWaitBtnTextCol">
                    <span>ย้ายมารอที่จุดจอดนี้แทน</span>
                    <small className="pinWaitBtnSub">
                      เดิมรอที่: {userWaitingStop.stopName}
                    </small>
                  </div>
                </button>
              </div>
            ) : (
              <div className="pinWaitActionBox">
                <button
                  type="button"
                  className="pinWaitBtn"
                  onClick={async () => {
                    await onPinStop?.({
                      stopId: selectedStop.id,
                      stopName: selectedStop.name,
                      routeId: nextArrivingBus?.route || selectedStop.id?.split('-')[0] || 1,
                      busId: nextArrivingBus?.id || null
                    });
                    setPinToast(`ปักหมุดสำเร็จ! รถมุ่งหน้ามาที่ "${selectedStop.name}" แล้ว`);
                    setTimeout(() => setPinToast(''), 3500);
                  }}
                >
                  <MapPin size={18} />
                  <div className="pinWaitBtnTextCol">
                    <span>ปักหมุดรอขึ้นรถที่จุดจอดนี้</span>
                    {nextArrivingBus && (
                      <small className="pinWaitBtnSub">
                        คันที่จะมาถึง: {nextArrivingBus.id}
                      </small>
                    )}
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Upcoming Buses Section */}
          <div className="stopBusesSection">
            <div className="stopBusesSectionHead" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h4 style={{ margin: 0 }}>รถมันม่วงที่กำลังจะมาถึง</h4>
              <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>
                {busesForStop.filter((b) => !b.isNotServing).length} คันกำลังให้บริการ
              </span>
            </div>

            <div className="upcomingBusesList">
              {busesForStop.length > 0 ? (
                busesForStop.map((b) => {
                  const isWaitingForThisBus = Boolean(
                    userWaitingStop &&
                    userWaitingStop.busId === b.id &&
                    (userWaitingStop.stopId === selectedStop.id || userWaitingStop.stopName === selectedStop.name)
                  );

                  return (
                    <div
                      key={b.id}
                      className={`upcomingBusCard ${isWaitingForThisBus ? 'activePinnedBus' : ''}`}
                      onClick={() => setSelectedBus(b)}
                      title={b.isNotServing ? `รถ ${b.id}: ${b.status} (${b.shiftName})` : "คลิกเพื่อระบุตำแหน่งรถบนแผนที่"}
                      style={{ opacity: b.isNotServing ? 0.78 : 1 }}
                    >
                      <div
                        className="busRouteBadge"
                        style={{ background: ROUTES.find((r) => r.id === b.route)?.color, opacity: b.isNotServing ? 0.65 : 1 }}
                      >
                        <Bus size={16} />
                        <span>สาย {b.route}</span>
                      </div>
                      <div className="upcomingInfo">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <strong>{b.id}</strong>
                          {isWaitingForThisBus && (
                            <span className="pinnedBusBadge">คุณรอคันนี้</span>
                          )}
                          {b.isNotServing && (
                            <span className="tag info" style={{ fontSize: '10px', padding: '2px 6px', lineHeight: 1.2 }}>
                              {b.status}
                            </span>
                          )}
                        </div>
                        <small>คนขับ: {b.driverName || 'พนักงานขับรถ'}</small>
                      </div>
                      <div className="upcomingEta">
                        {b.isNotServing ? (
                          <>
                            <b style={{ color: 'var(--muted)', fontSize: '12.5px' }}>{b.shiftName}</b>
                            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{b.shiftTime || 'รอบถัดไป'}</span>
                          </>
                        ) : (
                          <>
                            <b>{b.etaLabel}</b>
                            <span>ว่าง {Math.max(0, 20 - (b.passengers || 0))} ที่นั่ง</span>
                          </>
                        )}
                      </div>
                      <div className="busActionCol" onClick={(e) => e.stopPropagation()}>
                        {b.isNotServing ? (
                          <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700, padding: '5px 8px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                            ยังไม่ถึงรอบวิ่ง
                          </span>
                        ) : isWaitingForThisBus ? (
                          <button
                            type="button"
                            className="pinBusDirectBtn active"
                            onClick={async () => {
                              await onUnpinStop?.();
                              setPinToast(`ยกเลิกการรอรถ ${b.id} เรียบร้อยแล้ว`);
                              setTimeout(() => setPinToast(''), 3000);
                            }}
                            title="คลิกเพื่อยกเลิกการรอคันนี้"
                          >
                            <CheckCircle2 size={13} /> รอคันนี้อยู่
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="pinBusDirectBtn"
                            onClick={async () => {
                              await onPinStop?.({
                                stopId: selectedStop.id,
                                stopName: selectedStop.name,
                                routeId: b.route,
                                busId: b.id
                              });
                              setPinToast(`ปักหมุดสำเร็จ! แจ้งคนขับ ${b.id} (สาย ${b.route}) เรียบร้อยแล้ว`);
                              setTimeout(() => setPinToast(''), 3500);
                            }}
                            title={`ปักหมุดเลือกรอรถคัน ${b.id}`}
                          >
                            รอคันนี้
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="noBusesNotice">
                  ขณะนี้ไม่มีรถมันม่วงที่กำลังมุ่งหน้ามายังจุดจอดนี้ในสายที่เปิดให้บริการ
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
