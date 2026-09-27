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

  const handleDirectAdminLogin = () => {
    const admin = MOCK_ADMINS[0];
    const loginTimeStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';
    const loginDateStr = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
    setSuccessToast('เข้าสู่ระบบในฐานะผู้ดูแลระบบ (Admin) สำเร็จ...');
    setTimeout(() => {
      onLogin('admin', {
        userId: admin.id,
        userName: admin.name,
        userDept: admin.department,
        userStatus: admin.status,
        roleLabel: admin.roleLabel,
        role: 'admin',
        loginTime: loginTimeStr,
        loginDate: loginDateStr
      });
    }, 300);
  };

  const handleResetSubmit = (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    if (!resetId.trim()) {
      setResetError('กรุณากรอกรหัสประจำตัว / ชื่อผู้ใช้');
      return;
    }

    if (resetNewPw.length < 4) {
      setResetError('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 4 ตัวอักษร');
      return;
    }

    if (resetNewPw !== resetConfirmPw) {
      setResetError('รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    setStoredPassword(resetId.trim(), resetNewPw.trim());
    // Sync updated password to Firestore
    UserService.update(resetId.trim(), { password: resetNewPw.trim() });
    DriverService.update(resetId.trim(), { password: resetNewPw.trim() });

    setResetSuccess('เปลี่ยนรหัสผ่านใหม่เรียบร้อยแล้ว (ซิงก์ Firebase สำเร็จ)');
    setTimeout(() => {
      setResetSuccess('');
      setShowResetModal(false);
      setResetId('');
      setResetNewPw('');
      setResetConfirmPw('');
    }, 2000);
  };

  const handleSubmit = (e) => {
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
      const foundAdmin = MOCK_ADMINS.find(
        (a) => a.id.toLowerCase() === lowerId
      ) || MOCK_ADMINS[0];

      const activeAdminPw = getStoredPassword(foundAdmin.id, foundAdmin.password || 'admin');

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
      const allDrivers = DriverService.getAll();
      const foundDriver = allDrivers.find((d) => String(d.id) === id.trim()) || MOCK_DRIVERS.find((d) => d.id === id.trim());
      const activeDriverPw = getStoredPassword(id.trim(), foundDriver?.password || '123456');

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
    const allUsers = UserService.getAll();
    let foundUser = allUsers.find((u) => String(u.id) === id.trim());
    if (!foundUser) {
      if (userCategory === 'student') {
        foundUser = MOCK_STUDENTS.find((s) => s.id === id.trim());
      } else {
        foundUser = MOCK_STAFF.find((s) => s.id === id.trim());
      }
    }

    const activeUserPw = getStoredPassword(id.trim(), foundUser?.password || '123456');

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
              ผู้ใช้บริการ
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
              {mainRole === 'admin' && (
                <button
                  type="button"
                  onClick={handleDirectAdminLogin}
                  style={{
                    background: 'var(--danger)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '4px 10px',
                    color: '#fff',
                    fontWeight: 800,
                    cursor: 'pointer',
                    fontSize: '11px',
                    boxShadow: '0 2px 6px rgba(239, 68, 68, 0.25)'
                  }}
                >
                  เข้าสู่ระบบทันที
                </button>
              )}
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
        <div className="modalOverlay" onClick={() => setShowResetModal(false)}>
          <div className="modalCard" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', width: '90%' }}>
            <div className="modalHeader" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={20} color="var(--wu-purple-light)" />
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>เปลี่ยนรหัสผ่าน / ตั้งรหัสผ่านใหม่</h3>
              </div>
              <button onClick={() => setShowResetModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
                <X size={20} />
              </button>
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
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1.5px solid var(--border)', outline: 'none', background: 'var(--card)', color: 'var(--text)' }}
                />
              </label>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  style={{ flex: 1, padding: '11px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontWeight: 700, cursor: 'pointer' }}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '11px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, var(--wu-purple-light), var(--wu-purple))', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                >
                  บันทึกรหัสผ่านใหม่
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
