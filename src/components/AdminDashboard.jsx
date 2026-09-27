import React, { useState, useEffect } from 'react';
import {
  Bus, Users, ShieldCheck, Flag, CheckCircle2, CircleAlert, Activity,
  Sliders, Star, LayoutDashboard, Clock3, User, Route, Database,
  Plus, Trash2, Edit3, Search, RefreshCw, Bell, MapPin, Eye,
  AlertTriangle, Check, X, Shield, Lock, Radio, Gauge, CalendarClock,
  Cpu, Ban, UserCheck, CheckSquare, Zap, FileText
} from 'lucide-react';
import Shell from './Shell';
import NotificationsPage from './NotificationsPage';
import { adminNav, ROUTES } from '../data/routesData';
import {
  UserService,
  DriverService,
  BusService,
  RouteService,
  ReportService,
  AnnouncementService,
  ChatbotService,
  ScheduleService
} from '../data/dataStore.js';

export default function AdminDashboard({
  dark,
  setDark,
  logout,
  buses,
  setBuses,
  reports: propReports,
  userInfo
}) {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Datasets from Data Store
  const [userList, setUserList] = useState([]);
  const [driverList, setDriverList] = useState([]);
  const [routeList, setRouteList] = useState([]);
  const [reportList, setReportList] = useState([]);
  const [announcementList, setAnnouncementList] = useState([]);
  const [chatbotFaqs, setChatbotFaqs] = useState([]);
  const [scheduleList, setScheduleList] = useState([]);

  // Toast & Modals
  const [toastMessage, setToastMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [complaintFilter, setComplaintFilter] = useState('all');
  const [complaintSearch, setComplaintSearch] = useState('');

  // Modals for CRUD
  const [activeModal, setActiveModal] = useState(null); // 'user' | 'driver' | 'bus' | 'route' | 'stop' | 'faq' | 'announcement' | 'schedule' | 'inspection'
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [editingItem, setEditingItem] = useState(null);

  // Form states
  const [userForm, setUserForm] = useState({ id: '', name: '', userType: 'student', department: '', password: '123' });
  const [driverForm, setDriverForm] = useState({ id: '', name: '', busId: 'WU-101', route: 1, phone: '', experienceYears: 5, score: 100 });
  const [busForm, setBusForm] = useState({ id: '', route: 1, driverName: '', status: 'พร้อมให้บริการ', capacity: 20 });
  const [announcementForm, setAnnouncementForm] = useState({ title: '', text: '', category: 'ข่าวสารบริการ', urgent: false });
  const [faqForm, setFaqForm] = useState({ question: '', answer: '', category: 'ทั่วไป' });
  const [scheduleForm, setScheduleForm] = useState({
    id: '', driverId: '600101', driverName: 'สมชาย ดีเยี่ยม', busId: 'WU-101',
    route: 1, shiftName: 'กะเช้า (Morning Shift)', startTime: '07:00', endTime: '12:00',
    frequency: 'ทุก 8 นาที', status: 'กำลังปฏิบัติหน้าที่', notes: ''
  });
  const [stopForm, setStopForm] = useState({
    id: '', routeId: 1, name: '', lat: 8.6450, lng: 99.8940
  });
  const [inspectingBus, setInspectingBus] = useState(null);
  const [inspectionChecklist, setInspectionChecklist] = useState({
    tires: true, brakes: true, lights: true, gps: true, seatSensors: true, doors: true, aircon: true
  });

  // Report resolution state
  const [resolvingReport, setResolvingReport] = useState(null);
  const [resolutionStatus, setResolutionStatus] = useState('กำลังดำเนินการ');
  const [resolutionNote, setResolutionNote] = useState('');
  const [scoreDeduction, setScoreDeduction] = useState(3);

  // Load initial data
  const loadAllData = () => {
    setUserList(UserService.getAll());
    setDriverList(DriverService.getAll());
    setRouteList(RouteService.getAll());
    setReportList(ReportService.getAll());
    setAnnouncementList(AnnouncementService.getAll());
    setChatbotFaqs(ChatbotService.getAll());
    setScheduleList(ScheduleService.getAll());
  };

  useEffect(() => {
    loadAllData();

    // Subscribe to Firestore Realtime Collections
    const unsubUsers = UserService.subscribeUsers((list) => setUserList(list));
    const unsubDrivers = DriverService.subscribeDrivers((list) => setDriverList(list));
    const unsubRoutes = RouteService.subscribeRoutes((list) => setRouteList(list));
    const unsubReports = ReportService.subscribeReports((list) => setReportList(list));
    const unsubAnnouncements = AnnouncementService.subscribeAnnouncements((list) => setAnnouncementList(list));
    const unsubFaqs = ChatbotService.subscribeFaqs((list) => setChatbotFaqs(list));
    const unsubSchedules = ScheduleService.subscribeSchedules((list) => setScheduleList(list));

    return () => {
      unsubUsers();
      unsubDrivers();
      unsubRoutes();
      unsubReports();
      unsubAnnouncements();
      unsubFaqs();
      unsubSchedules();
    };
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // ======================================================================
  // 1. USER CRUD HANDLERS
  // ======================================================================
  const handleOpenUserModal = (mode, item = null) => {
    setModalMode(mode);
    setEditingItem(item);
    if (mode === 'edit' && item) {
      setUserForm({
        id: item.id,
        name: item.name || '',
        userType: item.userType || 'student',
        department: item.faculty || item.department || '',
        password: item.password || '123'
      });
    } else {
      setUserForm({ id: '', name: '', userType: 'student', department: '', password: '123' });
    }
    setActiveModal('user');
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (modalMode === 'add') {
      const res = await UserService.add({
        id: userForm.id.trim(),
        name: userForm.name.trim(),
        userType: userForm.userType,
        roleLabel: userForm.userType === 'student' ? 'นักศึกษา' : userForm.userType === 'staff' ? 'บุคลากร มวล.' : userForm.userType === 'admin' ? 'ผู้ดูแลระบบ' : 'บุคคลภายนอก',
        faculty: userForm.department.trim(),
        department: userForm.department.trim(),
        password: userForm.password.trim(),
        status: 'สิทธิ์ใช้งานปกติ'
      });
      if (res.success) {
        showToast('เพิ่มข้อมูลผู้ใช้งานเรียบร้อยแล้ว');
        loadAllData();
        setActiveModal(null);
      } else {
        alert(res.message);
      }
    } else {
      const res = await UserService.update(editingItem.id, {
        name: userForm.name.trim(),
        userType: userForm.userType,
        faculty: userForm.department.trim(),
        department: userForm.department.trim(),
        password: userForm.password.trim()
      });
      if (res.success) {
        showToast('แก้ไขข้อมูลผู้ใช้งานเรียบร้อยแล้ว');
        loadAllData();
        setActiveModal(null);
      }
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm(`ยืนยันการลบผู้ใช้รหัส ${id}?`)) {
      await UserService.delete(id);
      showToast('ลบข้อมูลผู้ใช้งานเรียบร้อย (ซิงก์ Firebase สำเร็จ)');
      loadAllData();
    }
  };

  const handleSuspendUser = async (id, name) => {
    if (window.confirm(`ยืนยันการระงับบัญชีผู้ใช้งาน "${name}" (${id})?`)) {
      await UserService.suspendUser(id, 'ระงับการใช้งานชั่วคราวโดยผู้ดูแลระบบ');
      showToast(`ระงับบัญชีผู้ใช้ ${id} เรียบร้อยแล้ว`);
      loadAllData();
    }
  };

  const handleUnsuspendUser = async (id, name) => {
    if (window.confirm(`ยืนยันการปลดระงับบัญชีผู้ใช้งาน "${name}" (${id})?`)) {
      await UserService.unsuspendUser(id);
      showToast(`ปลดระงับบัญชีผู้ใช้ ${id} คืนสู่สถานะปกติเรียบร้อยแล้ว`);
      loadAllData();
    }
  };

  // ======================================================================
  // 2. DRIVER CRUD HANDLERS
  // ======================================================================
  const handleOpenDriverModal = (mode, item = null) => {
    setModalMode(mode);
    setEditingItem(item);
    if (mode === 'edit' && item) {
      setDriverForm({
        id: item.id,
        name: item.name || '',
        busId: item.busId || 'WU-101',
        route: item.route || 1,
        phone: item.phone || '',
        experienceYears: item.experienceYears || 5,
        score: item.score != null ? item.score : 100
      });
    } else {
      setDriverForm({ id: '', name: '', busId: 'WU-101', route: 1, phone: '', experienceYears: 5, score: 100 });
    }
    setActiveModal('driver');
  };

  const handleSaveDriver = async (e) => {
    e.preventDefault();
    if (modalMode === 'add') {
      const res = await DriverService.add({
        id: driverForm.id.trim(),
        name: driverForm.name.trim(),
        busId: driverForm.busId,
        route: Number(driverForm.route),
        phone: driverForm.phone.trim(),
        experienceYears: Number(driverForm.experienceYears),
        score: Number(driverForm.score),
        password: '123',
        status: 'กำลังให้บริการ'
      });
      if (res.success) {
        showToast('เพิ่มข้อมูลคนขับรถเรียบร้อยแล้ว');
        loadAllData();
        setActiveModal(null);
      } else {
        alert(res.message);
      }
    } else {
      const res = await DriverService.update(editingItem.id, {
        name: driverForm.name.trim(),
        busId: driverForm.busId,
        route: Number(driverForm.route),
        phone: driverForm.phone.trim(),
        experienceYears: Number(driverForm.experienceYears),
        score: Number(driverForm.score)
      });
      if (res.success) {
        showToast('แก้ไขข้อมูลคนขับรถเรียบร้อยแล้ว');
        loadAllData();
        setActiveModal(null);
      }
    }
  };

  const handleDeleteDriver = async (id) => {
    if (window.confirm(`ยืนยันการลบข้อมูลคนขับรหัส ${id}?`)) {
      await DriverService.delete(id);
      showToast('ลบข้อมูลคนขับรถเรียบร้อย');
      loadAllData();
    }
  };

  // ======================================================================
  // 3. BUS FLEET CRUD HANDLERS
  // ======================================================================
  const handleOpenBusModal = (mode, item = null) => {
    setModalMode(mode);
    setEditingItem(item);
    if (mode === 'edit' && item) {
      setBusForm({
        id: item.id,
        route: item.route || 1,
        driverName: item.driverName || '',
        status: item.status || 'พร้อมให้บริการ',
        capacity: 20
      });
    } else {
      setBusForm({ id: '', route: 1, driverName: '', status: 'พร้อมให้บริการ', capacity: 20 });
    }
    setActiveModal('bus');
  };

  const handleSaveBus = async (e) => {
    e.preventDefault();
    if (modalMode === 'add') {
      const res = await BusService.add({
        id: busForm.id.trim().toUpperCase(),
        route: Number(busForm.route),
        driverName: '',
        status: busForm.status,
        passengers: 0,
        seated: 0,
        standing: 0,
        speed: 0,
        seats: Array(20).fill('free')
      });
      if (res.success) {
        showToast('เพิ่มรถมันม่วงเข้าสู่ระบบสำเร็จ (ซิงก์ Firebase สำเร็จ)');
        setBuses?.(BusService.getAll());
        setActiveModal(null);
      } else {
        alert(res.message);
      }
    } else {
      const res = await BusService.update(editingItem.id, {
        route: Number(busForm.route),
        status: busForm.status
      });
      if (res.success) {
        showToast('แก้ไขข้อมูลรถมันม่วงเรียบร้อยแล้ว (ซิงก์ Firebase สำเร็จ)');
        setBuses?.(BusService.getAll());
        setActiveModal(null);
      }
    }
  };

  const handleDeleteBus = async (id) => {
    if (window.confirm(`ยืนยันการปลดประจำการรถ ${id}?`)) {
      await BusService.delete(id);
      setBuses?.(BusService.getAll());
      showToast('ลบข้อมูลรถมันม่วงเรียบร้อย');
    }
  };

  // ======================================================================
  // 4. REPORT RESOLUTION HANDLERS (จัดการข้อร้องเรียน & แจ้งผล)
  // ======================================================================
  const handleOpenResolveModal = (report) => {
    setResolvingReport(report);
    setResolutionStatus(report.status || 'กำลังดำเนินการ');
    setResolutionNote(report.adminNote || '');
    setScoreDeduction(Math.abs(report.scoreImpact || 3));
  };

  const handleQuickResolve = async (reportId) => {
    await ReportService.updateStatus(reportId, 'ดำเนินการเรียบร้อยแล้ว', 'ผู้ดูแลระบบดำเนินการเรียบร้อยแล้ว', 0);
    showToast(`ดำเนินการเรื่องร้องเรียน #${reportId} เรียบร้อยแล้ว (ส่งผลกลับไปยังผู้ใช้และซิงก์ Firebase สำเร็จ)`);
    loadAllData();
  };

  const handleSaveResolution = async (e) => {
    e.preventDefault();
    if (!resolvingReport) return;

    const penalty = resolutionStatus === 'ตักเตือน/หักคะแนน' ? scoreDeduction : 0;
    await ReportService.updateStatus(resolvingReport.id, resolutionStatus, resolutionNote, penalty);
    showToast(`อัปเดตและแจ้งผลเรื่องร้องเรียน #${resolvingReport.id} แล้ว (ซิงก์ Firebase สำเร็จ)`);
    loadAllData();
    setResolvingReport(null);
  };

  // ======================================================================
  // 5. CHATBOT & ANNOUNCEMENTS (แชทบอท & ประชาสัมพันธ์ -> แจ้งเตือน)
  // ======================================================================
  const handleOpenAnnouncementModal = (mode = 'add', item = null) => {
    setModalMode(mode);
    setEditingItem(item);
    if (mode === 'edit' && item) {
      setAnnouncementForm({
        title: item.title || '',
        text: item.text || '',
        category: item.category || 'ข่าวสารบริการ',
        urgent: Boolean(item.urgent)
      });
    } else {
      setAnnouncementForm({ title: '', text: '', category: 'ข่าวสารบริการ', urgent: false });
    }
    setActiveModal('announcement');
  };

  const handleSaveAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementForm.title.trim()) return;
    if (modalMode === 'edit' && editingItem) {
      await AnnouncementService.update(editingItem._docId || editingItem.id, announcementForm);
      showToast('แก้ไขข้อมูลประกาศและซิงก์ Firebase สำเร็จ');
    } else {
      await AnnouncementService.add(announcementForm);
      showToast('สร้างประกาศและซิงก์ Firebase เรียบร้อย');
    }
    setAnnouncementForm({ title: '', text: '', category: 'ข่าวสารบริการ', urgent: false });
    loadAllData();
    setActiveModal(null);
  };

  const handleOpenFaqModal = (mode = 'add', item = null) => {
    setModalMode(mode);
    setEditingItem(item);
    if (mode === 'edit' && item) {
      setFaqForm({
        question: item.question || '',
        answer: item.answer || '',
        category: item.category || 'ทั่วไป'
      });
    } else {
      setFaqForm({ question: '', answer: '', category: 'ทั่วไป' });
    }
    setActiveModal('faq');
  };

  const handleSaveFaq = async (e) => {
    e.preventDefault();
    if (!faqForm.question.trim()) return;
    if (modalMode === 'edit' && editingItem) {
      await ChatbotService.update(editingItem.id, faqForm);
      showToast('แก้ไขคำถาม-คำตอบแชทบอทและซิงก์ Firebase สำเร็จ');
    } else {
      await ChatbotService.add(faqForm);
      showToast('เพิ่มคำถาม-คำตอบในแชทบอทและซิงก์ Firebase สำเร็จ');
    }
    setFaqForm({ question: '', answer: '', category: 'ทั่วไป' });
    loadAllData();
    setActiveModal(null);
  };

  // ======================================================================
  // 6. SCHEDULE CRUD HANDLERS (จัดการตารางเดินรถ)
  // ======================================================================
  const handleOpenScheduleModal = (mode, item = null) => {
    setModalMode(mode);
    setEditingItem(item);
    if (mode === 'edit' && item) {
      const bus = buses.find((b) => b.id === item.busId);
      setScheduleForm({
        id: item.id,
        driverId: item.driverId || (driverList[0]?.id || '600101'),
        driverName: item.driverName || '',
        busId: item.busId || (buses[0]?.id || 'WU-101'),
        route: bus ? bus.route : (item.route || 1),
        shiftName: item.shiftName || 'กะเช้า',
        startTime: item.startTime || '07:00',
        endTime: item.endTime || '12:00',
        frequency: item.frequency || 'ทุก 8 นาที',
        status: item.status || 'กำลังปฏิบัติหน้าที่',
        notes: item.notes || ''
      });
    } else {
      const defaultBus = buses[0];
      setScheduleForm({
        id: '',
        driverId: driverList[0]?.id || '600101',
        driverName: driverList[0]?.name || 'สมชาย ดีเยี่ยม',
        busId: defaultBus?.id || 'WU-101',
        route: defaultBus?.route || 1,
        shiftName: 'กะเช้า (Morning Shift)',
        startTime: '07:00',
        endTime: '12:00',
        frequency: 'ทุก 8 นาที',
        status: 'กำลังปฏิบัติหน้าที่',
        notes: ''
      });
    }
    setActiveModal('schedule');
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    const selDriver = driverList.find((d) => String(d.id) === String(scheduleForm.driverId));
    const selBus = buses.find((b) => b.id === scheduleForm.busId);
    const busRoute = selBus ? selBus.route : (scheduleForm.route || 1);
    const payload = {
      ...scheduleForm,
      driverName: selDriver ? selDriver.name : scheduleForm.driverName,
      route: Number(busRoute)
    };
    if (modalMode === 'add') {
      const res = await ScheduleService.add(payload);
      if (res.success) {
        showToast('เพิ่มข้อมูลตารางเดินรถสำเร็จ');
        setScheduleList(ScheduleService.getAll());
        setActiveModal(null);
      }
    } else {
      const res = await ScheduleService.update(editingItem.id, payload);
      if (res.success) {
        showToast('แก้ไขข้อมูลตารางเดินรถเรียบร้อยแล้ว');
        setScheduleList(ScheduleService.getAll());
        setActiveModal(null);
      }
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (window.confirm(`ยืนยันการลบตารางเดินรถรหัส ${id}?`)) {
      await ScheduleService.delete(id);
      setScheduleList(ScheduleService.getAll());
      showToast('ลบข้อมูลตารางเดินรถเรียบร้อยแล้ว');
    }
  };

  // ======================================================================
  // 7. ROUTE & STOP CRUD HANDLERS (จัดการจุดจอด)
  // ======================================================================
  const handleOpenStopModal = (routeId, stopItem = null) => {
    setModalMode(stopItem ? 'edit' : 'add');
    setEditingItem(stopItem);
    if (stopItem) {
      setStopForm({
        id: stopItem.id,
        routeId: Number(routeId),
        name: stopItem.name,
        lat: stopItem.lat,
        lng: stopItem.lng
      });
    } else {
      setStopForm({
        id: '',
        routeId: Number(routeId),
        name: '',
        lat: 8.6460,
        lng: 99.8950
      });
    }
    setActiveModal('stop');
  };

  const handleSaveStop = async (e) => {
    e.preventDefault();
    if (modalMode === 'add') {
      const res = await RouteService.addStop(stopForm.routeId, {
        name: stopForm.name.trim(),
        lat: Number(stopForm.lat),
        lng: Number(stopForm.lng)
      });
      if (res.success) {
        showToast('เพิ่มจุดจอดใหม่สำเร็จ');
        setRouteList(RouteService.getAll());
        setActiveModal(null);
      }
    } else {
      const res = await RouteService.updateStop(stopForm.routeId, editingItem.id, {
        name: stopForm.name.trim(),
        lat: Number(stopForm.lat),
        lng: Number(stopForm.lng)
      });
      if (res.success) {
        showToast('แก้ไขข้อมูลจุดจอดสำเร็จ');
        setRouteList(RouteService.getAll());
        setActiveModal(null);
      }
    }
  };

  const handleDeleteStop = async (routeId, stopId) => {
    if (window.confirm('ยืนยันการลบจุดจอดนี้ออกจากเส้นทาง?')) {
      await RouteService.deleteStop(routeId, stopId);
      setRouteList(RouteService.getAll());
      showToast('ลบจุดจอดเรียบร้อยแล้ว');
    }
  };

  // ======================================================================
  // 9. BUS READINESS INSPECTION (ตรวจสอบความพร้อมของรถ)
  // ======================================================================
  const handleOpenInspectionModal = (bus) => {
    setInspectingBus(bus);
    setInspectionChecklist({
      tires: true,
      brakes: true,
      lights: true,
      gps: true,
      seatSensors: true,
      doors: true,
      aircon: true
    });
    setActiveModal('inspection');
  };

  const handleSaveInspection = async (e) => {
    e.preventDefault();
    if (!inspectingBus) return;
    await BusService.checkReadiness(inspectingBus.id, {
      inspector: userInfo?.userName || 'ผู้ดูแลระบบ',
      checklist: inspectionChecklist
    });
    setBuses?.(BusService.getAll());
    showToast(`บันทึกผลตรวจสอบความพร้อมรถ ${inspectingBus.id} เรียบร้อย (พร้อมให้บริการ 100%)`);
    setActiveModal(null);
  };



  return (
    <Shell
      dark={dark}
      setDark={setDark}
      logout={logout}
      active={activeTab}
      setActive={setActiveTab}
      navItems={adminNav}
      title="Admin Control Center"
      subtitle="จัดการระบบ WU BUS"
      userInfo={userInfo}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed', top: '90px', right: '24px', zIndex: 9999,
          background: 'var(--card)', border: '1.5px solid var(--wu-purple-light)',
          borderRadius: '16px', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '10px',
          boxShadow: '0 12px 36px rgba(92, 6, 140, 0.25)', animation: 'fadeIn 0.3s ease'
        }}>
          <CheckCircle2 size={20} color="var(--wu-purple-light)" />
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>
            {toastMessage}
          </span>
        </div>
      )}

      <div className="contentPage">
        {/* ================================================================
            TAB 1: DASHBOARD OVERVIEW
        ================================================================ */}
        {activeTab === 'dashboard' && (
          <div>
            <div className="statCards">
              <Stat title="รถเปิดให้บริการ" value={`${buses.length} คัน`} icon={Bus} color="var(--wu-purple-light)" />
              <Stat title="คนขับในระบบ" value={`${driverList.length} คน`} icon={Gauge} color="#0ea5e9" />
              <Stat title="ผู้ใช้งานในระบบ" value={`${userList.length} คน`} icon={Users} color="#10b981" />
              <Stat title="ข้อร้องเรียนทั้งหมด" value={`${reportList.length} เรื่อง`} icon={Flag} color="var(--danger)" />
            </div>

            <div className="adminGrid">
              {/* Traffic Chart */}
              <article className="panelCard chartCard">
                <h3>สถิติผู้โดยสารรายชั่วโมง (วันนี้)</h3>
                <div className="fakeChart">
                  {[30, 48, 78, 62, 91, 74, 55, 68, 40, 32].map((h, i) => (
                    <div key={i} className="chartBarWrap">
                      <i style={{ height: `${h}%` }} />
                      <span>{String(8 + i).padStart(2, '0')}:00</span>
                    </div>
                  ))}
                </div>
              </article>


              {/* Real-time Telemetry */}
              <article className="panelCard tableCard">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                  <h3 style={{ margin: 0 }}>สถานะรถมันม่วง</h3>
                  <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>
                    ความจุมาตรฐาน: 20 ที่นั่ง
                  </span>
                </div>
                <div className="tableResponsive">
                  <table>
                    <thead>
                      <tr>
                        <th style={{ whiteSpace: 'nowrap' }}>ป้ายทะเบียนรถ</th>
                        <th style={{ whiteSpace: 'nowrap' }}>สายรถ</th>
                        <th style={{ whiteSpace: 'nowrap' }}>พนักงานขับรถ</th>
                        <th style={{ whiteSpace: 'nowrap' }}>ผู้โดยสาร</th>
                        <th style={{ whiteSpace: 'nowrap' }}>ความเร็ว</th>
                        <th style={{ whiteSpace: 'nowrap' }}>สถานะการเดินรถ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {buses.map((b) => (
                        <tr key={b.id}>
                          <td style={{ whiteSpace: 'nowrap' }}><strong>{b.id}</strong></td>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            <span className="routeMiniTag" style={{ background: ROUTES.find((r) => r.id === b.route)?.color, whiteSpace: 'nowrap' }}>
                              สาย {b.route}
                            </span>
                          </td>
                          <td style={{ whiteSpace: 'nowrap' }}>{b.driverName || 'สมชาย ดีเยี่ยม'}</td>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            {Math.min(20, b.passengers || 0)}/20 ที่นั่ง
                          </td>
                          <td style={{ whiteSpace: 'nowrap' }}>{b.speed || 0} km/h</td>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            <span className={`tag ${b.passengers >= 20 ? 'warn' : 'ok'}`} style={{ whiteSpace: 'nowrap' }}>
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            </div>
          </div>
        )}

        {/* ================================================================
            TAB 2: MANAGE USERS (จัดการข้อมูลผู้ใช้งาน: นักศึกษา, บุคลากร, บุคคลภายนอก)
        ================================================================ */}
        {activeTab === 'users' && (
          <div>
            <div className="pageIntro" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2>จัดการข้อมูลผู้โดยสาร</h2>
                <p>จัดการข้อมูลนักศึกษา บุคลากร และบุคคลภายนอก </p>
              </div>
              <button
                className="primaryBtn"
                onClick={() => handleOpenUserModal('add')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <Plus size={18} /> เพิ่มผู้ใช้งานใหม่
              </button>
            </div>

            <div className="panelCard tableCard">
              <div className="tableResponsive">
                <table>
                  <thead>
                    <tr>
                      <th style={{ whiteSpace: 'nowrap' }}>รหัสประจำตัว</th>
                      <th style={{ whiteSpace: 'nowrap' }}>ชื่อ-นามสกุล</th>
                      <th style={{ whiteSpace: 'nowrap' }}>ประเภทผู้ใช้งาน</th>
                      <th style={{ whiteSpace: 'nowrap' }}>สังกัด / คณะ</th>
                      <th style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>สถานะ</th>
                      <th style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userList.map((u) => (
                      <tr key={u.id}>
                        <td style={{ whiteSpace: 'nowrap' }}><strong>{u.id}</strong></td>
                        <td style={{ whiteSpace: 'nowrap' }}>{u.name}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            whiteSpace: 'nowrap',
                            padding: '4px 12px',
                            borderRadius: '99px',
                            fontSize: '11px',
                            fontWeight: 800,
                            lineHeight: 1.2,
                            background: u.userType === 'student' ? 'rgba(92,6,140,0.1)' : u.userType === 'admin' ? 'rgba(239,68,68,0.1)' : 'rgba(14,165,233,0.1)',
                            color: u.userType === 'student' ? 'var(--wu-purple-light)' : u.userType === 'admin' ? 'var(--danger)' : '#0284c7'
                          }}>
                            {u.roleLabel || u.userType}
                          </span>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {u.suspended ? (
                            <span className="tag warn" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)', fontWeight: 700 }}>
                              <Ban size={12} style={{ display: 'inline', verticalAlign: '-1px', marginRight: '4px' }} />
                              ถูกระงับบัญชี
                            </span>
                          ) : (
                            <span className="tag ok">{u.status || 'ปกติ'}</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                          {u.userType !== 'admin' && (
                            u.suspended ? (
                              <button
                                onClick={() => handleUnsuspendUser(u.id, u.name)}
                                className="secondaryBtn"
                                style={{ padding: '4px 10px', fontSize: '11px', borderColor: '#22a447', color: '#22a447', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
                                title="ปลดระงับบัญชีผู้ใช้งาน"
                              >
                                <UserCheck size={13} /> ปลดระงับ
                              </button>
                            ) : (
                              <button
                                onClick={() => handleSuspendUser(u.id, u.name)}
                                className="secondaryBtn"
                                style={{ padding: '4px 10px', fontSize: '11px', borderColor: 'var(--danger)', color: 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
                                title="ระงับบัญชีผู้ใช้งาน"
                              >
                                <Ban size={13} /> ระงับบัญชี
                              </button>
                            )
                          )}
                        </td>
                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <button
                            onClick={() => handleOpenUserModal('edit', u)}
                            style={{ background: 'none', border: 'none', color: 'var(--wu-purple-light)', cursor: 'pointer', padding: '6px' }}
                            title="แก้ไขข้อมูลผู้ใช้งาน"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '6px' }}
                            title="ลบข้อมูลผู้ใช้งาน"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================
            TAB 3: MANAGE DRIVERS (จัดการข้อมูลคนขับรถ)
        ================================================================ */}
        {activeTab === 'drivers' && (
          <div>
            <div className="pageIntro" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2>จัดการข้อมูลคนขับรถ </h2>
                <p>มอบหมายเส้นทางการเดินรถ</p>
              </div>
              <button
                className="primaryBtn"
                onClick={() => handleOpenDriverModal('add')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <Plus size={18} /> เพิ่มคนขับรถใหม่
              </button>
            </div>

            <div className="panelCard tableCard">
              <div className="tableResponsive">
                <table>
                  <thead>
                    <tr>
                      <th style={{ whiteSpace: 'nowrap' }}>รหัสคนขับ</th>
                      <th style={{ whiteSpace: 'nowrap', minWidth: '130px' }}>ชื่อ-นามสกุล</th>
                      <th style={{ whiteSpace: 'nowrap' }}>รถประจำการ</th>
                      <th style={{ whiteSpace: 'nowrap' }}>สายที่มอบหมาย</th>
                      <th style={{ whiteSpace: 'nowrap', minWidth: '120px' }}>เบอร์โทร</th>
                      <th style={{ whiteSpace: 'nowrap', minWidth: '120px' }}>คะแนนประพฤติ</th>
                      <th style={{ whiteSpace: 'nowrap' }}>สถานะ</th>
                      <th style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {driverList.map((d) => (
                      <tr key={d.id}>
                        <td style={{ whiteSpace: 'nowrap' }}><strong>{d.id}</strong></td>
                        <td style={{ whiteSpace: 'nowrap' }}>{d.name}</td>
                        <td style={{ whiteSpace: 'nowrap' }}><strong>{d.busId}</strong></td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <span className="routeMiniTag" style={{ background: ROUTES.find((r) => r.id === d.route)?.color, whiteSpace: 'nowrap' }}>
                            สาย {d.route}
                          </span>
                        </td>
                        <td style={{ whiteSpace: 'nowrap', letterSpacing: '0.2px' }}>{d.phone || '-'}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {(() => {
                            const driverReports = reportList.filter(
                              (r) => (r.driverId && String(r.driverId) === String(d.id)) ||
                                     (r.driverName && r.driverName === d.name) ||
                                     (r.busId && r.busId === d.busId)
                            );
                            const totalDeduction = driverReports.reduce((sum, r) => sum + Math.abs(r.scoreImpact || 3), 0);
                            const currentScore = Math.max(0, 100 - totalDeduction);
                            return (
                              <div style={{ whiteSpace: 'nowrap' }}>
                                <span style={{
                                  fontWeight: 800,
                                  color: currentScore >= 80 ? 'var(--success)' : 'var(--danger)'
                                }}>
                                  {currentScore} / 100
                                </span>
                                {totalDeduction > 0 && (
                                  <div style={{ fontSize: '11px', color: 'var(--danger)', fontWeight: 600, marginTop: '2px', whiteSpace: 'nowrap' }}>
                                    (ร้องเรียน {driverReports.length} เรื่อง -{totalDeduction})
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}><span className="tag ok" style={{ whiteSpace: 'nowrap' }}>{d.status}</span></td>
                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <button
                            onClick={() => handleOpenDriverModal('edit', d)}
                            style={{ background: 'none', border: 'none', color: 'var(--wu-purple-light)', cursor: 'pointer', padding: '6px' }}
                            title="แก้ไข"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteDriver(d.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '6px' }}
                            title="ลบ"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================
            TAB 4: MANAGE BUSES (จัดการข้อมูลรถ)
        ================================================================ */}
        {activeTab === 'buses' && (
          <div>
            <div className="pageIntro" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2>จัดการข้อมูลรถมันม่วง</h2>
                <p>กำหนดสายวิ่ง และตรวจสอบเซนเซอร์</p>
              </div>
              <button
                className="primaryBtn"
                onClick={() => handleOpenBusModal('add')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <Plus size={18} /> เพิ่มรถมันม่วง
              </button>
            </div>

            <div className="panelCard tableCard">
              <div className="tableResponsive">
                <table>
                  <thead>
                    <tr>
                      <th style={{ whiteSpace: 'nowrap' }}>ป้ายทะเบียนรถ</th>
                      <th style={{ whiteSpace: 'nowrap' }}>สายที่วิ่ง</th>
                      <th style={{ whiteSpace: 'nowrap' }}>ความจุสูงสุด</th>
                      <th style={{ whiteSpace: 'nowrap' }}>สถานะ</th>
                      <th style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buses.map((b) => (
                      <tr key={b.id}>
                        <td style={{ whiteSpace: 'nowrap' }}><strong>{b.id}</strong></td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <span className="routeMiniTag" style={{ background: ROUTES.find((r) => r.id === b.route)?.color }}>
                            สาย {b.route}
                          </span>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>20 ที่นั่ง</td>
                        <td>
                          <span className="tag ok">{b.status}</span>
                          {b.readiness?.isReady && (
                            <span style={{ display: 'block', fontSize: '10px', color: '#22a447', marginTop: '2px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                              ตรวจความพร้อมแล้ว
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <button
                            onClick={() => handleOpenInspectionModal(b)}
                            className="secondaryBtn"
                            style={{ padding: '4px 8px', fontSize: '11px', marginRight: '6px', borderColor: 'var(--wu-purple-light)', color: 'var(--wu-purple-light)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            title="ตรวจสอบความพร้อมของรถก่อนให้บริการ"
                          >
                            <CheckSquare size={13} /> ตรวจความพร้อม
                          </button>
                          <button
                            onClick={() => handleOpenBusModal('edit', b)}
                            style={{ background: 'none', border: 'none', color: 'var(--wu-purple-light)', cursor: 'pointer', padding: '6px' }}
                            title="แก้ไข"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteBus(b.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '6px' }}
                            title="ลบ"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================
            TAB: MANAGE SCHEDULES (จัดการตารางเดินรถ: เพิ่ม/ลบ/แก้ไข/แสดงตารางเดินรถ)
        ================================================================ */}
        {activeTab === 'schedules' && (
          <div>
            <div className="pageIntro" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2>จัดการตารางเดินรถ</h2>
                <p>กำหนดรอบเวลา และการทำงานของคนขับรถ </p>
              </div>
              <button
                className="primaryBtn"
                onClick={() => handleOpenScheduleModal('add')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <Plus size={18} /> เพิ่มตารางเดินรถ
              </button>
            </div>

            <div className="panelCard tableCard">
              <div className="tableResponsive">
                <table>
                  <thead>
                    <tr>
                      <th>รหัสตาราง</th>
                      <th>กะการเดินรถ</th>
                      <th>สายรถ</th>
                      <th>รถประจำการ</th>
                      <th>พนักงานขับรถ</th>
                      <th>ช่วงเวลาเดินรถ</th>
                      <th>สถานะ</th>
                      <th style={{ textAlign: 'right' }}>การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scheduleList.map((sch) => (
                      <tr key={sch.id}>
                        <td><strong>{sch.id}</strong></td>
                        <td>
                          <div style={{ fontWeight: 700 }}>{sch.shiftName}</div>
                          {sch.notes && <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{sch.notes}</div>}
                        </td>
                        <td>
                          <span className="routeMiniTag" style={{ background: ROUTES.find((r) => r.id === sch.route)?.color }}>
                            สาย {sch.route}
                          </span>
                        </td>
                        <td><strong>{sch.busId}</strong></td>
                        <td>{sch.driverName}</td>
                        <td>
                          <span style={{ fontWeight: 600 }}>{sch.startTime} - {sch.endTime} น.</span>
                        </td>
                        <td>
                          <span className={`tag ${sch.status === 'กำลังปฏิบัติหน้าที่' ? 'ok' : 'info'}`}>
                            {sch.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <button
                            onClick={() => handleOpenScheduleModal('edit', sch)}
                            style={{ background: 'none', border: 'none', color: 'var(--wu-purple-light)', cursor: 'pointer', padding: '6px' }}
                            title="แก้ไขตารางเดินรถ"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteSchedule(sch.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '6px' }}
                            title="ลบตารางเดินรถ"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================
            TAB 5: MANAGE ROUTES & STOPS (จัดการข้อมูลเส้นทาง & จุดจอด)
        ================================================================ */}
        {activeTab === 'routes' && (
          <div>
            <div className="pageIntro">
              <h2>จัดการเส้นทาง & จุดจอดรถ</h2>
              <p>แสดงรายละเอียด และจัดการจุดจอดรับส่งผู้โดยสาร</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {routeList.map((r) => (
                <div key={r.id} className="panelCard">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: r.color }} />
                        <h3 style={{ margin: 0 }}>{r.name}</h3>
                        <span style={{ fontSize: '12px', color: 'var(--muted)', background: 'var(--bg)', padding: '2px 8px', borderRadius: '99px' }}>
                          {r.stops?.length || 0} จุดจอด
                        </span>
                      </div>
                    </div>

                    <button
                      className="secondaryBtn"
                      onClick={() => handleOpenStopModal(r.id)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px', borderColor: r.color, color: r.color }}
                    >
                      <Plus size={14} /> เพิ่มจุดจอดในสายนี้
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '8px' }}>
                    {(r.stops || []).map((stop, idx) => (
                      <div
                        key={stop.id}
                        style={{
                          background: 'var(--bg)', border: '1px solid var(--border)',
                          borderRadius: '12px', padding: '8px 12px', fontSize: '13px',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                          <span style={{ fontWeight: 800, color: r.color, minWidth: '18px' }}>{idx + 1}.</span>
                          <span style={{ color: 'var(--text)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {stop.name}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
                          <button
                            onClick={() => handleOpenStopModal(r.id, stop)}
                            style={{ background: 'none', border: 'none', color: 'var(--wu-purple-light)', cursor: 'pointer', padding: '4px' }}
                            title="แก้ไขจุดจอด"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteStop(r.id, stop.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}
                            title="ลบจุดจอด"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================
            TAB 6: MANAGE COMPLAINTS (จัดการข้อร้องเรียน -> อัปเดตข้อมูล -> แจ้งผล)
        ================================================================ */}
        {activeTab === 'reports' && (() => {
          const pendingReportsList = reportList.filter((r) => !r.status || r.status === 'รอตรวจสอบ');
          const resolvedReportsList = reportList.filter((r) => r.status && r.status !== 'รอตรวจสอบ');

          const filteredReports = reportList.filter((rep) => {
            const isPending = !rep.status || rep.status === 'รอตรวจสอบ';
            if (complaintFilter === 'pending' && !isPending) return false;
            if (complaintFilter === 'resolved' && isPending) return false;
            if (complaintSearch.trim()) {
              const q = complaintSearch.toLowerCase();
              const matchId = (rep.id || '').toLowerCase().includes(q);
              const matchUser = (rep.userName || '').toLowerCase().includes(q) || (rep.userId || '').toLowerCase().includes(q);
              const matchBus = (rep.busId || '').toLowerCase().includes(q);
              const matchCat = (rep.category || '').toLowerCase().includes(q);
              const matchDetail = (rep.details || '').toLowerCase().includes(q);
              return matchId || matchUser || matchBus || matchCat || matchDetail;
            }
            return true;
          });

          return (
            <div>
              <div className="pageIntro" style={{ marginBottom: '18px' }}>
                <h2 style={{ wordBreak: 'break-word' }}>จัดการข้อร้องเรียน</h2>
                <p style={{ wordBreak: 'break-word', lineHeight: 1.5 }}>
                  ตรวจสอบข้อร้องเรียน และอัปเดตสถานะการดำเนินการ
                </p>
              </div>

              {/* Summary Stats Grid */}
              <div className="complaintStatsGrid">
                <div
                  className={`complaintStatCard ${complaintFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setComplaintFilter('all')}
                  title="คลิกเพื่อดูข้อร้องเรียนทั้งหมด"
                >
                  <div>
                    <small>ข้อร้องเรียนทั้งหมด</small>
                    <b>{reportList.length} เรื่อง</b>
                  </div>
                  <Flag size={24} color="var(--wu-purple-light)" />
                </div>
                <div
                  className={`complaintStatCard ${complaintFilter === 'pending' ? 'active' : ''}`}
                  onClick={() => setComplaintFilter('pending')}
                  title="คลิกเพื่อกรองเฉพาะรอตรวจสอบ"
                >
                  <div>
                    <small>รอตรวจสอบ / ดำเนินการ</small>
                    <b style={{ color: pendingReportsList.length > 0 ? '#f59e0b' : 'var(--text)' }}>
                      {pendingReportsList.length} เรื่อง
                    </b>
                  </div>
                  <CircleAlert size={24} color="#f59e0b" />
                </div>
                <div
                  className={`complaintStatCard ${complaintFilter === 'resolved' ? 'active' : ''}`}
                  onClick={() => setComplaintFilter('resolved')}
                  title="คลิกเพื่อกรองเฉพาะที่ดำเนินการแล้ว"
                >
                  <div>
                    <small>ดำเนินการเรียบร้อยแล้ว</small>
                    <b style={{ color: 'var(--success)' }}>
                      {resolvedReportsList.length} เรื่อง
                    </b>
                  </div>
                  <CheckCircle2 size={24} color="var(--success)" />
                </div>
              </div>

              {/* Filter and Search Bar */}
              <div className="complaintsFilterBar">
                <div className="complaintsFilterTabs">
                  <button
                    type="button"
                    className={`complaintFilterBtn ${complaintFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setComplaintFilter('all')}
                  >
                    ทั้งหมด ({reportList.length})
                  </button>
                  <button
                    type="button"
                    className={`complaintFilterBtn ${complaintFilter === 'pending' ? 'active' : ''}`}
                    onClick={() => setComplaintFilter('pending')}
                  >
                    รอตรวจสอบ ({pendingReportsList.length})
                  </button>
                  <button
                    type="button"
                    className={`complaintFilterBtn ${complaintFilter === 'resolved' ? 'active' : ''}`}
                    onClick={() => setComplaintFilter('resolved')}
                  >
                    ดำเนินการแล้ว ({resolvedReportsList.length})
                  </button>
                </div>

                <div className="complaintsSearchWrap">
                  <Search size={16} color="var(--muted)" />
                  <input
                    type="text"
                    placeholder="ค้นหารหัสเรื่อง, รถ, ผู้ใช้..."
                    value={complaintSearch}
                    onChange={(e) => setComplaintSearch(e.target.value)}
                  />
                  {complaintSearch && (
                    <button
                      type="button"
                      onClick={() => setComplaintSearch('')}
                      style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 0 }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Desktop Table View (> 860px) */}
              <div className="complaintsDesktopView">
                <div className="panelCard tableCard" style={{ padding: '16px 18px' }}>
                  <div className="tableResponsive" style={{ margin: 0 }}>
                    <table className="complaintsTable">
                      <thead>
                        <tr>
                          <th style={{ width: '75px', whiteSpace: 'nowrap' }}>รหัสเรื่อง</th>
                          <th style={{ minWidth: '120px' }}>ผู้ร้องเรียน</th>
                          <th style={{ width: '75px', whiteSpace: 'nowrap', textAlign: 'center' }}>รถเป้าหมาย</th>
                          <th style={{ width: '85px', whiteSpace: 'nowrap', textAlign: 'center' }}>หมวดหมู่</th>
                          <th style={{ width: '115px', whiteSpace: 'nowrap' }}>เวลาที่แจ้ง</th>
                          <th style={{ minWidth: '130px' }}>รายละเอียด</th>
                          <th style={{ width: '95px', whiteSpace: 'nowrap', textAlign: 'center' }}>สถานะ</th>
                          <th style={{ width: '115px', whiteSpace: 'nowrap', textAlign: 'right' }}>การดำเนินการ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredReports.length > 0 ? (
                          filteredReports.map((rep) => {
                            const isPending = !rep.status || rep.status === 'รอตรวจสอบ';
                            return (
                              <tr key={rep.id}>
                                <td>
                                  <strong style={{ color: 'var(--wu-purple-light)', fontSize: '13px' }}>
                                    {rep.id}
                                  </strong>
                                </td>
                                <td>
                                  <strong style={{ color: 'var(--text)', display: 'block', fontSize: '13px' }}>
                                    {rep.userName || 'ผู้โดยสาร'}
                                  </strong>
                                  <small style={{ color: 'var(--muted)', fontSize: '10.5px', display: 'block', marginTop: '1px' }}>
                                    รหัส: {rep.userId || '-'}
                                  </small>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                  <span className="routeMiniTag" style={{ background: '#5c068c' }}>
                                    {rep.busId}
                                  </span>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                  <span style={{
                                    background: 'var(--bg)', border: '1px solid var(--border)',
                                    borderRadius: '99px', padding: '2px 8px', fontSize: '11px', fontWeight: 700,
                                    whiteSpace: 'nowrap'
                                  }}>
                                    {rep.category}
                                  </span>
                                </td>
                                <td>
                                  <small style={{ color: 'var(--muted)', fontSize: '11px', fontWeight: 600, display: 'block', lineHeight: 1.3 }}>
                                    {rep.timestamp}
                                  </small>
                                </td>
                                <td style={{ fontSize: '12px', lineHeight: 1.45, color: 'var(--text)', wordBreak: 'break-word' }}>
                                  {rep.details}
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                  <span style={{
                                    padding: '3px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 800,
                                    background: !isPending ? 'var(--success-bg)' : 'var(--warning-bg)',
                                    color: !isPending ? 'var(--success)' : 'var(--warning)',
                                    whiteSpace: 'nowrap'
                                  }}>
                                    {isPending ? 'รอตรวจสอบ' : (rep.status || 'ดำเนินการเรียบร้อยแล้ว')}
                                  </span>
                                </td>
                                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                                  {isPending ? (
                                    <button
                                      type="button"
                                      onClick={() => handleQuickResolve(rep.id)}
                                      className="complaintResolveBtn"
                                      style={{ padding: '5px 10px', fontSize: '11px' }}
                                    >
                                      <CheckCircle2 size={13} /> กดดำเนินการ
                                    </button>
                                  ) : (
                                    <span className="complaintDoneBadge" style={{ fontSize: '11px', padding: '3px 8px' }}>
                                      <CheckCircle2 size={12} /> ดำเนินการแล้ว
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--muted)' }}>
                              ไม่พบรายการข้อร้องเรียนที่ตรงกับเงื่อนไข
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Mobile / Tablet Responsive Cards View (<= 860px) */}
              <div className="complaintsMobileView">
                {filteredReports.length > 0 ? (
                  filteredReports.map((rep) => {
                    const isPending = !rep.status || rep.status === 'รอตรวจสอบ';
                    return (
                      <div
                        key={rep.id}
                        className={`complaintAdminCard ${isPending ? 'pendingCard' : ''}`}
                      >
                        <div className="complaintCardTop">
                          <div className="complaintCardBadges">
                            <strong style={{ color: 'var(--wu-purple-light)', fontSize: '13px' }}>
                              {rep.id}
                            </strong>
                            <span className="routeMiniTag" style={{ background: '#5c068c' }}>
                              {rep.busId}
                            </span>
                            <span style={{
                              background: 'var(--bg)', border: '1px solid var(--border)',
                              borderRadius: '99px', padding: '2px 8px', fontSize: '11px', fontWeight: 700
                            }}>
                              {rep.category}
                            </span>
                          </div>
                          <span style={{
                            padding: '3px 9px', borderRadius: '99px', fontSize: '11px', fontWeight: 800,
                            background: !isPending ? 'var(--success-bg)' : 'var(--warning-bg)',
                            color: !isPending ? 'var(--success)' : 'var(--warning)'
                          }}>
                            {isPending ? 'รอตรวจสอบ' : (rep.status || 'ดำเนินการเรียบร้อยแล้ว')}
                          </span>
                        </div>

                        <div className="complaintUserBox">
                          <User size={15} color="var(--muted)" style={{ flexShrink: 0 }} />
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <strong style={{ fontSize: '13.5px', color: 'var(--text)', display: 'block' }}>
                              {rep.userName || 'ผู้โดยสาร'}
                            </strong>
                            <small style={{ color: 'var(--muted)', fontSize: '11.5px', display: 'block' }}>
                              รหัส: {rep.userId || '-'} ({rep.userDept || 'มวล.'})
                            </small>
                          </div>
                        </div>

                        <div className="complaintDetailsBox">
                          {rep.details}
                        </div>

                        <div className="complaintCardBottom">
                          <span className="complaintTimeText">
                            <Clock3 size={13} /> {rep.timestamp}
                          </span>
                          {isPending ? (
                            <button
                              type="button"
                              onClick={() => handleQuickResolve(rep.id)}
                              className="complaintResolveBtn"
                            >
                              <CheckCircle2 size={14} /> กดดำเนินการ
                            </button>
                          ) : (
                            <span className="complaintDoneBadge">
                              <CheckCircle2 size={13} /> ดำเนินการแล้ว
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{
                    background: 'var(--card)', border: '1px solid var(--border)',
                    borderRadius: '18px', padding: '32px 16px', textAlign: 'center', color: 'var(--muted)'
                  }}>
                    ไม่พบรายการข้อร้องเรียนที่ตรงกับเงื่อนไข
                  </div>
                )}
              </div>
            </div>
          );
        })()}


        {/* ================================================================
            TAB 8: NOTIFICATIONS (ศูนย์แจ้งเตือนระบบ)
        ================================================================ */}
        {activeTab === 'notifications' && (
          <NotificationsPage
            setActive={setActiveTab}
            onGoBack={() => setActiveTab('dashboard')}
            userInfo={userInfo}
          />
        )}
      </div>

      {/* ==================================================================
          MODAL 1: ADD/EDIT USER
      ================================================================== */}
      {activeModal === 'user' && (
        <div className="modalOverlay" onClick={() => setActiveModal(null)}>
          <div className="modalCard" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', width: '90%' }}>
            <div className="modalHeader" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>{modalMode === 'add' ? 'เพิ่มผู้ใช้งานใหม่' : 'แก้ไขข้อมูลผู้ใช้'}</h3>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label className="fieldLabel">
                <span>รหัสประจำตัว (ID)</span>
                <input
                  type="text"
                  disabled={modalMode === 'edit'}
                  value={userForm.id}
                  onChange={(e) => setUserForm({ ...userForm, id: e.target.value })}
                  placeholder="เช่น 68108596 หรือ 1809900123456"
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                />
              </label>

              <label className="fieldLabel">
                <span>ชื่อ-นามสกุล</span>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  placeholder="ชื่อ นามสกุล"
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                />
              </label>

              <label className="fieldLabel">
                <span>ประเภทผู้ใช้งาน</span>
                <select
                  value={userForm.userType}
                  onChange={(e) => setUserForm({ ...userForm, userType: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                >
                  <option value="student">นักศึกษา</option>
                  <option value="staff">บุคลากร มวล.</option>
                  <option value="guest">บุคคลภายนอก</option>
                  <option value="admin">ผู้ดูแลระบบ (Admin)</option>
                </select>
              </label>

              <label className="fieldLabel">
                <span>สังกัด / สำนักวิชา</span>
                <input
                  type="text"
                  value={userForm.department}
                  onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
                  placeholder="เช่น สำนักวิชาสารสนเทศศาสตร์"
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                />
              </label>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setActiveModal(null)} className="secondaryBtn" style={{ flex: 1 }}>ยกเลิก</button>
                <button type="submit" className="primaryBtn" style={{ flex: 1 }}>บันทึกข้อมูล</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================
          MODAL 2: ADD/EDIT DRIVER
      ================================================================== */}
      {activeModal === 'driver' && (
        <div className="modalOverlay" onClick={() => setActiveModal(null)}>
          <div className="modalCard" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', width: '90%' }}>
            <div className="modalHeader" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>{modalMode === 'add' ? 'เพิ่มคนขับรถใหม่' : 'แก้ไขข้อมูลคนขับ'}</h3>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveDriver} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label className="fieldLabel">
                <span>รหัสคนขับ 6 หลัก</span>
                <input
                  type="text"
                  disabled={modalMode === 'edit'}
                  value={driverForm.id}
                  onChange={(e) => setDriverForm({ ...driverForm, id: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  placeholder="เช่น 600105"
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                />
              </label>

              <label className="fieldLabel">
                <span>ชื่อ-นามสกุล คนขับ</span>
                <input
                  type="text"
                  value={driverForm.name}
                  onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })}
                  placeholder="เช่น วิทยา ใจดี"
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                />
              </label>

              <label className="fieldLabel">
                <span>รถประจำการ</span>
                <select
                  value={driverForm.busId}
                  onChange={(e) => setDriverForm({ ...driverForm, busId: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                >
                  {buses.map((b) => (
                    <option key={b.id} value={b.id}>{b.id} (สาย {b.route})</option>
                  ))}
                </select>
              </label>

              <label className="fieldLabel">
                <span>สายที่มอบหมาย</span>
                <select
                  value={driverForm.route}
                  onChange={(e) => setDriverForm({ ...driverForm, route: Number(e.target.value) })}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                >
                  <option value={1}>สาย 1</option>
                  <option value={2}>สาย 2</option>
                  <option value={3}>สาย 3</option>
                </select>
              </label>

              <label className="fieldLabel">
                <span>เบอร์โทรติดต่อ</span>
                <input
                  type="text"
                  value={driverForm.phone}
                  onChange={(e) => setDriverForm({ ...driverForm, phone: e.target.value })}
                  placeholder="เช่น 081-234-5678"
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                />
              </label>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setActiveModal(null)} className="secondaryBtn" style={{ flex: 1 }}>ยกเลิก</button>
                <button type="submit" className="primaryBtn" style={{ flex: 1 }}>บันทึกข้อมูล</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================
          MODAL 3: ADD/EDIT BUS
      ================================================================== */}
      {activeModal === 'bus' && (
        <div className="modalOverlay" onClick={() => setActiveModal(null)}>
          <div className="modalCard" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', width: '90%' }}>
            <div className="modalHeader" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>{modalMode === 'add' ? 'เพิ่มรถมันม่วง' : 'แก้ไขข้อมูลรถ'}</h3>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveBus} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label className="fieldLabel">
                <span>ป้ายทะเบียนรถ</span>
                <input
                  type="text"
                  disabled={modalMode === 'edit'}
                  value={busForm.id}
                  onChange={(e) => setBusForm({ ...busForm, id: e.target.value })}
                  placeholder="เช่น WU-401"
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                />
              </label>

              <label className="fieldLabel">
                <span>สายที่วิ่ง</span>
                <select
                  value={busForm.route}
                  onChange={(e) => setBusForm({ ...busForm, route: Number(e.target.value) })}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                >
                  <option value={1}>สาย 1</option>
                  <option value={2}>สาย 2</option>
                  <option value={3}>สาย 3</option>
                </select>
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="secondaryBtn"
                  style={{ margin: 0, minHeight: '46px', justifyContent: 'center', fontSize: '14px', fontWeight: 700 }}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="primaryBtn"
                  style={{ margin: 0, minHeight: '46px', justifyContent: 'center', fontSize: '14px', fontWeight: 700 }}
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================
          MODAL 4: RESOLVE COMPLAINT & NOTIFY DRIVER/USER
      ================================================================== */}
      {resolvingReport && (
        <div className="modalOverlay" onClick={() => setResolvingReport(null)}>
          <div className="modalCard" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', width: '92%' }}>
            <div className="modalHeader" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Flag size={20} color="var(--danger)" />
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
                  จัดการข้อร้องเรียน #{resolvingReport.id}
                </h3>
              </div>
              <button onClick={() => setResolvingReport(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ background: 'var(--bg)', padding: '14px', borderRadius: '14px', marginBottom: '16px', fontSize: '13px' }}>
              <div><strong>รถที่ถูกร้องเรียน:</strong> {resolvingReport.busId}</div>
              <div><strong>หมวดหมู่:</strong> {resolvingReport.category}</div>
              <div><strong>สถานที่:</strong> {resolvingReport.location} ({resolvingReport.timestamp})</div>
              <div style={{ marginTop: '6px', color: 'var(--muted)' }}>"{resolvingReport.details}"</div>
              {resolvingReport.driverResponse && (
                <div style={{
                  marginTop: '10px', padding: '10px 12px', background: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                  <strong style={{ color: '#10b981' }}>การชี้แจง/ผลการแก้ไขจากคนขับ ({resolvingReport.driverResolvedAt || 'เรียบร้อย'}):</strong>
                  <div style={{ marginTop: '3px', color: 'var(--text)' }}>"{resolvingReport.driverResponse}"</div>
                </div>
              )}
            </div>

            <form onSubmit={handleSaveResolution} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <label className="fieldLabel">
                <span>อัปเดตสถานะการดำเนินการ</span>
                <select
                  value={resolutionStatus}
                  onChange={(e) => setResolutionStatus(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)' }}
                >
                  <option value="รอตรวจสอบ">รอตรวจสอบ (Pending)</option>
                  <option value="ส่งให้คนขับแก้ไข">ส่งข้อร้องเรียนให้คนขับเพื่อแก้ไข (Forward to Driver)</option>
                  <option value="แก้ไขเรียบร้อย">แก้ไขและยุติเรื่องเรียบร้อย (Resolved)</option>
                  <option value="ตักเตือน/หักคะแนน">ตักเตือนและหักคะแนนคนขับ (Warning & Penalty)</option>
                </select>
              </label>

              {resolutionStatus === 'ตักเตือน/หักคะแนน' && (
                <label className="fieldLabel">
                  <span>คะแนนที่จะหักคนขับประจำรถ {resolvingReport.busId}</span>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={scoreDeduction}
                    onChange={(e) => setScoreDeduction(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)' }}
                  />
                </label>
              )}

              <label className="fieldLabel">
                <span>บันทึกการดำเนินการของผู้ดูแลระบบ (Admin Resolution Note)</span>
                <textarea
                  rows={3}
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="ระบุผลการตรวจสอบและการแจ้งเตือน..."
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)' }}
                />
              </label>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button type="button" onClick={() => setResolvingReport(null)} className="secondaryBtn" style={{ flex: 1 }}>ยกเลิก</button>
                <button type="submit" className="primaryBtn" style={{ flex: 1 }}>
                  อัปเดตและแจ้งข้อมูลผล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================
          MODAL 5: BROADCAST ANNOUNCEMENT
      ================================================================== */}
      {activeModal === 'announcement' && (
        <div className="modalOverlay" onClick={() => setActiveModal(null)}>
          <div className="modalCard" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', width: '90%' }}>
            <div className="modalHeader" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>{modalMode === 'add' ? 'ยิงประกาศแจ้งเตือนด่วน' : 'แก้ไขข้อมูลประกาศ'}</h3>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label className="fieldLabel">
                <span>หัวข้อประกาศ</span>
                <input
                  type="text"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  placeholder="เช่น สาย 1 เพิ่มความถี่ช่วงพักเที่ยง"
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                />
              </label>

              <label className="fieldLabel">
                <span>หมวดหมู่</span>
                <select
                  value={announcementForm.category}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, category: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                >
                  <option value="ข่าวสารบริการ">ข่าวสารบริการ</option>
                  <option value="สถานะการเดินรถ">สถานะการเดินรถ</option>
                  <option value="แจ้งเตือนด่วน">แจ้งเตือนด่วน</option>
                </select>
              </label>

              <label className="fieldLabel">
                <span>ข้อความประกาศ</span>
                <textarea
                  rows={3}
                  value={announcementForm.text}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, text: e.target.value })}
                  placeholder="รายละเอียดประกาศ..."
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                />
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                <input
                  type="checkbox"
                  checked={announcementForm.urgent}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, urgent: e.target.checked })}
                />
                <span style={{ fontWeight: 700, color: 'var(--danger)' }}>เป็นประกาศด่วนพิเศษ (Urgent Alert)</span>
              </label>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setActiveModal(null)} className="secondaryBtn" style={{ flex: 1 }}>ยกเลิก</button>
                <button type="submit" className="primaryBtn" style={{ flex: 1 }}>{modalMode === 'add' ? 'ส่งประกาศทันที' : 'บันทึกการแก้ไข'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================
          MODAL 6: ADD/EDIT CHATBOT FAQ
      ================================================================== */}
      {activeModal === 'faq' && (
        <div className="modalOverlay" onClick={() => setActiveModal(null)}>
          <div className="modalCard" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', width: '90%' }}>
            <div className="modalHeader" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>{modalMode === 'add' ? 'เพิ่ม FAQ แชทบอท' : 'แก้ไข FAQ แชทบอท'}</h3>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveFaq} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label className="fieldLabel">
                <span>คำถามที่พบบ่อย (Question)</span>
                <input
                  type="text"
                  value={faqForm.question}
                  onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                  placeholder="เช่น รถคันสุดท้ายหมดกี่โมง?"
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                />
              </label>

              <label className="fieldLabel">
                <span>คำตอบ (Answer)</span>
                <textarea
                  rows={3}
                  value={faqForm.answer}
                  onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                  placeholder="คำตอบที่แชทบอทจะตอบกลับ..."
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                />
              </label>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setActiveModal(null)} className="secondaryBtn" style={{ flex: 1 }}>ยกเลิก</button>
                <button type="submit" className="primaryBtn" style={{ flex: 1 }}>{modalMode === 'add' ? 'บันทึกคำตอบ' : 'บันทึกการแก้ไข'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================
          MODAL 7: ADD/EDIT SCHEDULE (จัดการตารางเดินรถ)
      ================================================================== */}
      {activeModal === 'schedule' && (
        <div className="modalOverlay" onClick={() => setActiveModal(null)}>
          <div className="modalCard" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px', width: '90%' }}>
            <div className="modalHeader" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>{modalMode === 'add' ? 'เพิ่มตารางเดินรถใหม่' : 'แก้ไขข้อมูลตารางเดินรถ'}</h3>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveSchedule} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label className="fieldLabel">
                <span>ชื่อกะการเดินรถ (Shift Name)</span>
                <input
                  type="text"
                  value={scheduleForm.shiftName}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, shiftName: e.target.value })}
                  placeholder="เช่น กะเช้า (Morning Shift)"
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                />
              </label>

              <label className="fieldLabel">
                <span>รถประจำการ</span>
                <select
                  value={scheduleForm.busId}
                  onChange={(e) => {
                    const selBus = buses.find((b) => b.id === e.target.value);
                    setScheduleForm({
                      ...scheduleForm,
                      busId: e.target.value,
                      route: selBus ? selBus.route : scheduleForm.route
                    });
                  }}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                >
                  {buses.map((b) => (
                    <option key={b.id} value={b.id}>{b.id} (สาย {b.route})</option>
                  ))}
                </select>
              </label>

              <label className="fieldLabel">
                <span>พนักงานขับรถ</span>
                <select
                  value={scheduleForm.driverId}
                  onChange={(e) => {
                    const drv = driverList.find((d) => String(d.id) === e.target.value);
                    setScheduleForm({
                      ...scheduleForm,
                      driverId: e.target.value,
                      driverName: drv ? drv.name : scheduleForm.driverName
                    });
                  }}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                >
                  {driverList.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.id})</option>
                  ))}
                </select>
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <label className="fieldLabel">
                  <span>เวลาเริ่มเดินรถ</span>
                  <input
                    type="time"
                    value={scheduleForm.startTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                  />
                </label>

                <label className="fieldLabel">
                  <span>เวลาสิ้นสุดการเดินรถ</span>
                  <input
                    type="time"
                    value={scheduleForm.endTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                  />
                </label>
              </div>

              <label className="fieldLabel">
                <span>สถานะการเดินรถ</span>
                <select
                  value={scheduleForm.status}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, status: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                >
                  <option value="กำลังปฏิบัติหน้าที่">กำลังปฏิบัติหน้าที่</option>
                  <option value="ยังไม่ถึงเวลางาน">ยังไม่ถึงเวลางาน</option>
                  <option value="เสร็จสิ้นงาน">เสร็จสิ้นงาน</option>
                </select>
              </label>

              <label className="fieldLabel">
                <span>หมายเหตุ / เส้นทางเฉพาะ</span>
                <input
                  type="text"
                  value={scheduleForm.notes}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                  placeholder="เช่น เสริมรอบหอพักช่วงเช้า"
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                />
              </label>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setActiveModal(null)} className="secondaryBtn" style={{ flex: 1 }}>ยกเลิก</button>
                <button type="submit" className="primaryBtn" style={{ flex: 1 }}>บันทึกข้อมูลตารางเดินรถ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================
          MODAL 9: ADD/EDIT STOP (จัดการจุดจอด)
      ================================================================== */}
      {activeModal === 'stop' && (
        <div className="modalOverlay" onClick={() => setActiveModal(null)}>
          <div className="modalCard" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', width: '90%' }}>
            <div className="modalHeader" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>{modalMode === 'add' ? `เพิ่มจุดจอดใหม่ (สาย ${stopForm.routeId})` : 'แก้ไขข้อมูลจุดจอด'}</h3>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveStop} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label className="fieldLabel">
                <span>ชื่อจุดจอด</span>
                <input
                  type="text"
                  value={stopForm.name}
                  onChange={(e) => setStopForm({ ...stopForm, name: e.target.value })}
                  placeholder="เช่น หน้าอาคารเรียนรวม 5"
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                />
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <label className="fieldLabel">
                  <span>ละติจูด (Lat)</span>
                  <input
                    type="number"
                    step="0.0001"
                    value={stopForm.lat}
                    onChange={(e) => setStopForm({ ...stopForm, lat: parseFloat(e.target.value) })}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                  />
                </label>

                <label className="fieldLabel">
                  <span>ลองจิจูด (Lng)</span>
                  <input
                    type="number"
                    step="0.0001"
                    value={stopForm.lng}
                    onChange={(e) => setStopForm({ ...stopForm, lng: parseFloat(e.target.value) })}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                  />
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setActiveModal(null)} className="secondaryBtn" style={{ flex: 1 }}>ยกเลิก</button>
                <button type="submit" className="primaryBtn" style={{ flex: 1 }}>บันทึกจุดจอด</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================
          MODAL 10: BUS READINESS INSPECTION (ตรวจสอบความพร้อมของรถก่อนให้บริการ)
      ================================================================== */}
      {activeModal === 'inspection' && inspectingBus && (
        <div className="modalOverlay" onClick={() => setActiveModal(null)}>
          <div className="modalCard" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', width: '90%' }}>
            <div className="modalHeader" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0 }}>ตรวจสอบความพร้อมรถ {inspectingBus.id}</h3>
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Pre-trip Safety & IoT Readiness Inspection</span>
              </div>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveInspection} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'var(--bg)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                {[
                  { key: 'tires', label: 'แรงดันลมยางและสภาพล้อรถทั้ง 4 ล้อ' },
                  { key: 'brakes', label: 'ระบบเบรกและน้ำมันเบรก' },
                  { key: 'lights', label: 'ไฟส่องสว่าง ไฟเลี้ยว และไฟหน้า-ท้าย' },
                  { key: 'gps', label: 'สัญญาณดาวเทียม GPS Tracker (ความแม่นยำสูง)' },
                  { key: 'seatSensors', label: 'เซนเซอร์ตรวจจับที่นั่งอัจฉริยะ (Smart Seat Matrix 20 จุด)' },
                  { key: 'doors', label: 'ระบบเปิด-ปิดและเซนเซอร์ความปลอดภัยประตูรถ' },
                  { key: 'aircon', label: 'ระบบปรับอากาศและความสะอาดห้องโดยสาร' }
                ].map((item) => (
                  <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={inspectionChecklist[item.key] || false}
                      onChange={(e) => setInspectionChecklist({ ...inspectionChecklist, [item.key]: e.target.checked })}
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setActiveModal(null)} className="secondaryBtn" style={{ flex: 1 }}>ยกเลิก</button>
                <button type="submit" className="primaryBtn" style={{ flex: 1 }}>ยืนยันความพร้อมและปล่อยรถ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Shell>
  );
}

function Stat({ title, value, icon: Icon, color = 'var(--wu-purple-light)' }) {
  return (
    <article className="statCard">
      <div>
        <small>{title}</small>
        <b style={{ color }}>{value}</b>
      </div>
      <Icon size={26} color={color} />
    </article>
  );
}
