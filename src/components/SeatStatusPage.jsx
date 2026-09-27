import React, { useState } from 'react';
import {
  Armchair, Users, Bus, Gauge, RefreshCw, CheckCircle2,
  AlertTriangle, Info, MapPin, ArrowRight
} from 'lucide-react';
import BackButton from './BackButton';
import BusCabinSeatMap from './BusCabinSeatMap';
import { ROUTES } from '../data/routesData';

export default function SeatStatusPage({ buses, setActive, onGoBack, onSelectBus }) {
  const [selectedRouteFilter, setSelectedRouteFilter] = useState(0); // 0 = all
  const [selectedBusId, setSelectedBusId] = useState(buses[0]?.id || 'WU-101');

  const filteredBuses = buses.filter((b) => {
    if (selectedRouteFilter === 0) return true;
    return b.route === selectedRouteFilter;
  });

  const activeBus = buses.find((b) => b.id === selectedBusId) || filteredBuses[0] || buses[0];
  const route = ROUTES.find((r) => r.id === activeBus?.route);

  const totalCapacity = 20;
  const occupiedCount = (activeBus?.seats || []).slice(0, totalCapacity).filter((s) => s !== 'free').length;
  const freeSeatCount = totalCapacity - occupiedCount;
  const totalPassengers = occupiedCount;
  const occupancyPercent = Math.round((totalPassengers / totalCapacity) * 100);

  return (
    <div className="contentPage">
      <div className="seatStatusContainer">
        <BackButton onClick={onGoBack || (() => setActive?.('home'))} label="ย้อนกลับ" />

      <div className="pageIntro">
        <h2>ดูจำนวนที่นั่งว่าง</h2>
      </div>

      {/* FILTER BUTTONS */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--muted)' }}>กรองตามสาย:</span>
        <button
          type="button"
          onClick={() => setSelectedRouteFilter(0)}
          style={{
            padding: '7px 16px',
            fontSize: '13px',
            fontWeight: 700,
            borderRadius: '99px',
            border: '1.5px solid var(--wu-purple-light)',
            background: selectedRouteFilter === 0 ? 'var(--wu-purple-light)' : 'var(--card)',
            color: selectedRouteFilter === 0 ? '#ffffff' : 'var(--text)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: selectedRouteFilter === 0 ? '0 2px 8px rgba(92, 6, 140, 0.25)' : 'none'
          }}
        >
          ทุกสาย
        </button>
        {ROUTES.map((r) => {
          const isSelected = selectedRouteFilter === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelectedRouteFilter(r.id)}
              style={{
                padding: '7px 16px',
                fontSize: '13px',
                fontWeight: 700,
                borderRadius: '99px',
                border: `1.5px solid ${r.color}`,
                background: isSelected ? r.color : 'var(--card)',
                color: isSelected ? '#ffffff' : 'var(--text)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isSelected ? `0 2px 8px ${r.color}40` : 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span
                style={{
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  background: isSelected ? '#ffffff' : r.color,
                  flexShrink: 0
                }}
              />
              {r.name}
            </button>
          );
        })}
      </div>

      {/* BUS SELECTOR ROW */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '24px' }}>
        {filteredBuses.map((b) => {
          const isSelected = b.id === activeBus?.id;
          const r = ROUTES.find((item) => item.id === b.route);
          return (
            <button
              key={b.id}
              onClick={() => setSelectedBusId(b.id)}
              style={{
                flexShrink: 0,
                padding: '12px 18px',
                borderRadius: '16px',
                border: `2px solid ${isSelected ? (r?.color || 'var(--wu-purple-light)') : 'var(--border)'}`,
                background: isSelected ? 'var(--card)' : 'var(--bg)',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: isSelected ? '0 8px 24px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: r?.color || '#999' }} />
                <strong style={{ fontSize: '15px', color: 'var(--text)' }}>{b.id}</strong>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                ผู้โดยสาร {Math.min(20, b.passengers || 0)}/20 ที่นั่ง
              </div>
            </button>
          );
        })}
      </div>

      {/* ACTIVE BUS DETAIL DASHBOARD */}
      {activeBus && (
        <div className="seatDashboardGrid">
          {/* LEFT COLUMN: Vehicle Details & Telemetry */}
          <div className="seatVehicleInfoCard">
            {/* Header */}
            <div className="seatCardHeader">
              <div>
                <span style={{
                  background: route?.color, color: '#fff',
                  fontSize: '12px', fontWeight: 800, padding: '3px 12px', borderRadius: '99px',
                  display: 'inline-block', marginBottom: '6px'
                }}>
                  สาย {activeBus.route}
                </span>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--text)', lineHeight: 1.3 }}>
                  รถมันม่วงป้ายทะเบียน {activeBus.id}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--muted)' }}>
                  คนขับรถ: <strong>{activeBus.driverName || 'สมชาย ดีเยี่ยม'}</strong>
                </p>
              </div>
            </div>

            {/* Key Stat Tiles */}
            <div className="seatStatsGrid">
              <div className="dStatCard">
                <Armchair size={26} color="#22a447" />
                <div>
                  <b style={{ color: '#22a447' }}>{freeSeatCount}</b>
                  <small>ที่นั่งว่าง</small>
                </div>
              </div>

              <div className="dStatCard">
                <Armchair size={26} color="#ef4444" />
                <div>
                  <b style={{ color: '#ef4444' }}>{occupiedCount}</b>
                  <small>ที่นั่งไม่ว่าง</small>
                </div>
              </div>

              <div className="dStatCard">
                <Armchair size={26} color="var(--wu-purple-light)" />
                <div>
                  <b>{totalCapacity}</b>
                  <small>ที่นั่งทั้งหมด</small>
                </div>
              </div>
            </div>

            {/* Route & Journey Details */}
            <div className="seatRouteDetails">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <MapPin size={18} color={route?.color || 'var(--wu-purple-light)'} />
                <strong style={{ fontSize: '14px', color: 'var(--text)' }}>{route?.name || 'เส้นทางเดินรถ'}</strong>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)', lineHeight: 1.5 }}>
                {route?.desc || 'รถกำลังวิ่งให้บริการตามเส้นทางรอบมหาวิทยาลัยวลัยลักษณ์'}
              </p>
            </div>

            {/* Quick Action Button to Map */}
            <div style={{ marginTop: '16px' }}>
              <button
                onClick={() => {
                  if (onSelectBus) onSelectBus(activeBus.id);
                  else setActive?.('map');
                }}
                className="primaryBtn"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  padding: '12px 20px',
                  borderRadius: '14px'
                }}
              >
                ดูตำแหน่งรถคันนี้บนแผนที่ <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Dedicated Seat Cabin Card */}
          <div className="seatCabinCard">
            <div className="seatCabinCardHeader">
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text)' }}>
                ผังที่นั่งในรถ
              </h4>
              <div className="seatLegend" style={{ margin: 0 }}>
                <span><i className="legendDot free" /> ว่าง ({freeSeatCount})</span>
                <span><i className="legendDot occupied" /> ไม่ว่าง ({occupiedCount})</span>
              </div>
            </div>

            <div className="seatCabinInner">
              <BusCabinSeatMap seats={activeBus.seats || Array(20).fill('free')} />
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
