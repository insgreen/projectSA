import React, { useState } from 'react';
import {
  Sun, Moon, User, ShieldCheck, Eye, EyeOff, CircleAlert, CheckCircle2,
  ChevronRight, Lock, X, Gauge, Shield, Users
} from 'lucide-react';
import Brand from './Brand';
import {
  MOCK_STUDENTS,
  MOCK_STAFF,
  MOCK_DRIVERS,
  MOCK_ADMINS,
  getStoredPassword,
  setStoredPassword
} from '../data/routesData';
import { UserService, DriverService } from '../data/dataStore';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function LoginPage({ role: propRole, setRole: propSetRole, onLogin, dark, setDark }) {
  // Main Role: 'user' | 'driver' | 'admin'
  const [mainRole, setMainRole] = useState('user');
  // Sub-category for User: 'student' | 'staff' | 'guest'
  const [userCategory, setUserCategory] = useState('student');

  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [successToast, setSuccessToast] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Reset Password Modal State
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetId, setResetId] = useState('');
  const [resetNewPw, setResetNewPw] = useState('');
  const [resetConfirmPw, setResetConfirmPw] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Lockout Countdown Timer
  React.useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  // Configurations according to Role & Category
  const getRoleConfig = () => {
    if (mainRole === 'admin') {
      return {
        label: 'ผู้ดูแลระบบ (Admin)',
        placeholder: 'รหัสผู้ดูแลระบบ (เช่น admin หรือ ADMIN-01)',
        len: 20,
        hint: 'กรุณากรอกรหัสหรือชื่อผู้ดูแลระบบ',
        defaultDemoId: 'admin',
        defaultDemoPw: 'admin',
        isNumericOnly: false
      };
    }

    if (mainRole === 'driver') {
      return {
        label: 'คนขับรถมันม่วง (Driver)',
        placeholder: 'รหัสคนขับ 6 หลัก (เช่น 600101)',
        len: 6,
        hint: 'กรุณากรอกรหัสคนขับ 6 หลัก',
        defaultDemoId: '600101',
        defaultDemoPw: '123456',
        isNumericOnly: true
      };
    }

    // User sub-categories
    if (userCategory === 'student') {
      return {
        label: 'นักศึกษา (Student)',
        placeholder: 'รหัสนักศึกษา 8 หลัก (เช่น 68108596)',
        len: 8,
        hint: 'กรุณากรอกรหัสนักศึกษา 8 หลัก',
        defaultDemoId: '68108596',
        defaultDemoPw: '123456',
        isNumericOnly: true
      };
    } else if (userCategory === 'staff') {
      return {
        label: 'บุคลากรภายในมหาลัย (Staff)',
        placeholder: 'เลขบัตรประชาชน / รหัสบุคลากร 13 หลัก',
        len: 13,
        hint: 'กรุณากรอกเลขบัตรประชาชน 13 หลัก',
        defaultDemoId: '1809900123456',
        defaultDemoPw: '123456',
        isNumericOnly: true
      };
    } else {
      return {
        label: 'บุคคลภายนอก (Guest/Visitor)',
        placeholder: 'เลขบัตรประชาชน 13 หลัก (เช่น 1100500987654)',
        len: 13,
        hint: 'กรุณากรอกเลขบัตรประชาชน 13 หลัก',
        defaultDemoId: '1100500987654',
        defaultDemoPw: '123456',
        isNumericOnly: true
      };
    }
  };

  const roleConfig = getRoleConfig();

  const handleMainRoleChange = (newMain) => {
    setMainRole(newMain);
    setId('');
    setPw('');
    setError('');
    setSuccessToast('');
  };

  const handleCategoryChange = (newCat) => {
    setUserCategory(newCat);
    setId('');
    setPw('');
    setError('');
    setSuccessToast('');
  };

  const handleQuickFill = (demoId, demoPw) => {
    setId(demoId);
    setPw(demoPw);
    setError('');
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    const trimmedId = resetId.trim();
    const trimmedPw = resetNewPw.trim();

    if (!trimmedId) {
      setResetError('กรุณากรอกรหัสประจำตัว / ชื่อผู้ใช้');
      return;
    }

    if (trimmedPw.length < 4) {
      setResetError('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 4 ตัวอักษร');
      return;
    }

    if (trimmedPw !== resetConfirmPw.trim()) {
      setResetError('รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    setIsResetting(true);
    try {
      let targetName = '';
      let isSyncedToFirebase = false;

      if (db) {
        // 1. Try finding in 'users' collection
        const userRef = doc(db, 'users', trimmedId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          targetName = userSnap.data().name || trimmedId;
          await setDoc(userRef, {
            password: trimmedPw,
            updatedAt: new Date().toISOString()
          }, { merge: true });
          isSyncedToFirebase = true;
        } else {
          // 2. Try finding in 'drivers' collection
          const driverRef = doc(db, 'drivers', trimmedId);
          const driverSnap = await getDoc(driverRef);

          if (driverSnap.exists()) {
            targetName = driverSnap.data().name || trimmedId;
            await setDoc(driverRef, {
              password: trimmedPw,
              updatedAt: new Date().toISOString()
            }, { merge: true });
            isSyncedToFirebase = true;
          } else if (trimmedId.toLowerCase() === 'admin' || trimmedId.toLowerCase() === 'admin-01') {
            targetName = 'ผู้ดูแลระบบ';
            await setDoc(userRef, {
              id: trimmedId,
              name: 'ผู้ดูแลระบบ',
              userType: 'admin',
              roleLabel: 'ผู้ดูแลระบบ (Admin)',
              password: trimmedPw,
              updatedAt: new Date().toISOString()
            }, { merge: true });
            isSyncedToFirebase = true;
          } else {
            await setDoc(userRef, {
              id: trimmedId,
              password: trimmedPw,
              updatedAt: new Date().toISOString()
            }, { merge: true });
            isSyncedToFirebase = true;
          }
        }
      }

      // Also sync locally
      setStoredPassword(trimmedId, trimmedPw);
      await UserService.update(trimmedId, { password: trimmedPw });
      await DriverService.update(trimmedId, { password: trimmedPw });

      if (isSyncedToFirebase) {
        setResetSuccess(`เปลี่ยนรหัสผ่านใหม่และซิงก์ Firebase Firestore สำเร็จเรียบร้อยแล้ว${targetName ? ` (${targetName})` : ''}`);
      } else {
        setResetSuccess('เปลี่ยนรหัสผ่านใหม่เรียบร้อยแล้ว');
      }

      setTimeout(() => {
        setResetSuccess('');
        setShowResetModal(false);
        setResetId('');
        setResetNewPw('');
        setResetConfirmPw('');
      }, 2000);
    } catch (err) {
      console.warn('Firebase reset password error, falling back locally:', err);
      setStoredPassword(trimmedId, trimmedPw);
      UserService.update(trimmedId, { password: trimmedPw });
      DriverService.update(trimmedId, { password: trimmedPw });
      setResetSuccess('เปลี่ยนรหัสผ่านใหม่เรียบร้อยแล้ว');
      setTimeout(() => {
        setResetSuccess('');
        setShowResetModal(false);
        setResetId('');
        setResetNewPw('');
        setResetConfirmPw('');
      }, 2000);
    } finally {
      setIsResetting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessToast('');

    if (lockoutSeconds > 0) {
      setError(`แจ้งเตือน: ระงับการเข้าสู่ระบบชั่วคราว! กรุณารอ ${lockoutSeconds} วินาทีก่อนลองใหม่อีกครั้ง`);
      return;
    }

    if (!id.trim()) {
      setError(`แจ้งเตือน: กรุณากรอก${roleConfig.label}`);
      return;
    }

    const trimmedId = id.trim();
    const lowerId = trimmedId.toLowerCase();
    const loginTimeStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';
    const loginDateStr = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });

    // ======================================================================
    // 1. SMART ADMIN AUTHENTICATION
    // ตรวจสอบทั้งกรณีเลือกแท็บ Admin หรือกรอกชื่อ admin/ADMIN จากแท็บใดก็ตาม
    // ======================================================================
    const isAdminIntent = mainRole === 'admin' || lowerId === 'admin' || lowerId === 'admin-01' || lowerId.includes('admin');
    if (isAdminIntent) {
      let fbAdminPw = null;
      if (db) {
        try {
          const aDoc = await getDoc(doc(db, 'users', 'admin'));
          if (aDoc.exists() && aDoc.data().password) {
            fbAdminPw = aDoc.data().password;
          }
        } catch (e) {}
      }
      const foundAdmin = MOCK_ADMINS.find(
        (a) => a.id.toLowerCase() === lowerId
      ) || MOCK_ADMINS[0];

      const activeAdminPw = fbAdminPw || getStoredPassword(foundAdmin.id, foundAdmin.password || 'admin');

      // ยืดหยุ่นรหัสผ่าน Admin: รองรับรหัสผ่านที่ตั้งไว้, admin, 123456, 1234
      const isPwCorrect =
        pw.trim() === activeAdminPw ||
        pw.trim().toLowerCase() === 'admin' ||
        pw.trim() === '123456' ||
        pw.trim() === '1234' ||
        pw.trim() === 'password';

      if (!isPwCorrect) {
        setError('แจ้งเตือนการเข้าสู่ระบบไม่สำเร็จ: รหัสผ่านผู้ดูแลระบบไม่ถูกต้อง (ใช้รหัสผ่าน admin หรือ 123456)');
        return;
      }

      setFailedAttempts(0);
      setLockoutSeconds(0);
      setSuccessToast('เข้าสู่ระบบสำเร็จ ยินดีต้อนรับผู้ดูแลระบบ...');

      setTimeout(() => {
        onLogin('admin', {
          userId: foundAdmin.id,
          userName: foundAdmin.name,
          userDept: foundAdmin.department,
          userStatus: foundAdmin.status,
          roleLabel: foundAdmin.roleLabel,
          role: 'admin',
          loginTime: loginTimeStr,
          loginDate: loginDateStr
        });
      }, 500);
      return;
    }

    if (roleConfig.isNumericOnly && (!/^\d+$/.test(id) || id.length !== roleConfig.len)) {
      setError(`แจ้งเตือนการเข้าสู่ระบบไม่สำเร็จ: ${roleConfig.hint}`);
      return;
    }

    if (!pw.trim() || pw.length < 4) {
      setError('แจ้งเตือนการเข้าสู่ระบบไม่สำเร็จ: กรุณากรอกรหัสผ่านอย่างน้อย 4 ตัวอักษร');
      return;
    }

    // ======================================================================
    // 2. DRIVER AUTHENTICATION (คนขับรถ)
    // ======================================================================
    if (mainRole === 'driver') {
      let fbDriver = null;
      if (db) {
        try {
          const dDoc = await getDoc(doc(db, 'drivers', trimmedId));
          if (dDoc.exists()) {
            fbDriver = dDoc.data();
          }
        } catch (e) {}
      }
      const allDrivers = DriverService.getAll();
      const foundDriver = fbDriver || allDrivers.find((d) => String(d.id) === trimmedId) || MOCK_DRIVERS.find((d) => d.id === trimmedId);
      const activeDriverPw = fbDriver?.password || getStoredPassword(trimmedId, foundDriver?.password || '123456');

      if (!foundDriver || pw.trim() !== activeDriverPw) {
        const nextFailed = failedAttempts + 1;
        setFailedAttempts(nextFailed);
        if (nextFailed >= 3) {
          setLockoutSeconds(30);
          setFailedAttempts(0);
          setError('แจ้งเตือนการเข้าสู่ระบบไม่สำเร็จ: ระงับสิทธิ์ชั่วคราว 30 วินาที');
          return;
        }
        setError(`แจ้งเตือนการเข้าสู่ระบบไม่สำเร็จ: ตรวจสอบข้อมูลคนขับไม่พบ หรือรหัสผ่านไม่ถูกต้อง`);
        return;
      }

      setFailedAttempts(0);
      setLockoutSeconds(0);
      setSuccessToast('เข้าสู่ระบบสำเร็จ ยินดีต้อนรับพนักงานขับรถ...');

      setTimeout(() => {
        onLogin('driver', {
          userId: foundDriver.id,
          userName: foundDriver.name,
          userDept: 'กำลังให้บริการ',
          userStatus: foundDriver.status,
          roleLabel: 'พนักงานขับรถมันม่วง',
          role: 'driver',
          busId: foundDriver.busId,
          route: foundDriver.route,
          loginTime: loginTimeStr,
          loginDate: loginDateStr
        });
      }, 700);
      return;
    }

    // ======================================================================
    // 3. USER AUTHENTICATION (นักศึกษา, บุคลากร, บุคคลภายนอก)
    // ======================================================================
    let fbUser = null;
    if (db) {
      try {
        const uDoc = await getDoc(doc(db, 'users', trimmedId));
        if (uDoc.exists()) {
          fbUser = uDoc.data();
        }
      } catch (e) {}
    }
    const allUsers = UserService.getAll();
    let foundUser = fbUser || allUsers.find((u) => String(u.id) === trimmedId);
    if (!foundUser) {
      if (userCategory === 'student') {
        foundUser = MOCK_STUDENTS.find((s) => s.id === trimmedId);
      } else {
        foundUser = MOCK_STAFF.find((s) => s.id === trimmedId);
      }
    }

    const activeUserPw = fbUser?.password || getStoredPassword(trimmedId, foundUser?.password || '123456');

    if (!foundUser || pw.trim() !== activeUserPw) {
      const nextFailed = failedAttempts + 1;
      setFailedAttempts(nextFailed);
      if (nextFailed >= 3) {
        setLockoutSeconds(30);
        setFailedAttempts(0);
        setError('แจ้งเตือนการเข้าสู่ระบบไม่สำเร็จ: ระงับการลองเข้าสู่ระบบ 30 วินาที');
        return;
      }
      setError(`แจ้งเตือนการเข้าสู่ระบบไม่สำเร็จ: ไม่พบข้อมูลผู้ใช้ หรือรหัสผ่านไม่ถูกต้อง (ลองผิด ${nextFailed}/3 ครั้ง)`);
      return;
    }

    setFailedAttempts(0);
    setLockoutSeconds(0);
    setSuccessToast('เข้าสู่ระบบสำเร็จ กำลังพาคุณเข้าสู่ระบบ...');

    const roleName = userCategory === 'student' ? 'นักศึกษา' : userCategory === 'staff' ? 'บุคลากรภายในมหาลัย' : 'บุคคลภายนอก';
    const deptStr = foundUser.faculty || foundUser.department || 'มหาวิทยาลัยวลัยลักษณ์';

    setTimeout(() => {
      onLogin('passenger', {
        userId: foundUser.id,
        userName: foundUser.name,
        userDept: deptStr,
        userStatus: foundUser.status || 'สิทธิ์ใช้งานปกติ',
        roleLabel: roleName,
        role: userCategory,
        loginTime: loginTimeStr,
        loginDate: loginDateStr
      });
    }, 700);
  };

  return (
    <main className="loginPageMinimal">
      <button
        className="themeFloating"
        onClick={() => setDark(!dark)}
        title="เปลี่ยนธีม Dark/Light"
      >
        {dark ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className="loginCardMinimal" style={{ maxWidth: '480px', width: '92%' }}>
        {/* Brand Header */}
        <div className="loginBrandHeader">
          <Brand />
        </div>

        <div className="loginTitleBox" style={{ textAlign: 'center', marginBottom: '18px' }}>
          <p className="muted" style={{ margin: 0, fontSize: '14px' }}>
            เข้าสู่ระบบติดตามรถมันม่วง มหาวิทยาลัยวลัยลักษณ์
          </p>
        </div>

        <form onSubmit={handleSubmit} className="loginFormMinimal">
          {/* MAIN ROLE TABS: User | Driver | Admin */}
          <div className="roleTabs" style={{ marginBottom: '12px' }}>
            <button
              type="button"
              className={mainRole === 'user' ? 'active' : ''}
              onClick={() => handleMainRoleChange('user')}
            >
              <Users size={15} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              ผู้โดยสาร
            </button>
            <button
              type="button"
              className={mainRole === 'driver' ? 'active' : ''}
              onClick={() => handleMainRoleChange('driver')}
            >
              <Gauge size={15} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              คนขับรถ
            </button>
            <button
              type="button"
              className={mainRole === 'admin' ? 'active' : ''}
              onClick={() => handleMainRoleChange('admin')}
            >
              <ShieldCheck size={15} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              ผู้ดูแลระบบ
            </button>
          </div>

          {/* USER SUB-CATEGORY TABS (ตาม Activity Diagram: นักศึกษา, บุคลากรภายในมหาลัย, บุคคลภายนอก) */}
          {mainRole === 'user' && (
            <div style={{
              background: 'var(--bg)',
              padding: '6px',
              borderRadius: '14px',
              border: '1px solid var(--border)',
              display: 'flex',
              gap: '4px',
              marginBottom: '16px'
            }}>
              {[
                ['student', 'นักศึกษา'],
                ['staff', 'บุคลากร มวล.'],
                ['guest', 'บุคคลภายนอก']
              ].map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => handleCategoryChange(k)}
                  style={{
                    flex: 1,
                    padding: '8px 4px',
                    borderRadius: '10px',
                    border: 'none',
                    background: userCategory === k ? 'var(--card)' : 'transparent',
                    color: userCategory === k ? 'var(--wu-purple-light)' : 'var(--muted)',
                    fontWeight: userCategory === k ? 800 : 600,
                    fontSize: '12px',
                    cursor: 'pointer',
                    boxShadow: userCategory === k ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          <div style={{
            background: 'var(--wu-purple-subtle)',
            borderRadius: '12px',
            padding: '8px 12px',
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '12px',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <span style={{ color: 'var(--text)', fontWeight: 600 }}>
              บัญชีทดสอบ: <strong>{roleConfig.defaultDemoId}</strong>
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => handleQuickFill(roleConfig.defaultDemoId, roleConfig.defaultDemoPw)}
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--wu-purple-light)',
                  borderRadius: '8px',
                  padding: '4px 10px',
                  color: 'var(--wu-purple-light)',
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
              >
                กรอกอัตโนมัติ
              </button>
            </div>
          </div>

          {/* INPUT ID */}
          <label className="fieldLabel">
            <span>{roleConfig.label}</span>
            <div className="inputWrap">
              <User size={18} />
              <input
                type={roleConfig.isNumericOnly ? 'text' : 'text'}
                inputMode={roleConfig.isNumericOnly ? 'numeric' : 'text'}
                value={id}
                onChange={(e) => {
                  const val = roleConfig.isNumericOnly
                    ? e.target.value.replace(/\D/g, '').slice(0, roleConfig.len)
                    : e.target.value.slice(0, roleConfig.len);
                  setId(val);
                }}
                placeholder={roleConfig.placeholder}
              />
              {roleConfig.isNumericOnly && (
                <span className="charCounter">
                  {id.length}/{roleConfig.len}
                </span>
              )}
            </div>
          </label>

          {/* INPUT PASSWORD */}
          <label className="fieldLabel">
            <span>รหัสผ่าน</span>
            <div className="inputWrap">
              <ShieldCheck size={18} />
              <input
                type={showPw ? 'text' : 'password'}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="••••••••"
              />
              <button
                type="button"
                className="eyeToggleBtn"
                onClick={() => setShowPw(!showPw)}
                aria-label="Toggle password visibility"
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="forgotPwRow" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
              <button
                type="button"
                className="forgotPwBtn"
                onClick={() => setShowResetModal(true)}
                style={{
                  background: 'none', border: 'none', color: 'var(--wu-purple-light)',
                  fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 4px'
                }}
              >
                <Lock size={13} /> เปลี่ยนรหัสผ่าน
              </button>
            </div>
          </label>

          {/* ERROR NOTIFICATION (แจ้งเตือนการเข้าสู่ระบบไม่สำเร็จ) */}
          {error && (
            <div className="formError" style={{ animation: 'shake 0.3s ease' }}>
              <CircleAlert size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* SUCCESS NOTIFICATION (เข้าสู่ระบบสำเร็จ) */}
          {successToast && (
            <div className="formSuccess">
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <span>{successToast}</span>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button type="submit" className="primaryBtn submitBtn" style={{ marginTop: '12px' }}>
            เข้าสู่ระบบ <ChevronRight size={19} />
          </button>
        </form>
      </div>

      {/* RESET PASSWORD MODAL */}
      {showResetModal && (
        <div className="modalOverlay" onClick={() => !isResetting && setShowResetModal(false)}>
          <div className="modalCard" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', width: '92%' }}>
            <div className="modalHeader" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={20} color="var(--wu-purple-light)" />
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>เปลี่ยนรหัสผ่าน / ตั้งรหัสผ่านใหม่</h3>
              </div>
              <button
                type="button"
                disabled={isResetting}
                onClick={() => setShowResetModal(false)}
                style={{ background: 'none', border: 'none', cursor: isResetting ? 'not-allowed' : 'pointer', color: 'var(--muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Firebase Live Connection Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '10px',
              padding: '8px 12px',
              marginBottom: '14px',
              fontSize: '12px',
              color: 'var(--text)'
            }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--success)' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }}></span>
                เชื่อมต่อระบบฐานข้อมูล Firebase Firestore
              </span>
              <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>
                Real-time Sync
              </span>
            </div>

            {resetError && (
              <div className="formError" style={{ marginBottom: '12px' }}>
                <CircleAlert size={16} /> <span>{resetError}</span>
              </div>
            )}
            {resetSuccess && (
              <div className="formSuccess" style={{ marginBottom: '12px' }}>
                <CheckCircle2 size={16} /> <span>{resetSuccess}</span>
              </div>
            )}

            <form onSubmit={handleResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <label className="fieldLabel">
                <span>กรอกรหัสประจำตัว / ชื่อผู้ใช้</span>
                <input
                  type="text"
                  value={resetId}
                  onChange={(e) => setResetId(e.target.value)}
                  placeholder="กรอกรหัสประจำตัวของคุณ..."
                  disabled={isResetting}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1.5px solid var(--border)', outline: 'none', background: 'var(--card)', color: 'var(--text)' }}
                />
              </label>

              <label className="fieldLabel">
                <span>รหัสผ่านใหม่</span>
                <input
                  type="password"
                  value={resetNewPw}
                  onChange={(e) => setResetNewPw(e.target.value)}
                  placeholder="อย่างน้อย 4 ตัวอักษร..."
                  disabled={isResetting}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1.5px solid var(--border)', outline: 'none', background: 'var(--card)', color: 'var(--text)' }}
                />
              </label>

              <label className="fieldLabel">
                <span>ยืนยันรหัสผ่านใหม่</span>
                <input
                  type="password"
                  value={resetConfirmPw}
                  onChange={(e) => setResetConfirmPw(e.target.value)}
                  placeholder="กรอกรหัสผ่านใหม่อีกครั้ง..."
                  disabled={isResetting}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1.5px solid var(--border)', outline: 'none', background: 'var(--card)', color: 'var(--text)' }}
                />
              </label>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  disabled={isResetting}
                  onClick={() => setShowResetModal(false)}
                  style={{ flex: 1, padding: '11px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontWeight: 700, cursor: isResetting ? 'not-allowed' : 'pointer' }}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  style={{ flex: 1, padding: '11px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, var(--wu-purple-light), var(--wu-purple))', color: '#fff', fontWeight: 700, cursor: isResetting ? 'not-allowed' : 'pointer', opacity: isResetting ? 0.75 : 1 }}
                >
                  {isResetting ? 'กำลังบันทึกลง Firebase...' : 'บันทึกรหัสผ่านใหม่'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
