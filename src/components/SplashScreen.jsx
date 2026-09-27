import React from 'react';
import { Bus } from 'lucide-react';

export default function SplashScreen({ onSkip }) {
  return (
    <main className="splash">
      <div className="splashGlow" />
      <div className="splashCard">
        <div className="logoPulse">
          <Bus size={54} />
        </div>
        <span className="splashBadge">WALAILAK UNIVERSITY</span>
        <h1>WU BUS</h1>
        <h2>รถมันม่วง Connect</h2>
        <p>Loading . . </p>

        <div className="loader">
          <span />
        </div>

      </div>
    </main>
  );
}
