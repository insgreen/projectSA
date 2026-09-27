import React from 'react';
import { Bus, Navigation, Map } from 'lucide-react';
import { ROUTES } from '../data/routesData';
import BackButton from './BackButton';

export default function RoutesPage({ setActive, onSelectRoute, onGoBack }) {
  return (
    <div className="contentPage">
      <BackButton onClick={onGoBack || (() => setActive('home'))} label="ย้อนกลับ" />
      <div className="pageIntro">
        <span className="heroBadge">BUS ROUTES GUIDE</span>
        <h2>เส้นทางและจุดจอดรถมันม่วงทั้ง 3 สาย</h2>
        <p>จุดจอดรับ-ส่งตามลำดับเส้นทาง</p>
      </div>

      <div className="routesListGrid">
        {ROUTES.map((route) => (
          <div
            key={route.id}
            className="routeDetailCard"
            style={{
              '--route-color': route.color,
              '--route-bg': route.bgColor,
              borderColor: route.borderColor
            }}
          >
            <div className="routeDetailHeader" style={{ background: route.bgColor }}>
              <div className="routeHeaderBadge" style={{ background: route.color }}>
                <Bus size={20} color="#ffffff" />
                <span>สาย {route.id}</span>
              </div>
              <div className="routeHeaderTitles">
                <h3 style={{ color: route.color }}>{route.name}</h3>
                <p style={{ color: route.color }}>
                  <Navigation size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                  {route.stops.length} จุดจอดรับ-ส่งตลอดเส้นทาง
                </p>
              </div>
              {onSelectRoute && (
                <button
                  className="routeSelectBtn"
                  style={{ background: route.color, color: '#fff' }}
                  onClick={() => onSelectRoute(route.id)}
                >
                  <Map size={14} /> ดูบนแผนที่
                </button>
              )}
            </div>

            <div className="routeStopsList">
              {route.stops.map((stop, idx) => (
                <div key={stop.id} className="routeStopCard">
                  <div
                    className="routeStopDot"
                    style={{
                      background: idx === 0 ? route.color : 'var(--card)',
                      borderColor: route.color,
                      boxShadow: `0 0 0 3px ${route.color}30`
                    }}
                  />
                  <div className="routeStopContent">
                    <div className="routeStopName">
                      <strong>{idx + 1}. {stop.name}</strong>
                      {idx === 0 && <span className="stopBadge start">จุดจอดต้นทาง</span>}
                      {idx === route.stops.length - 1 && <span className="stopBadge end">จุดจอดปลายทาง</span>}
                    </div>
                    <span className="stopMetaTag">
                      จุดจอดที่ {idx + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
