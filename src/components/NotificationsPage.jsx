import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, AlertCircle, Clock, ArrowRight, BellOff, Bus, ShieldAlert } from 'lucide-react';
import { NotificationService } from '../data/dataStore';
import BackButton from './BackButton';

export default function NotificationsPage({ setActive, onGoBack, userInfo }) {
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState(() => NotificationService.getAllNotifications());

  useEffect(() => {
    const unsub = NotificationService.subscribeNotifications((items) => {
      setNotifications(items || []);
    });
    return () => unsub();
  }, []);

  const urgentCount = notifications.filter((n) => n.urgent).length;
  const complaints = notifications.filter((n) => n.type === 'complaint');
  const busIssues = notifications.filter((n) => n.type === 'bus_issue' || n.type === 'system_issue');
  const announcements = notifications.filter((n) => n.type === 'announcement');

  const filteredItems = notifications.filter((n) => {
    if (filter === 'complaint') return n.type === 'complaint';
    if (filter === 'issue') return n.type === 'bus_issue' || n.type === 'system_issue';
    if (filter === 'announcement') return n.type === 'announcement';
    return true;
  });

  const handleAction = (n) => {
    const isComplaint = n.type === 'complaint';
    const isIssue = n.type === 'bus_issue' || n.type === 'system_issue';
    const role = userInfo?.userType || (userInfo?.roleLabel?.includes('ผู้ดูแล') ? 'admin' : (userInfo?.roleLabel?.includes('คนขับ') ? 'driver' : 'passenger'));

    if (role === 'admin') {
      if (isComplaint) setActive?.('reports');
      else if (isIssue) setActive?.('buses');
      else setActive?.('dashboard');
    } else if (role === 'driver') {
      if (isComplaint) setActive?.('driver-reports');
      else setActive?.('driver-home');
    } else {
      if (isComplaint) setActive?.('report');
      else if (isIssue) setActive?.('map');
      else setActive?.('notifications');
    }
  };

  return (
    <div className="contentPage">
      <BackButton onClick={onGoBack || (() => setActive?.('home'))} label="ย้อนกลับ" />

      <div className="pageIntro" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2>ศูนย์แจ้งเตือนระบบ (Notification Center)</h2>
          <p>แสดงรายการสิ่งที่ผู้ใช้ร้องเรียน, ระบบ & ปัญหารถมันม่วง, และประกาศแจ้งเตือนด่วน</p>
        </div>
        {urgentCount > 0 && (
          <span style={{
            fontSize: '12px',
            fontWeight: 800,
            background: 'var(--danger-bg)',
            color: 'var(--danger)',
            padding: '6px 14px',
            borderRadius: '99px',
            border: '1.5px solid var(--danger)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <AlertTriangle size={14} /> {urgentCount} รายการต้องดำเนินการด่วน
          </span>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '8px',
        marginBottom: '16px'
      }}>
        {[
          { id: 'all', label: `ทั้งหมด (${notifications.length})` },
          { id: 'complaint', label: `สิ่งที่ผู้ใช้ร้องเรียน (${complaints.length})` },
          { id: 'issue', label: `ระบบ & รถมีปัญหา (${busIssues.length})` },
          { id: 'announcement', label: `ประกาศด่วน (${announcements.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            style={{
              padding: '9px 18px',
              borderRadius: '99px',
              fontSize: '13px',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              border: filter === tab.id ? 'none' : '1.5px solid var(--border)',
              background: filter === tab.id ? 'var(--wu-purple)' : 'var(--card)',
              color: filter === tab.id ? '#fff' : 'var(--muted)',
              boxShadow: filter === tab.id ? '0 4px 14px var(--wu-purple-glow)' : 'none'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredItems.length === 0 ? (
          <div className="panelCard" style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--muted)' }}>
            <BellOff size={42} style={{ opacity: 0.5, marginBottom: '10px' }} />
            <p style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>ไม่มีรายการแจ้งเตือนในหมวดหมู่นี้</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isComplaint = item.type === 'complaint';
            const isIssue = item.type === 'bus_issue' || item.type === 'system_issue';
            const isAnn = item.type === 'announcement';

            return (
              <div
                key={item.id}
                className="panelCard"
                style={{
                  background: item.urgent ? 'var(--danger-bg)' : 'var(--card)',
                  border: `1.5px solid ${item.urgent ? 'var(--danger)' : 'var(--border)'}`,
                  borderRadius: '20px',
                  padding: '18px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Meta Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: isComplaint
                        ? 'rgba(239, 68, 68, 0.15)'
                        : isIssue
                        ? 'rgba(245, 158, 11, 0.15)'
                        : 'var(--wu-purple-bg)',
                      color: isComplaint
                        ? 'var(--danger)'
                        : isIssue
                        ? '#d97706'
                        : 'var(--wu-purple-light)'
                    }}>
                      {item.categoryLabel}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: '99px',
                      background: item.urgent ? 'var(--danger)' : 'var(--border)',
                      color: item.urgent ? '#fff' : 'var(--text)'
                    }}>
                      {item.status}
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={13} /> {item.time}
                  </span>
                </div>

                {/* Content Header & Body */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    background: isComplaint
                      ? 'rgba(239, 68, 68, 0.12)'
                      : isIssue
                      ? 'rgba(245, 158, 11, 0.12)'
                      : 'var(--wu-purple-bg)',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    {isComplaint && <AlertCircle size={20} color="var(--danger)" />}
                    {isIssue && <AlertTriangle size={20} color="#d97706" />}
                    {isAnn && <Bell size={20} color="var(--wu-purple-light)" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text)', lineHeight: 1.4 }}>
                      {item.title ? item.title.replace(/\(รถ\s+/g, '(') : ''}
                    </h3>
                    <p style={{ margin: '6px 0 0', fontSize: '14px', color: 'var(--text)', opacity: 0.88, lineHeight: 1.6 }}>
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Footer Metadata & Action */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px',
                  borderTop: '1px dashed var(--border)',
                  paddingTop: '10px',
                  marginTop: '4px'
                }}>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>
                    {item.location && <span>สถานที่: {item.location}</span>}
                    {item.target && <span style={{ marginLeft: item.location ? '12px' : 0 }}>เป้าหมาย: {item.target ? item.target.replace(/^รถ\s+/, '') : ''}</span>}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAction(item)}
                    className="secondaryBtn"
                    style={{
                      padding: '6px 14px',
                      fontSize: '12px',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: 'var(--wu-purple-light)',
                      borderColor: 'var(--wu-purple-light)'
                    }}
                  >
                    <span>ไปยังหน้ารายละเอียด</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
