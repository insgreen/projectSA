import React from 'react';
import { Map, Route, Bus, Armchair, Flag, ArrowRight } from 'lucide-react';
import { ROUTES } from '../data/routesData';

export default function HomePage({ setActive, buses, onSelectBus, onSelectRoute }) {
  return (
    <div className="contentPage">
      <div className="homeHero">
        <div>
          <span className="heroBadge">WALAILAK UNIVERSITY SMART BUS</span>
          <h2>ยินดีต้อนรับสู่ระบบ WU Bus Connect</h2>
          <p>
            ระบบติดตามรถมันม่วง
          </p>
          <div className="heroBtns">
            <button className="primaryBtn heroBtn" onClick={() => setActive('map')}>
              <Map size={18} /> ตำแหน่งรถ
            </button>
            <button className="secondaryBtn heroBtn" onClick={() => setActive('seats')}>
              <Armchair size={18} /> เช็กที่นั่งว่าง
            </button>
          </div>
        </div>
      </div>

      {/* 3 CORE MENU TILES (User: เลือกเมนูที่ต้องการ) */}
      <div style={{ marginBottom: '24px' }}>
        <h3 className="sectionHeading" style={{ marginBottom: '14px' }}>
          เมนูหลัก
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))', gap: '14px' }}>
          {/* Menu 1: ตำแหน่งรถ */}
          <div
            onClick={() => setActive('map')}
            style={{
              background: 'var(--card)', border: '1.5px solid var(--border)',
              borderRadius: '20px', padding: '18px', cursor: 'pointer',
              transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              boxShadow: 'var(--shadow)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(92, 6, 140, 0.12)', display: 'grid', placeItems: 'center', color: 'var(--wu-purple-light)' }}>
                <Map size={24} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text)' }}>
                  ตำแหน่งรถ
                </h4>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', color: 'var(--wu-purple-light)', fontSize: '13px', fontWeight: 700 }}>
              เปิดแผนที่ <ArrowRight size={15} style={{ marginLeft: '4px' }} />
            </div>
          </div>

          {/* Menu 2: ดูจำนวนผู้โดยสาร / ที่นั่งว่าง */}
          <div
            onClick={() => setActive('seats')}
            style={{
              background: 'var(--card)', border: '1.5px solid var(--border)',
              borderRadius: '20px', padding: '18px', cursor: 'pointer',
              transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              boxShadow: 'var(--shadow)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.12)', display: 'grid', placeItems: 'center', color: 'var(--success)' }}>
                <Armchair size={24} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text)' }}>
                  ที่นั่งว่าง
                </h4>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', color: 'var(--success)', fontSize: '13px', fontWeight: 700 }}>
              เช็กที่นั่ง <ArrowRight size={15} style={{ marginLeft: '4px' }} />
            </div>
          </div>

          {/* Menu 3: ร้องเรียน */}
          <div
            onClick={() => setActive('report')}
            style={{
              background: 'var(--card)', border: '1.5px solid var(--border)',
              borderRadius: '20px', padding: '18px', cursor: 'pointer',
              transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              boxShadow: 'var(--shadow)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.12)', display: 'grid', placeItems: 'center', color: '#d97706' }}>
                <Flag size={24} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text)' }}>
                  ร้องเรียนคนขับ
                </h4>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', color: '#d97706', fontSize: '13px', fontWeight: 700 }}>
              ส่งเรื่องร้องเรียน <ArrowRight size={15} style={{ marginLeft: '4px' }} />
            </div>
          </div>
        </div>
      </div>

      <h3 className="sectionHeading">สายรถมันม่วง - คลิกเพื่อดูเฉพาะสาย</h3>
      <div className="routeCards">
        {ROUTES.map((r) => (
          <article
            key={r.id}
            className="routeOverviewCard"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              if (onSelectRoute) {
                onSelectRoute(r.id);
              } else {
                setActive('map');
              }
            }}
          >
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
              <small>เส้นทางจุดจอด (ต้นทาง → ปลายทาง):</small>
              <p style={{ marginTop: '4px' }}>
                {r.stops.length > 4 ? (
                  <>
                    {r.stops.slice(0, 3).map((s) => s.name).join(' → ')}{' '}
                    <span style={{ color: 'var(--muted)', fontWeight: 500 }}>→ ... →</span>{' '}
                    <strong style={{ color: 'var(--wu-purple-light)', fontWeight: 800 }}>
                      {r.stops[r.stops.length - 1].name}
                    </strong>
                  </>
                ) : (
                  r.stops.map((s) => s.name).join(' → ')
                )}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
