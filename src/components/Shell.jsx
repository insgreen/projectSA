import React, { useState, useEffect } from 'react';
import { Sun, Moon, LogOut, Menu, X, Bell, BellOff, User, ShieldCheck, Clock, Key, ArrowRight, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import Brand from './Brand';
import { NotificationService } from '../data/dataStore';

export default function Shell({
  children,
  dark,
  setDark,
  logout,
  title,
  subtitle,
  navItems,
  active,
  setActive,
  userInfo,
  badgeText = null,
  onBellClick,
  onProfileClick,
  onSwitchToAdmin,
  reportNotifs = null,
  driverReports = null
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showQuickProfile, setShowQuickProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifFilter, setNotifFilter] = useState('all');
  const [notifications, setNotifications] = useState(() => NotificationService.getAllNotifications());

  useEffect(() => {
    const unsub = NotificationService.subscribeNotifications((items) => {
      setNotifications(items || []);
    });
    return () => unsub();
  }, []);

  // Passenger mode: show only resolved complaint notifications from their own reports
  const isPassengerMode = reportNotifs !== null;
  const isDriverMode = driverReports !== null;

  const resolvedReports = isPassengerMode
    ? (reportNotifs || []).filter((r) => r.status && r.status !== 'รอตรวจสอบ')
    : null;

  const driverAcceptedReports = isDriverMode
    ? (driverReports || []).filter((r) => r.status && r.status !== 'รอตรวจสอบ')
    : [];

  const complaints = notifications.filter((n) => n.type === 'complaint');
  const busIssues = notifications.filter((n) => n.type === 'bus_issue' || n.type === 'system_issue');
  const announcements = notifications.filter((n) => n.type === 'announcement');

  const pendingComplaints = (complaints || []).filter((c) => !c.status || c.status === 'รอตรวจสอบ');
  const resolvedComplaints = (complaints || []).filter((c) => c.status && c.status !== 'รอตรวจสอบ');

  // Urgent count for red dot:
  // - Passenger mode: all submitted reports
  // - Driver mode: complaints accepted/processed by admin from Firebase
  // - Admin mode: pending complaints waiting for review ONLY
  const urgentCount = isPassengerMode
    ? (reportNotifs || []).length
    : isDriverMode
    ? driverAcceptedReports.length
    : pendingComplaints.length;

  const filteredNotifications = (!isPassengerMode && !isDriverMode)
    ? complaints.filter((c) => {
        if (notifFilter === 'pending') return !c.status || c.status === 'รอตรวจสอบ';
        if (notifFilter === 'resolved') return c.status && c.status !== 'รอตรวจสอบ';
        return true;
      })
    : notifications.filter((n) => {
        if (notifFilter === 'complaint') return n.type === 'complaint';
        if (notifFilter === 'issue') return n.type === 'bus_issue' || n.type === 'system_issue';
        if (notifFilter === 'announcement') return n.type === 'announcement';
        return true;
      });

  const getAvatarInitials = () => {
    if (userInfo?.userName) {
      const parts = userInfo.userName.trim().split(/\s+/);
      const first = parts[0] ? parts[0].charAt(0).toUpperCase() : '';
      const last = parts[1] ? parts[1].charAt(0).toUpperCase() : '';
      if (first && last) return `${first}${last}`;
      if (first) return first;
    }
    if (userInfo?.roleLabel) {
      return userInfo.roleLabel.trim().slice(0, 2).toUpperCase();
    }
    return 'WU';
  };

  const avatarText = getAvatarInitials();

  return (
    <div className="appShell">
      {/* Sidebar Navigation */}
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sideTop">
          <Brand compact />
          <button
            className="closeMobile"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav>
          {navItems.map((n) => (
            <button
              key={n.id}
              className={active === n.id ? 'active' : ''}
              onClick={() => {
                setActive?.(n.id);
                setMobileOpen(false);
              }}
            >
              <n.icon size={20} />
              <span>{n.label}</span>
              {n.badge && <span className="navBadge">{n.badge}</span>}
            </button>
          ))}

        </nav>

        <div className="sideBottom">
          <button onClick={() => setDark(!dark)}>
            {dark ? <Sun size={19} /> : <Moon size={19} />}
            <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button onClick={logout} className="logoutBtn">
            <LogOut size={19} />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="sidebarOverlay"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Content Area */}
      <div className="mainArea">
        <header className="topbar">
          <div className="headerLeft">
            <button
              className="mobileMenu"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            <div className="headerTitles">
              <div className="titleRow">
                <h1>{title}</h1>
                {badgeText && (
                  <span className="liveStatusBadge">
                    <i className="pingDot" /> {badgeText}
                  </span>
                )}
              </div>
              <p>{subtitle}</p>
            </div>
          </div>

          <div className="topActions">
            <button
              type="button"
              className="complaintStatusTopBtn"
              title={isPassengerMode ? 'สถานะการร้องเรียน' : isDriverMode ? 'การร้องเรียน' : 'ตรวจสอบการร้องเรียน'}
              onClick={() => {
                if (onBellClick) {
                  onBellClick();
                } else {
                  setShowNotifications(true);
                }
              }}
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                height: '44px',
                padding: '0 16px',
                borderRadius: '14px',
                border: '1px solid var(--border)',
                background: 'var(--card)',
                color: 'var(--text)',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: 'var(--shadow)',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Bell size={18} />
                {urgentCount > 0 && (
                  <i
                    className="bellDot"
                    style={{
                      position: 'absolute',
                      top: '-3px',
                      right: '-3px',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: 'var(--danger)'
                    }}
                  />
                )}
              </div>
              <span>{isPassengerMode ? 'สถานะการร้องเรียน' : isDriverMode ? 'การร้องเรียน' : 'ตรวจสอบการร้องเรียน'}</span>
            </button>
            <button
              type="button"
              className="avatar"
              title="ข้อมูลส่วนตัวผู้ใช้"
              onClick={() => setShowQuickProfile(true)}
            >
              {avatarText}
            </button>
          </div>
        </header>

        <div className="workspaceInner">{children}</div>
      </div>

      {/* Quick Profile Modal Pop-up */}
      {showQuickProfile && (
        <div className="modalOverlay" onClick={() => setShowQuickProfile(false)}>
          <div
            className="modalCard"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '440px', width: '92%', padding: '24px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={22} color="var(--wu-purple-light)" />
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--text)' }}>
                  ข้อมูลส่วนตัวผู้ใช้งาน
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickProfile(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Profile Info Summary Box */}
            <div style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: '20px', padding: '18px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                <div style={{ width: '54px', height: '54px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--wu-purple-light), var(--wu-purple))', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '18px', flexShrink: 0, boxShadow: '0 4px 12px var(--wu-purple-glow)' }}>
                  {avatarText}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text)' }}>
                    {userInfo?.userName || userInfo?.roleLabel || 'ผู้ใช้งานระบบ มวล.'}
                  </h4>
                  <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>
                    {/*<Key size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />*/}
                    {userInfo?.userId || 'ไม่ระบุรหัส'} • {isDriverMode ? 'กำลังให้บริการ' : (userInfo?.userDept || 'มหาวิทยาลัยวลัยลักษณ์')}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: isDriverMode ? 'flex-end' : 'space-between', borderTop: '1px dashed var(--border)', paddingTop: '12px', marginTop: '10px' }}>
                {!isDriverMode && (
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--success)', background: 'var(--success-bg)', padding: '4px 10px', borderRadius: '99px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldCheck size={13} /> {userInfo?.userStatus || 'ยืนยันสิทธิ์สำเร็จ'}
                  </span>
                )}
                <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>
                  <Clock size={12} style={{ display: 'inline', marginRight: '3px', verticalAlign: '-1px' }} />
                  {userInfo?.loginTime ? `เข้าสู่ระบบ ${userInfo.loginTime}` : 'เซสชัน 15 นาที'}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                className="primaryBtn"
                onClick={() => {
                  setShowQuickProfile(false);
                  if (onProfileClick) {
                    onProfileClick();
                  } else {
                    setActive?.('profile');
                  }
                }}
                style={{ width: '100%', padding: '12px', borderRadius: '14px', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
              >
                <span>ดูหน้าโปรไฟล์</span>
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowQuickProfile(false);
                  logout?.();
                }}
                style={{ width: '100%', padding: '11px', borderRadius: '14px', border: '1.5px solid var(--border)', background: 'var(--bg)', color: 'var(--danger)', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
              >
                <LogOut size={16} /> ออกจากระบบ (Logout)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Center Modal Pop-up */}
      {showNotifications && (
        <div className="modalOverlay" onClick={() => setShowNotifications(false)}>
          <div
            className="modalCard"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '520px',
              width: '94%',
              maxHeight: '88vh',
              display: 'flex',
              flexDirection: 'column',
              padding: '24px',
              borderRadius: '24px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.35)'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, var(--wu-purple-light), var(--wu-purple))',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#fff',
                  boxShadow: '0 4px 14px var(--wu-purple-glow)',
                  flexShrink: 0
                }}>
                  <Bell size={22} />
                </div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--text)' }}>
                  {isPassengerMode ? 'สถานะการร้องเรียน' : isDriverMode ? 'การร้องเรียน' : 'ตรวจสอบการร้องเรียน'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNotifications(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Passenger mode: show own report status updates */}
            {isPassengerMode ? (
              <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                {resolvedReports.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '36px 12px', color: 'var(--muted)' }}>
                    <BellOff size={36} style={{ opacity: 0.5, marginBottom: '8px' }} />
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>ยังไม่มีการร้องเรียนที่ถูกดำเนินการ</p>
                    <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--muted)' }}>การแจ้งเตือนจะปรากฏเมื่อการร้องเรียนของคุณถูกตรวจสอบหรือแก้ไข</p>
                  </div>
                ) : (
                  resolvedReports.map((rep) => {
                    const statusColorMap = {
                      'ดำเนินการเรียบร้อยแล้ว': { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', label: 'ผู้ดูแลระบบดำเนินการเรียบร้อยแล้ว' },
                      'ส่งให้คนขับแก้ไข': { color: '#0284c7', bg: 'rgba(2, 132, 199, 0.1)', label: 'ผู้ดูแลระบบส่งให้คนขับแก้ไขแล้ว' },
                      'แก้ไขเรียบร้อย': { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', label: 'ดำเนินการแก้ไขเรียบร้อยแล้ว' },
                      'ตักเตือน/หักคะแนน': { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', label: 'ตักเตือนและหักคะแนนคนขับแล้ว' },
                    };
                    const s = statusColorMap[rep.status] || { color: 'var(--muted)', bg: 'var(--bg)', label: rep.status };
                    return (
                      <div
                        key={rep.id}
                        style={{
                          background: s.bg,
                          border: `1.5px solid ${s.color}`,
                          borderRadius: '16px',
                          padding: '14px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: s.color }}>{s.label}</span>
                          <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>#{rep.id}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>{rep.subject || rep.category}</p>
                        {rep.description && (
                          <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>{rep.description}</p>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            onClick={() => { setShowNotifications(false); setActive?.('report'); }}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '4px',
                              background: 'none', border: 'none', color: 'var(--wu-purple-light)',
                              fontSize: '12px', fontWeight: 700, cursor: 'pointer', padding: '4px 8px', borderRadius: '8px'
                            }}
                          >
                            <span>ดูรายละเอียด</span>
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : isDriverMode ? (
              <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                {driverAcceptedReports.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '36px 12px', color: 'var(--muted)' }}>
                    <CheckCircle2 size={36} color="var(--success)" style={{ opacity: 0.8, margin: '0 auto 8px', display: 'block' }} />
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>ไม่มีข้อร้องเรียนที่ได้รับ</p>
                    <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--muted)' }}>ไม่พบประวัติการถูกร้องเรียนสำหรับรถและข้อมูลการขับของคุณ</p>
                  </div>
                ) : (
                  driverAcceptedReports.map((rep) => {
                    const statusColorMap = {
                      'รอตรวจสอบ': { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)', label: 'รอการตรวจสอบจากผู้ดูแลระบบ' },
                      'ส่งให้คนขับแก้ไข': { color: '#0284c7', bg: 'rgba(2, 132, 199, 0.08)', label: 'ผู้ดูแลระบบส่งให้คนขับแก้ไข' },
                      'แก้ไขเรียบร้อย': { color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)', label: 'ดำเนินการแก้ไขเรียบร้อยแล้ว' },
                      'ดำเนินการเรียบร้อยแล้ว': { color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)', label: 'ผู้ดูแลระบบดำเนินการเรียบร้อยแล้ว' },
                      'ตักเตือน/หักคะแนน': { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)', label: 'ตักเตือนและหักคะแนน' },
                    };
                    const s = statusColorMap[rep.status] || { color: 'var(--muted)', bg: 'var(--bg)', label: rep.status || 'รอตรวจสอบ' };
                    return (
                      <div
                        key={rep.id}
                        style={{
                          background: s.bg,
                          border: `1.5px solid ${s.color}`,
                          borderRadius: '16px',
                          padding: '14px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: s.color }}>{s.label}</span>
                          <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>#{rep.id}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                          <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
                            {rep.category || 'ข้อร้องเรียน'}
                          </p>
                          <span style={{ fontSize: '11.5px', color: 'var(--muted)', fontWeight: 600 }}>
                            ป้ายทะเบียนรถ: {rep.busId || '-'}
                          </span>
                        </div>
                        {(rep.incidentDate || rep.incidentTime || rep.timestamp) && (
                          <div style={{ fontSize: '11.5px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} />
                            <span>เวลาเกิดเหตุ: {rep.incidentDate ? `${rep.incidentDate} ` : ''}{rep.incidentTime || rep.timestamp || ''}</span>
                          </div>
                        )}
                        {(rep.details || rep.description) && (
                          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text)', lineHeight: 1.5, background: 'var(--card)', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                            {rep.details || rep.description}
                          </p>
                        )}
                        {rep.adminNote && (
                          <div style={{ fontSize: '11.5px', color: 'var(--wu-purple-light)', background: 'rgba(124, 58, 237, 0.08)', padding: '6px 10px', borderRadius: '8px' }}>
                            <strong>ข้อความจากผู้ดูแลระบบ: </strong>{rep.adminNote}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              <>
                {/* Filter Tabs (admin/driver mode) */}
                <div style={{
                  display: 'flex',
                  gap: '6px',
                  overflowX: 'auto',
                  paddingBottom: '10px',
                  marginBottom: '12px',
                  borderBottom: '1px solid var(--border)'
                }}>
                  {[
                    { id: 'all', label: `ทั้งหมด (${complaints.length})` },
                    { id: 'pending', label: `รอตรวจสอบ (${pendingComplaints.length})` },
                    { id: 'resolved', label: `ดำเนินการแล้ว (${resolvedComplaints.length})` },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setNotifFilter(tab.id)}
                      style={{
                        padding: '7px 14px',
                        borderRadius: '99px',
                        fontSize: '12px',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        border: notifFilter === tab.id ? 'none' : '1px solid var(--border)',
                        background: notifFilter === tab.id ? 'var(--wu-purple)' : 'var(--bg)',
                        color: notifFilter === tab.id ? '#fff' : 'var(--muted)',
                        boxShadow: notifFilter === tab.id ? '0 4px 12px var(--wu-purple-glow)' : 'none'
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Notification Items List */}
                <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px', flex: 1 }}>
                  {filteredNotifications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '36px 12px', color: 'var(--muted)' }}>
                      <CheckCircle2 size={36} color="var(--success)" style={{ opacity: 0.8, margin: '0 auto 8px', display: 'block' }} />
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>ไม่มีรายการข้อร้องเรียน</p>
                      <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--muted)' }}>ไม่มีข้อร้องเรียนในหมวดหมู่นี้ในขณะนี้</p>
                    </div>
                  ) : (
                    filteredNotifications.map((n) => {
                      const isComplaint = n.type === 'complaint';
                      const isIssue = n.type === 'bus_issue' || n.type === 'system_issue';
                      const isAnn = n.type === 'announcement';

                      return (
                        <div
                          key={n.id}
                          style={{
                            background: n.urgent ? 'var(--danger-bg)' : 'var(--bg)',
                            border: `1.5px solid ${n.urgent ? 'var(--danger)' : 'var(--border)'}`,
                            borderRadius: '16px',
                            padding: '14px 16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{
                                fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px',
                                background: isComplaint ? 'rgba(239, 68, 68, 0.15)' : isIssue ? 'rgba(245, 158, 11, 0.15)' : 'var(--wu-purple-bg)',
                                color: isComplaint ? 'var(--danger)' : isIssue ? '#d97706' : 'var(--wu-purple-light)'
                              }}>
                                {n.categoryLabel}
                              </span>
                              <span style={{
                                fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '99px',
                                background: n.urgent ? 'var(--danger)' : 'var(--border)',
                                color: n.urgent ? '#fff' : 'var(--text)'
                              }}>
                                {n.status}
                              </span>
                            </div>
                            <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={12} /> {n.time}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                            <div style={{ marginTop: '2px', flexShrink: 0 }}>
                              {isComplaint && <AlertCircle size={18} color="var(--danger)" />}
                              {isIssue && <AlertTriangle size={18} color="#d97706" />}
                              {isAnn && <Bell size={18} color="var(--wu-purple-light)" />}
                            </div>
                            <div style={{ flex: 1 }}>
                              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: 'var(--text)', lineHeight: 1.4 }}>{n.title}</h4>
                              <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text)', opacity: 0.85, lineHeight: 1.5 }}>{n.description}</p>
                            </div>
                          </div>
                          {(n.location || n.target) && (
                            <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, borderTop: '1px dashed var(--border)', paddingTop: '6px' }}>
                              {n.target && <span style={{ marginLeft: '10px' }}>รถมันม่วงป้ายทะเบียน: {n.target}</span>}
                            </div>
                          )}
                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px' }}>
                            <button
                              type="button"
                              onClick={() => {
                                setShowNotifications(false);
                                const role = userInfo?.userType || (userInfo?.roleLabel?.includes('ผู้ดูแล') ? 'admin' : (userInfo?.roleLabel?.includes('คนขับ') ? 'driver' : 'passenger'));
                                if (role === 'admin') {
                                  if (isComplaint) setActive?.('reports');
                                  else if (isIssue) setActive?.('buses');
                                  else setActive?.('dashboard');
                                } else if (role === 'driver') {
                                  if (isComplaint) setActive?.('driver-reports');
                                  else setActive?.('driver-home');
                                }
                              }}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: '4px',
                                background: 'none', border: 'none', color: 'var(--wu-purple-light)',
                                fontSize: '12px', fontWeight: 700, cursor: 'pointer', padding: '4px 8px', borderRadius: '8px'
                              }}
                            >
                              <span>ไปยังหน้าจัดการ / ดูข้อมูล</span>
                              <ArrowRight size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Modal Footer for Admin navigation */}
                {!isPassengerMode && !isDriverMode && (
                  <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border)', marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNotifications(false);
                        setActive?.('reports');
                      }}
                      className="primaryBtn"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12.5px',
                        padding: '8px 16px',
                        borderRadius: '10px',
                        cursor: 'pointer'
                      }}
                    >
                      <span>ไปยังหน้าจัดการข้อร้องเรียนทั้งหมด</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
