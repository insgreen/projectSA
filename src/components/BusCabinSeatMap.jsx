import React from 'react';
import { Armchair, DoorClosed, PersonStanding, ArrowLeftRight } from 'lucide-react';

export default function BusCabinSeatMap({ seats = [], onToggleSeat, interactive = false }) {
  // 20 seats standard mapping
  const seatList = Array(20).fill('free').map((fallback, i) => seats[i] || fallback);

  const renderSeat = (idx, seatNumber) => {
    const state = seatList[idx] || 'free';
    const isOccupied = state !== 'free';
    const seatClass = isOccupied ? 'occupied' : 'free';

    return (
      <div
        key={idx}
        className={`seatItem ${seatClass} ${interactive ? 'interactiveSeat' : ''}`}
        title={`ที่นั่ง #${seatNumber}: ${isOccupied ? 'ไม่ว่าง' : 'ว่าง'}`}
        onClick={() => interactive && onToggleSeat && onToggleSeat(idx)}
      >
        <Armchair size={17} />
        <span className="seatNumBadge">{seatNumber}</span>
      </div>
    );
  };

  return (
    <div className="busCabinWrapper">
      <div className="busCabinBody">
        {/* Front Cockpit Banner (หน้ารถ) */}
        <div className="busCabinFront">
          <div className="windshieldGlass">
            <span>หน้ารถ</span>
          </div>
        </div>

        {/* Row 0: Front Door (Left) & Driver (Right) */}
        <div className="busCabinRow cockpitRow">
          <div className="doorBay left">
            <div className="verticalDoorLeaf frontDoor" title="ประตูขึ้น-ลง">
              <DoorClosed size={16} />
              <span className="doorLabel">ประตู</span>
            </div>
            <div className="doorWalkway" title="ขึ้น-ลงได้ทั้งสองทาง">
              <div className="parallelArrows">
                <ArrowLeftRight size={17} strokeWidth={2.2} />
              </div>
            </div>
          </div>
          <div className="centerAisle">
            <span className="aisleIndicator">ทางเดิน</span>
          </div>
          <div className="driverCockpit right">
            <PersonStanding size={17} />
            <span>คนขับ</span>
          </div>
        </div>

        {/* Row 1: Seat 1 (Left single) & Seat 2 (Right single) */}
        <div className="busCabinRow">
          <div className="seatBay single left">
            {renderSeat(0, 1)}
          </div>
          <div className="centerAisle" />
          <div className="seatBay single right">
            {renderSeat(1, 2)}
          </div>
        </div>

        {/* Row 2: Seats 3, 4 (Left) & Seats 5, 6 (Right) */}
        <div className="busCabinRow">
          <div className="seatBay double left">
            {renderSeat(2, 3)}
            {renderSeat(3, 4)}
          </div>
          <div className="centerAisle" />
          <div className="seatBay double right">
            {renderSeat(4, 5)}
            {renderSeat(5, 6)}
          </div>
        </div>

        {/* Row 3: Seats 7, 8 (Left) & Seats 9, 10 (Right) */}
        <div className="busCabinRow">
          <div className="seatBay double left">
            {renderSeat(6, 7)}
            {renderSeat(7, 8)}
          </div>
          <div className="centerAisle" />
          <div className="seatBay double right">
            {renderSeat(8, 9)}
            {renderSeat(9, 10)}
          </div>
        </div>

        {/* Row 4: Middle Door (Left) & Seats 11, 12 (Right) */}
        <div className="busCabinRow">
          <div className="doorBay left">
            <div className="verticalDoorLeaf midDoor" title="ประตูขึ้น-ลง">
              <DoorClosed size={16} />
              <span className="doorLabel">ประตู</span>
            </div>
            <div className="doorWalkway" title="ขึ้น-ลงได้ทั้งสองทาง">
              <div className="parallelArrows">
                <ArrowLeftRight size={17} strokeWidth={2.2} />
              </div>
            </div>
          </div>
          <div className="centerAisle">
            <span className="aisleIndicator">ทางเดิน</span>
          </div>
          <div className="seatBay double right">
            {renderSeat(10, 11)}
            {renderSeat(11, 12)}
          </div>
        </div>

        {/* Row 5: Seats 13, 14 (Left) & Seats 15, 16 (Right) */}
        <div className="busCabinRow">
          <div className="seatBay double left">
            {renderSeat(12, 13)}
            {renderSeat(13, 14)}
          </div>
          <div className="centerAisle" />
          <div className="seatBay double right">
            {renderSeat(14, 15)}
            {renderSeat(15, 16)}
          </div>
        </div>

        {/* Row 6: Seats 17 to 20 (4 seats spread evenly across full rear row) */}
        <div className="busCabinRow lastRow">
          {renderSeat(16, 17)}
          {renderSeat(17, 18)}
          {renderSeat(18, 19)}
          {renderSeat(19, 20)}
        </div>

        {/* Rear of Bus (หลังรถ) */}
        <div className="busCabinRear">
          <span>หลังรถ</span>
        </div>
      </div>
    </div>
  );
}
