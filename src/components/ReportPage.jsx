import React, { useState } from 'react';
import {
  Flag, CheckCircle2, ShieldCheck, Clock, ArrowRightLeft,
  AlertTriangle, Edit3, Lock, ShieldAlert, UserCheck, X,
  Send, Eye, Sparkles, MapPin, Bus, Trash2, Calendar
} from 'lucide-react';
import BackButton from './BackButton';
import { ReportService, findDriverForBusAtTime } from '../data/dataStore';

export default function ReportPage({
  onReportSubmit,
  onUpdateReport,
  onDeleteReport,
  reports = [],
  userInfo,
  buses = [],
  selectedBusId,
  setActive,
  onGoBack
}) {
  const [activeTab, setActiveTab] = useState('submit'); // 'submit' | 'tracking'
  const [busId, setBusId] = useState(selectedBusId || 'WU-101');

  React.useEffect(() => {
    if (selectedBusId) {
      setBusId(selectedBusId);
      setActiveTab('submit');
    }
  }, [selectedBusId]);

  const getTodayDate = () => new Date().toISOString().split('T')[0];
  const getCurrentTime = () => new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false });

  const [category, setCategory] = useState('ไม่จอดรับผู้โดยสาร');
  const [incidentDate, setIncidentDate] = useState(getTodayDate());
  const [incidentTime, setIncidentTime] = useState(getCurrentTime());
  const [details, setDetails] = useState('');
  const [submittedId, setSubmittedId] = useState(null);

  // Edit modal state
  const [editingReport, setEditingReport] = useState(null);
  const [editBusId, setEditBusId] = useState('WU-101');
  const [editCategory, setEditCategory] = useState('');
  const [editIncidentDate, setEditIncidentDate] = useState(getTodayDate());
  const [editIncidentTime, setEditIncidentTime] = useState(getCurrentTime());
  const [editDetails, setEditDetails] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const currentUserId = userInfo?.userId || userInfo?.id || '68108596';
  const currentUserName = userInfo?.userName || userInfo?.name || 'ผู้ใช้งานระบบ มวล.';
  const currentUserDept = userInfo?.userDept || userInfo?.department || userInfo?.faculty || 'มหาวิทยาลัยวลัยลักษณ์';
  const currentUserRole = userInfo?.roleLabel || userInfo?.role || 'นักศึกษา';

  // Filter reports submitted by current user ONLY (cannot see others' reports)
  const myReports = reports.filter(
    (r) => String(r.userId) === String(currentUserId) || (r.userName && r.userName === currentUserName)
  );

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newId = `REP-${Math.floor(100 + Math.random() * 900)}`;

    // Automatically resolve driver from schedule roster matching busId, date, and time
    const resolvedDriver = findDriverForBusAtTime(busId, incidentDate, incidentTime);
    const dateFormatted = new Date(incidentDate).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    const timeFormatted = `${incidentTime} น.`;

    const newRep = {
      id: newId,
      busId,
      driverId: resolvedDriver.driverId || '',
      driverName: resolvedDriver.driverName || 'พนักงานขับรถ มวล.',
      userId: currentUserId,
      userName: currentUserName,
      userDept: currentUserDept,
      userRole: currentUserRole,
      category,
      incidentDate,
      incidentTime,
      timestamp: `${dateFormatted} • ${timeFormatted}`,
      location: 'มหาวิทยาลัยวลัยลักษณ์',
      details,
      scoreImpact: category === 'ขับรถเร็ว' ? -5 : -3,
      status: 'รอตรวจสอบ',
      adminNote: '',
      driverResponse: '',
      createdAt: new Date().toISOString()
    };

    onReportSubmit?.(newRep);
    setSubmittedId(newId);
    showToast(`ส่งข้อร้องเรียน #${newId} เรียบร้อยแล้ว (เชื่อมต่อข้อมูลคนขับอัตโนมัติแล้ว)`);
  };

  const handleOpenEdit = (report) => {
    if (report.status !== 'รอตรวจสอบ') {
      alert('ไม่สามารถแก้ไขได้เนื่องจากผู้ดูแลระบบได้ดำเนินการแล้ว');
      return;
    }
    setEditingReport(report);
    setEditBusId(report.busId || 'WU-101');
    setEditCategory(report.category);
    setEditIncidentDate(report.incidentDate || getTodayDate());
    setEditIncidentTime(report.incidentTime || getCurrentTime());
    setEditDetails(report.details);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingReport) return;

    // Re-resolve driver based on edited busId, date, time
    const resolvedDriver = findDriverForBusAtTime(editBusId, editIncidentDate, editIncidentTime);
    const dateFormatted = new Date(editIncidentDate).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    const timeFormatted = `${editIncidentTime} น.`;

    await onUpdateReport?.(editingReport.id, {
      busId: editBusId,
      driverId: resolvedDriver.driverId || editingReport.driverId || '',
      driverName: resolvedDriver.driverName || editingReport.driverName || 'พนักงานขับรถ มวล.',
      category: editCategory,
      incidentDate: editIncidentDate,
      incidentTime: editIncidentTime,
      timestamp: `${dateFormatted} • ${timeFormatted}`,
      details: editDetails
    });

    showToast(`แก้ไขข้อร้องเรียน #${editingReport.id} สำเร็จ`);
    setEditingReport(null);
  };

  const handleDeleteReport = async (repId) => {
    if (window.confirm(`ยืนยันการยกเลิกข้อร้องเรียน #${repId} ใช่หรือไม่?`)) {
      if (onDeleteReport) {
        await onDeleteReport(repId);
      } else {
        await ReportService.delete(repId);
      }
      showToast(`ยกเลิกข้อร้องเรียน #${repId} เรียบร้อยแล้ว`);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'รอตรวจสอบ':
        return {
          label: 'รอตรวจสอบ (ยังไม่ดำเนินการ)',
          color: '#eab308',
          bg: 'rgba(234, 179, 8, 0.12)',
          icon: Clock,
          canEdit: true
        };
      case 'ดำเนินการเรียบร้อยแล้ว':
      case 'แก้ไขเรียบร้อย':
        return {
          label: 'ดำเนินการเรียบร้อยแล้ว',
          color: '#10b981',
          bg: 'rgba(16, 185, 129, 0.12)',
          icon: CheckCircle2,
          canEdit: false
        };
      case 'ส่งให้คนขับแก้ไข':
        return {
          label: 'ดำเนินการเรียบร้อยแล้ว',
          color: '#10b981',
          bg: 'rgba(16, 185, 129, 0.12)',
          icon: CheckCircle2,
          canEdit: false
        };
      case 'ตักเตือน/หักคะแนน':
        return {
          label: 'ตักเตือนและหักคะแนนคนขับแล้ว',
          color: '#ef4444',
          bg: 'rgba(239, 68, 68, 0.12)',
          icon: AlertTriangle,
          canEdit: false
        };
      default:
        return {
          label: status || 'รอตรวจสอบ',
          color: '#eab308',
          bg: 'rgba(234, 179, 8, 0.12)',
          icon: Clock,
          canEdit: status === 'รอตรวจสอบ'
        };
    }
  };

  return (
    <div className="contentPage">
      <BackButton onClick={onGoBack || (() => setActive?.('home'))} label="ย้อนกลับ" />

      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          background: 'var(--card)',
          color: 'var(--text)',
          border: '2px solid var(--wu-purple-light)',
          padding: '14px 20px',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 9999,
          fontWeight: 700,
          fontSize: '13.5px'
        }}>
          <Sparkles size={18} color="var(--wu-purple-light)" />
          {toastMessage}
        </div>
      )}

      <div className="pageIntro">
        <span className="heroBadge">INCIDENT RESOLUTION LIFECYCLE</span>
        <h2>ร้องเรียน / แจ้งปัญหา</h2>
        <p>ส่งข้อร้องเรียน และติดตามสถานะความคืบหน้า</p>
      </div>

      {/* TABS SELECTOR */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', marginTop: '20px', flexWrap: 'wrap' }}>
        <button
          onClick={() => { setActiveTab('submit'); setSubmittedId(null); }}
          style={{
            padding: '10px 22px',
            borderRadius: '99px',
            border: `2px solid ${activeTab === 'submit' ? 'var(--wu-purple-light)' : 'var(--border)'}`,
            background: activeTab === 'submit' ? 'var(--wu-purple-light)' : 'var(--card)',
            color: activeTab === 'submit' ? '#ffffff' : 'var(--text)',
            fontWeight: 800,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: activeTab === 'submit' ? '0 4px 14px rgba(92, 6, 140, 0.25)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <Flag size={16} /> ส่งข้อร้องเรียนใหม่
        </button>

        <button
          onClick={() => setActiveTab('tracking')}
          style={{
            padding: '10px 22px',
            borderRadius: '99px',
            border: `2px solid ${activeTab === 'tracking' ? 'var(--wu-purple-light)' : 'var(--border)'}`,
            background: activeTab === 'tracking' ? 'var(--wu-purple-light)' : 'var(--card)',
            color: activeTab === 'tracking' ? '#ffffff' : 'var(--text)',
            fontWeight: 800,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: activeTab === 'tracking' ? '0 4px 14px rgba(92, 6, 140, 0.25)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <Eye size={16} /> ติดตามสถานะข้อร้องเรียน ({myReports.length})
        </button>
      </div>

      {/* TAB 1: SUBMIT COMPLAINT FORM */}
      {activeTab === 'submit' && (
        <div className="reportFormCard">

          {submittedId ? (
            <div className="reportSuccessNotice">
              <CheckCircle2 size={54} color="var(--success)" style={{ margin: '0 auto 12px' }} />
              <h3>ส่งข้อร้องเรียนเรียบร้อยแล้ว (#{submittedId})</h3>
              <p style={{ maxWidth: '480px', margin: '0 auto 20px', color: 'var(--muted)', fontSize: '13.5px', lineHeight: 1.6 }}>
                ระบบได้ส่งเรื่องร้องเรียนไปยัง<strong>ผู้ดูแลระบบ</strong>เรียบร้อยแล้ว คุณสามารถตรวจสอบสถานะ หรือแก้ไขเนื้อหาได้ตราบใดที่ผู้ดูแลระบบยังไม่ทำการตรวจสอบ
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="primaryBtn"
                  onClick={() => setActiveTab('tracking')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}
                >
                  <Eye size={16} /> ดูสถานะการร้องเรียนของฉัน
                </button>
                <button
                  type="button"
                  className="secondaryBtn"
                  onClick={() => {
                    setSubmittedId(null);
                    setDetails('');
                  }}
                  style={{ padding: '10px 20px' }}
                >
                  ส่งเรื่องอื่นเพิ่มเติม
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="reportFormRow">
                <label>
                  <span>ป้ายทะเบียนรถ</span>
                  <select value={busId} onChange={(e) => setBusId(e.target.value)}>
                    {buses.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.id}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>หมวดหมู่ข้อร้องเรียน</span>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="ไม่จอดรับผู้โดยสาร">ไม่จอดรับผู้โดยสารที่จุดจอด</option>
                    <option value="ขับรถเร็ว">ขับรถเร็วเกินกำหนด</option>
                    <option value="พฤติกรรมไม่สุภาพ">พนักงานขับรถพูดจาไม่สุภาพ</option>
                    <option value="ขับขี่ประมาท">ขับขี่ปาดหน้า/หวาดเสียว</option>
                    <option value="การปิดประตูกระชั้นชิด">ปิดประตูก่อนผู้โดยสารก้าวพ้น</option>
                    <option value="อื่น ๆ">อื่น ๆ</option>
                  </select>
                </label>
              </div>

              <div className="reportFormRow" style={{ marginTop: '14px' }}>
                <label>
                  <span>วันที่เกิดเหตุ</span>
                  <input
                    type="date"
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    required
                  />
                </label>

                <label>
                  <span>เวลาที่เกิดเหตุ</span>
                  <input
                    type="time"
                    value={incidentTime}
                    onChange={(e) => setIncidentTime(e.target.value)}
                    required
                  />
                </label>
              </div>

              <label>
                <span>เหตุการณ์ที่เกิดขึ้น/สิ่งที่ต้องการให้แก้ไข</span>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={4}
                  placeholder="อธิบายเหตุการณ์ที่เกิดขึ้น/สิ่งที่ต้องการให้แก้ไข..."
                  required
                />
              </label>

              <button type="submit" className="submitReportBtn">
                <Flag size={18} /> ยืนยันการร้องเรียน
              </button>
            </form>
          )}
        </div>
      )}

      {/* TAB 2: TRACK STATUS & EDIT */}
      {activeTab === 'tracking' && (
        <div style={{ width: '100%' }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {myReports.length > 0 ? (
              myReports.map((rep) => {
                const badge = getStatusBadge(rep.status);
                const StatusIcon = badge.icon;
                const canEdit = rep.status === 'รอตรวจสอบ';

                return (
                  <div
                    key={rep.id}
                    style={{
                      background: 'var(--card)',
                      borderRadius: '20px',
                      border: '1.5px solid var(--border)',
                      padding: '22px',
                      boxShadow: 'var(--shadow)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {/* Top Row: ID, Bus, Status Badge */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      flexWrap: 'wrap',
                      gap: '12px',
                      paddingBottom: '14px',
                      borderBottom: '1px solid var(--border)',
                      marginBottom: '14px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span style={{
                          fontWeight: 800,
                          fontSize: '15px',
                          color: 'var(--wu-purple-light)'
                        }}>
                          #{rep.id}
                        </span>
                        <span style={{
                          background: 'var(--wu-purple)',
                          color: '#ffffff',
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '3px 10px',
                          borderRadius: '99px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <Bus size={12} /> {rep.busId}
                        </span>
                        <strong style={{ fontSize: '14px', color: 'var(--text)' }}>
                          {rep.category}
                        </strong>
                      </div>

                      <div style={{
                        background: badge.bg,
                        color: badge.color,
                        padding: '6px 14px',
                        borderRadius: '99px',
                        fontSize: '12px',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        border: `1.5px solid ${badge.color}40`
                      }}>
                        <StatusIcon size={14} />
                        {badge.label}
                      </div>
                    </div>

                    {/* Complaint details */}
                    <div style={{ fontSize: '13px', color: 'var(--text)', marginBottom: '14px', marginTop: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--muted)', marginBottom: '6px', fontSize: '12px' }}>
                        <Clock size={14} color="var(--wu-purple-light)" />
                        เวลาที่แจ้ง: <strong>{rep.timestamp}</strong>
                      </div>
                      <div style={{
                        background: 'var(--bg)',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        borderLeft: '4px solid var(--wu-purple-light)',
                        lineHeight: 1.5
                      }}>
                        "{rep.details}"
                      </div>
                    </div>

                    {/* Admin Response Note */}
                    {rep.adminNote && (
                      <div style={{
                        background: 'rgba(2, 132, 199, 0.08)',
                        border: '1.5px solid rgba(2, 132, 199, 0.25)',
                        borderRadius: '14px',
                        padding: '12px 16px',
                        marginBottom: '10px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px'
                      }}>
                        <ShieldAlert size={18} color="#0284c7" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div style={{ fontSize: '12.5px' }}>
                          <strong style={{ color: '#0284c7' }}>บันทึก/คำสั่งจากผู้ดูแลระบบ:</strong>
                          <div style={{ color: 'var(--text)', marginTop: '2px', lineHeight: 1.5 }}>
                            {rep.adminNote}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Driver Resolution Note */}
                    {rep.driverResponse && (
                      <div style={{
                        background: 'rgba(16, 185, 129, 0.08)',
                        border: '1.5px solid rgba(16, 185, 129, 0.25)',
                        borderRadius: '14px',
                        padding: '12px 16px',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px'
                      }}>
                        <UserCheck size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div style={{ fontSize: '12.5px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ color: '#10b981' }}>การชี้แจงและผลการแก้ไขจากพนักงานขับรถ:</strong>
                            {rep.driverResolvedAt && (
                              <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                                ({rep.driverResolvedAt})
                              </span>
                            )}
                          </div>
                          <div style={{ color: 'var(--text)', marginTop: '3px', lineHeight: 1.5 }}>
                            "{rep.driverResponse}"
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Footer Actions: Edit and Cancel buttons if pending, or locked notice */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '12px',
                      borderTop: '1px solid var(--border)',
                      flexWrap: 'wrap',
                      gap: '10px'
                    }}>
                      <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                        คนขับประจำรถ: <strong>{rep.driverName || 'พนักงานขับรถ มวล.'}</strong>
                      </div>

                      {canEdit ? (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(rep)}
                            className="secondaryBtn"
                            style={{
                              padding: '7px 14px',
                              fontSize: '12.5px',
                              borderRadius: '10px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              color: 'var(--wu-purple-light)',
                              borderColor: 'var(--wu-purple-light)'
                            }}
                          >
                            <Edit3 size={14} /> แก้ไขข้อร้องเรียน
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteReport(rep.id)}
                            style={{
                              padding: '7px 14px',
                              fontSize: '12.5px',
                              borderRadius: '10px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              color: 'var(--danger)',
                              border: '1px solid rgba(239, 68, 68, 0.4)',
                              background: 'rgba(239, 68, 68, 0.08)',
                              cursor: 'pointer',
                              fontWeight: 700
                            }}
                          >
                            <Trash2 size={14} /> ยกเลิกการร้องเรียน
                          </button>
                        </div>
                      ) : (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '12px',
                          color: 'var(--muted)',
                          background: 'var(--bg)',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--border)'
                        }}>
                          <Lock size={13} /> ดำเนินการแล้ว (ไม่สามารถแก้ไขหรือยกเลิกได้)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{
                background: 'var(--card)',
                borderRadius: '20px',
                border: '1.5px solid var(--border)',
                padding: '40px 20px',
                textAlign: 'center'
              }}>
                <CheckCircle2 size={46} color="var(--muted)" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ margin: '0 0 6px', fontSize: '16px', color: 'var(--text)' }}>
                  ยังไม่มีประวัติข้อร้องเรียน
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)' }}>
                  เมื่อคุณส่งข้อร้องเรียน ระบบจะแสดงรายการและสถานะการตรวจสอบแบบเรียลไทม์ที่นี่
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* EDIT COMPLAINT MODAL (User can edit if admin hasn't reviewed yet) */}
      {editingReport && (
        <div className="modalOverlay" onClick={() => setEditingReport(null)}>
          <div
            className="modalCard"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '500px', width: '92%' }}
          >
            <div className="modalHeader" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={20} color="var(--wu-purple-light)" />
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
                  แก้ไขข้อร้องเรียน #{editingReport.id}
                </h3>
              </div>
              <button
                onClick={() => setEditingReport(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{
              background: 'rgba(234, 179, 8, 0.1)',
              border: '1px solid rgba(234, 179, 8, 0.3)',
              borderRadius: '12px',
              padding: '10px 14px',
              fontSize: '12px',
              color: 'var(--text)',
              marginBottom: '16px'
            }}>
              คุณสามารถแก้ไขข้อมูลได้เนื่องจาก<strong>ผู้ดูแลระบบยังไม่ได้ดำเนินการตรวจสอบ</strong> ข้อมูลที่แก้ไขจะถูกส่งต่อเข้าสู่ระบบกลางทันที
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <label className="fieldLabel">
                <span>ป้ายทะเบียนรถ</span>
                <select
                  value={editBusId}
                  onChange={(e) => setEditBusId(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)' }}
                >
                  {buses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.id}
                    </option>
                  ))}
                </select>
              </label>

              <label className="fieldLabel">
                <span>หมวดหมู่ข้อร้องเรียน</span>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)' }}
                >
                  <option value="ไม่จอดรับผู้โดยสาร">ไม่จอดรับผู้โดยสารที่จุดจอด</option>
                  <option value="ขับรถเร็ว">ขับรถเร็วเกินกำหนด</option>
                  <option value="พฤติกรรมไม่สุภาพ">พนักงานขับรถพูดจาไม่สุภาพ</option>
                  <option value="ขับขี่ประมาท">ขับขี่ปาดหน้า/หวาดเสียว</option>
                  <option value="การปิดประตูกระชั้นชิด">ปิดประตูก่อนผู้โดยสารก้าวพ้น</option>
                  <option value="อื่น ๆ">อื่น ๆ</option>
                </select>
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label className="fieldLabel">
                  <span>วันที่เกิดเหตุ</span>
                  <input
                    type="date"
                    value={editIncidentDate}
                    onChange={(e) => setEditIncidentDate(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)' }}
                  />
                </label>

                <label className="fieldLabel">
                  <span>เวลาที่เกิดเหตุ</span>
                  <input
                    type="time"
                    value={editIncidentTime}
                    onChange={(e) => setEditIncidentTime(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)' }}
                  />
                </label>
              </div>

              <label className="fieldLabel">
                <span>รายละเอียดเหตุการณ์</span>
                <textarea
                  rows={4}
                  value={editDetails}
                  onChange={(e) => setEditDetails(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)' }}
                />
              </label>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingReport(null)}
                  className="secondaryBtn"
                  style={{ flex: 1, padding: '10px' }}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="primaryBtn"
                  style={{ flex: 1, padding: '10px' }}
                >
                  บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
