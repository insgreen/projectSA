import React, { useState } from 'react';
import { User, LogOut, ShieldCheck, CircleAlert, CheckCircle2, Lock, X } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import { getStoredPassword, setStoredPassword } from '../data/routesData';
import { UserService, DriverService } from '../data/dataStore.js';
import BackButton from './BackButton';

export default function ProfilePage({ logout, dark, setDark, userInfo, setActive, onGoBack }) {
  const displayId = userInfo?.userId || 'ไม่ระบุรหัส';
  const displayName = userInfo?.userName || userInfo?.roleLabel || 'ผู้ใช้งานระบบ มวล.';
  const isDriver = userInfo?.role === 'driver' || userInfo?.roleLabel?.includes('คนขับ') || userInfo?.userDept === 'กำลังให้บริการ' || userInfo?.userDept?.includes('ประจำรถ');
  const displayDept = isDriver ? 'กำลังให้บริการ' : (userInfo?.userDept || 'มหาวิทยาลัยวลัยลักษณ์');
  const displayStatus = userInfo?.userStatus || 'ยืนยันสิทธิ์สำเร็จ (Verified)';

  const [showChangePwModal, setShowChangePwModal] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    // Fetch active password from Firestore first, then fallback to LocalStore / routesData
    let activePassword = getStoredPassword(displayId, '123456');
    const userFromStore = UserService.getAll().find((u) => String(u.id) === String(displayId));
    if (userFromStore?.password) {
      activePassword = userFromStore.password;
    }

    if (db) {
      try {
        const userSnap = await getDoc(doc(db, 'users', String(displayId)));
        if (userSnap.exists() && userSnap.data()?.password) {
          activePassword = userSnap.data().password;
        } else {
          const driverSnap = await getDoc(doc(db, 'drivers', String(displayId)));
          if (driverSnap.exists() && driverSnap.data()?.password) {
            activePassword = driverSnap.data().password;
          }
        }
      } catch (err) {
        console.warn('Firebase fetch password error:', err);
      }
    }

    if (!currentPw.trim()) {
      setPwError('กรุณากรอกรหัสผ่านปัจจุบัน');
      return;
    }

    if (currentPw.trim() !== activePassword) {
      setPwError('รหัสผ่านปัจจุบันไม่ถูกต้อง! กรุณาตรวจสอบอีกครั้ง');
      return;
    }

    if (newPw.length < 4) {
      setPwError('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 4 ตัวอักษร');
      return;
    }

    if (newPw === activePassword) {
      setPwError('รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านปัจจุบัน');
      return;
    }

    if (newPw !== confirmPw) {
      setPwError('รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    setIsSaving(true);
    try {
      // 1. Sync to Firebase Firestore directly
      if (db) {
        await setDoc(doc(db, 'users', String(displayId)), {
          password: newPw.trim(),
          updatedAt: new Date().toISOString()
        }, { merge: true });

        await setDoc(doc(db, 'drivers', String(displayId)), {
          password: newPw.trim(),
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }

      // 2. Sync to Central Local Store and LocalStorage
      setStoredPassword(displayId, newPw.trim());
      await UserService.update(displayId, { password: newPw.trim() });
      await DriverService.update(displayId, { password: newPw.trim() });

      setPwSuccess('เปลี่ยนรหัสผ่านสำเร็จเรียบร้อย! ซิงก์ข้อมูลไปยัง Firebase สำเร็จ');
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
      setTimeout(() => {
        setPwSuccess('');
        setShowChangePwModal(false);
      }, 2000);
    } catch (err) {
      console.error('Firebase save password error:', err);
      setPwError('เกิดข้อผิดพลาดในการบันทึกลง Firebase กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSaving(false);
    }
  };

  const getAvatarInitials = () => {
    if (displayName) {
      const parts = displayName.trim().split(/\s+/);
      const first = parts[0] ? parts[0].charAt(0).toUpperCase() : '';
      const last = parts[1] ? parts[1].charAt(0).toUpperCase() : '';
      if (first && last) return `${first}${last}`;
      if (first) return first;
    }
    return 'WU';
  };

  const avatarText = getAvatarInitials();

  return (
    <div className="contentPage">
      <BackButton onClick={onGoBack || (() => setActive?.('home'))} label="ย้อนกลับ" />
      <div className="pageIntro">
        <span className="heroBadge">USER PROFILE</span>
        <h2>โปรไฟล์ผู้ใช้ & ตั้งค่า</h2>
      </div>

      <div className="profileCard">
        {/* Logged in User Header */}
        <div className="profileHeader">
          <div className="profileAvatar">
            {avatarText}
          </div>
          <div className="profileInfo">
            <h3>{displayName}</h3>
            <p>
              {/*<Key size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />*/}
              รหัสประจำตัว: <strong>{displayId}</strong> • {displayDept}
            </p>
            {!isDriver && (
              <span className="userRoleTag">
                <ShieldCheck size={12} /> {displayStatus}
              </span>
            )}
          </div>
        </div>

        {/* Security & Password Section */}
        <div className="settingsSection">
          <div className="settingItem">
            <div className="settingText">
              <strong>เปลี่ยนรหัสผ่าน</strong>
            </div>
            <button
              className="changePwTriggerBtn"
              onClick={() => setShowChangePwModal(!showChangePwModal)}
            >
              <Lock size={15} /> {showChangePwModal ? 'ซ่อนแบบฟอร์ม' : 'เปลี่ยนรหัสผ่าน'}
            </button>
          </div>

          {showChangePwModal && (
            <div className="modalOverlay" onClick={() => setShowChangePwModal(false)}>
              <div className="modalCard changePasswordModal" onClick={(e) => e.stopPropagation()}>
                <div className="modalHeader" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ padding: '8px', borderRadius: '12px', background: 'var(--wu-purple-subtle)', color: 'var(--wu-purple-light)', display: 'grid', placeItems: 'center' }}>
                      <Lock size={20} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--text)' }}>เปลี่ยนรหัสผ่านเข้าใช้งาน</h3>
                      <small style={{ color: 'var(--muted)', fontSize: '12px' }}>อัปเดตรหัสผ่านใหม่เพื่อความปลอดภัยของบัญชีผู้ใช้</small>
                    </div>
                  </div>
                  <button type="button" onClick={() => setShowChangePwModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '4px', borderRadius: '50%' }}>
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleChangePassword} className="changePasswordFormModal">
                  {pwError && (
                    <div className="formError" style={{ marginBottom: '10px' }}>
                      <CircleAlert size={16} /> <span>{pwError}</span>
                    </div>
                  )}
                  {pwSuccess && (
                    <div className="formSuccess" style={{ marginBottom: '10px' }}>
                      <CheckCircle2 size={16} /> <span>{pwSuccess}</span>
                    </div>
                  )}
                  <label>
                    <span>รหัสผ่านปัจจุบัน</span>
                    <input
                      type="password"
                      value={currentPw}
                      onChange={(e) => setCurrentPw(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </label>
                  <label>
                    <span>รหัสผ่านใหม่</span>
                    <input
                      type="password"
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      placeholder="อย่างน้อย 4 ตัวอักษร..."
                      required
                    />
                  </label>
                  <label>
                    <span>ยืนยันรหัสผ่านใหม่</span>
                    <input
                      type="password"
                      value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                      placeholder="กรอกรหัสผ่านใหม่อีกครั้ง..."
                      required
                    />
                  </label>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                    <button
                      type="button"
                      className="cancelModalBtn"
                      onClick={() => setShowChangePwModal(false)}
                      style={{ flex: '0 0 90px' }}
                    >
                      ยกเลิก
                    </button>
                    <button type="submit" className="saveNewPwBtn" disabled={isSaving} style={{ flex: 1, marginTop: 0 }}>
                      <ShieldCheck size={16} /> {isSaving ? 'กำลังเชื่อมต่อ Firebase...' : 'ยืนยันเปลี่ยนรหัสผ่าน'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Logout Action */}
        <div className="settingsSection">
          <button className="logoutBtnInline" onClick={logout}>
            <LogOut size={18} /> ออกจากระบบ
          </button>
        </div>
      </div>
    </div>
  );
}
