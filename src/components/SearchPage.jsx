import React, { useState } from 'react';
import { Search, MapPin, ArrowRight } from 'lucide-react';
import { CAMPUS_BUILDINGS, ROUTES } from '../data/routesData';
import BackButton from './BackButton';

export default function SearchPage({ setActive, onGoBack }) {
  const [query, setQuery] = useState('');

  const filteredBuildings = CAMPUS_BUILDINGS.filter(
    (b) => b.name.includes(query) || b.category.includes(query)
  );

  return (
    <div className="contentPage">
      <BackButton onClick={onGoBack || (() => setActive('home'))} label="ย้อนกลับ" />
      <div className="pageIntro">
        <span className="heroBadge">SEARCH LOCATIONS</span>
        <h2>ค้นหาจุดจอดรถ</h2>
        <p>ค้นหาจุดจอดเพื่อดูเส้นทางรถมันม่วงสายที่ผ่าน</p>
      </div>

      <div className="searchBigBox">
        <Search size={22} className="searchBigIcon" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="พิมพ์ชื่ออาคาร เช่น อาคารไทยบุรี, อาคารเรียนรวม 3, หอพัก..."
        />
      </div>

      <div className="buildingsGrid">
        {filteredBuildings.map((b, i) => {
          const routeObj = ROUTES.find((r) => r.id === b.route);
          return (
            <div key={i} className="buildingCard" onClick={() => setActive('map')}>
              <div
                className="bIconWrap"
                style={{
                  background: routeObj ? routeObj.bgColor : 'var(--wu-purple-subtle)',
                  color: routeObj ? routeObj.color : 'var(--wu-purple)'
                }}
              >
                <MapPin size={22} />
              </div>
              <div className="bDetails">
                <h4>{b.name}</h4>
                <div className="bTags">
                  <span className="catTag">{b.category}</span>
                  <span
                    className="routeInfoBadge"
                    style={{
                      background: routeObj ? routeObj.color : 'var(--wu-purple)',
                      color: '#ffffff'
                    }}
                  >
                    สาย {b.route} วิ่งผ่าน <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
