import React, { useState } from 'react';
import { Bus } from 'lucide-react';

export default function Brand({ compact = false, centered = true }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className={`brand ${compact ? 'compact' : ''} ${centered ? 'centered' : ''}`}>
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
            <Bus size={compact ? 22 : 30} />
          </div>
        )}
      </div>
      <div className="brandText">
        <strong className="brandTitle">WU BUS</strong>
        <span className="brandSub">รถมันม่วง Connect</span>
      </div>
    </div>
  );
}
