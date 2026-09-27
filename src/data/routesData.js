import {
  Map, Route, Search, Bell, Flag, User, LayoutDashboard,
  CalendarClock, Star, Settings, Database, Gauge, MapPin, Bus, Armchair,
  Radio, Activity, Cpu, CheckCircle2
} from 'lucide-react';

export const ROUTES = [
  {
    id: 1,
    name: 'สาย 1 (หอพัก - อาคารเรียน)',
    startPoint: 'อาคารกิจกรรมนักศึกษา (หอพัก)',
    endPoint: 'อาคารไทยบุรี / อาคารสถาปัตยกรรมฯ',
    color: '#22a447', // Green (matching ViaBus screenshots)
    bgColor: 'rgba(34, 164, 71, 0.12)',
    borderColor: '#22a447',
    polyline: [
      { lat: 8.6475, lng: 99.8936 }, // ตึกกิจกรรม
      { lat: 8.6478, lng: 99.8936 },
      { lat: 8.6478, lng: 99.8929 }, //หัวเลี้ยวหอ 5
      { lat: 8.6475, lng: 99.8928 }, //หัวเลี้ยวหอ 5 (2)
      { lat: 8.6475, lng: 99.8904 },
      { lat: 8.6479, lng: 99.8904 },
      { lat: 8.6486, lng: 99.8904 }, // หอพัก Residence
      { lat: 8.6487, lng: 99.8874 },
      { lat: 8.6479, lng: 99.8873 },
      { lat: 8.64795, lng: 99.8893 }, // ลัก 18
      { lat: 8.64795, lng: 99.8904 },
      { lat: 8.6475, lng: 99.8904 },
      { lat: 8.6475, lng: 99.8928 }, //หัวเลี้ยวหอ 5 (2)
      { lat: 8.6478, lng: 99.8929 }, //หัวเลี้ยวหอ 5
      { lat: 8.6478, lng: 99.8936 },
      { lat: 8.6469, lng: 99.8936 }, // ตึกกิจกรรม
      { lat: 8.6469, lng: 99.8940 }, //แยก อบ
      { lat: 8.6456, lng: 99.8940 }, //ทางผ่านเอดี
      { lat: 8.6451, lng: 99.8942 },
      { lat: 8.6444, lng: 99.8948 },
      { lat: 8.6461, lng: 99.89665 },  //  ทางไปไทยบุรี
      { lat: 8.6459, lng: 99.8970 },
      { lat: 8.6458, lng: 99.8975 },   //หน้าไทยบุรี
      { lat: 8.6458, lng: 99.8978 },
      { lat: 8.6461, lng: 99.8982 },
      { lat: 8.6434, lng: 99.9011 }, //ทางไปตึกบริหาร
      { lat: 8.6426, lng: 99.9019 },
      { lat: 8.6421, lng: 99.9012 },
      { lat: 8.6420, lng: 99.9012 },
      { lat: 8.6419, lng: 99.9018 },
      { lat: 8.6417, lng: 99.9019 },
      { lat: 8.6415, lng: 99.9019 },
      { lat: 8.6413, lng: 99.9017 },
      { lat: 8.6412, lng: 99.9013 },
      { lat: 8.6411, lng: 99.9012 },
      { lat: 8.6405, lng: 99.9017 },
      { lat: 8.6367, lng: 99.8979 },
      { lat: 8.6367, lng: 99.8973 },
      { lat: 8.6369, lng: 99.8967 },
      { lat: 8.6412, lng: 99.8925 },
      { lat: 8.6416, lng: 99.8924 },
      { lat: 8.6420, lng: 99.8925 },
      { lat: 8.6444, lng: 99.8948 }
    ],
    stops: [
      { id: '1-1', name: 'อาคารกิจกรรม', lat: 8.6474, lng: 99.8937 },
      { id: '1-2', name: 'หอพัก Residence', lat: 8.6479, lng: 99.8876 },
      { id: '1-3', name: 'หอพักลักษณานิเวศ 18', lat: 8.6479, lng: 99.8893 },
      { id: '1-4', name: 'หอพักลักษณานิเวศ 5', lat: 8.6475, lng: 99.8921 },
      { id: '1-5', name: 'ตรงข้ามอาคารกิจกรรมนักศึกษา', lat: 8.6474, lng: 99.8936 },
      { id: '1-6', name: 'ศูนย์รวมรถ', lat: 8.6463, lng: 99.8940 },
      { id: '1-7', name: 'อาคารสถาปัตยกรรมและการออกแบบ', lat: 8.6450, lng: 99.8943 },
      { id: '1-8', name: 'อาคารเรียนรวม 3', lat: 8.6446, lng: 99.8951 },
      { id: '1-9', name: 'อาคารไทยบุรี', lat: 8.6458, lng: 99.8975 },
      { id: '1-10', name: 'ตรงข้ามอาคาร ST', lat: 8.6447, lng: 99.8997 },
      { id: '1-11', name: 'อาคารบริหาร (หน้าเสาธง)', lat: 8.6419, lng: 99.9014 },
      { id: '1-12', name: 'โรงพยาบาลสัตว์ใหญ่', lat: 8.6385, lng: 99.8997 },
      { id: '1-13', name: 'ตรงข้ามอาคารวิชาการ 5', lat: 8.6381, lng: 99.8955 },
      { id: '1-14', name: 'ตรงข้ามครัวโปรเชฟ', lat: 8.6392, lng: 99.8944 },
      { id: '1-15', name: 'ตรงข้ามอาคารกายวิภาค', lat: 8.6428, lng: 99.8933 },
      { id: '1-16', name: 'อาคารสถาปัตยกรรมและการออกแบบ', lat: 8.6450, lng: 99.8943 },
      { id: '1-17', name: 'ตรงข้ามอาคารกิจกรรมนักศึกษา', lat: 8.6474, lng: 99.8936 },
    ]
  },
  {
    id: 2,
    name: 'สาย 2 (หอพัก - สนามกีฬา)',
    startPoint: 'อาคารกิจกรรมนักศึกษา (หอพัก)',
    endPoint: 'ศูนย์กีฬา / อาคารพลศึกษา',
    color: '#d4a900', // Yellow/Gold (from ViaBus screenshot)
    bgColor: 'rgba(212, 169, 0, 0.12)',
    borderColor: '#d4a900',
    polyline: [
      { lat: 8.6475, lng: 99.8936 }, // ตึกกิจกรรม
      { lat: 8.6478, lng: 99.8936 },
      { lat: 8.6478, lng: 99.8929 }, //หัวเลี้ยวหอ 5
      { lat: 8.6475, lng: 99.8928 }, //หัวเลี้ยวหอ 5 (2)
      { lat: 8.6475, lng: 99.8904 },
      { lat: 8.6479, lng: 99.8904 },
      { lat: 8.6486, lng: 99.8904 }, // หอพัก Residence
      { lat: 8.6487, lng: 99.8874 },
      { lat: 8.6479, lng: 99.8873 },
      { lat: 8.64795, lng: 99.8893 }, // ลัก 18
      { lat: 8.64795, lng: 99.8904 },
      { lat: 8.6470, lng: 99.8902 }, //แยกป้อมหอเรส
      { lat: 8.6469, lng: 99.8871 },
      { lat: 8.6477, lng: 99.8823 }, //แยกคอร์ด
      { lat: 8.6490, lng: 99.8825 },
      { lat: 8.6495, lng: 99.8798 }, //วงเวียนสนามกีฬา
      { lat: 8.6496, lng: 99.8798 },
      { lat: 8.6495, lng: 99.8797 },
      { lat: 8.6494, lng: 99.8797 },
      { lat: 8.6495, lng: 99.8798 },
      { lat: 8.6494, lng: 99.8797 },
      { lat: 8.6495, lng: 99.8797 },
      { lat: 8.6496, lng: 99.8798 },
      { lat: 8.6495, lng: 99.8798 }, // วงเวียนสนามกีฬา
      { lat: 8.6490, lng: 99.8825 },
      { lat: 8.6477, lng: 99.8823 }, // แยกคอร์ด
      { lat: 8.6469, lng: 99.8871 },
      { lat: 8.6470, lng: 99.8902 }, // แยกป้อมหอเรส
      { lat: 8.64795, lng: 99.8904 },
      { lat: 8.64795, lng: 99.8893 }, // ลัก 18
      { lat: 8.6479, lng: 99.8873 },
      { lat: 8.6487, lng: 99.8874 },
      { lat: 8.6486, lng: 99.8904 }, // หอพัก Residence
      { lat: 8.6479, lng: 99.8904 },
      { lat: 8.6475, lng: 99.8904 },
      { lat: 8.6475, lng: 99.8928 }, // หัวเลี้ยวหอ 5 (2)
      { lat: 8.6478, lng: 99.8929 }, // หัวเลี้ยวหอ 5
      { lat: 8.6478, lng: 99.8936 },
      { lat: 8.6475, lng: 99.8936 }, // ตึกกิจกรรม 
    ],
    stops: [
      { id: '2-1', name: 'อาคารกิจกรรม', lat: 8.6474, lng: 99.8937 },
      { id: '2-2', name: 'หอพัก Residence', lat: 8.6479, lng: 99.8876 },
      { id: '2-3', name: 'หอพักลักษณานิเวศ 18', lat: 8.6479, lng: 99.8893 },
      { id: '2-4', name: 'ตรงข้ามสนามแบดมินตัน', lat: 8.6483, lng: 99.8824 },
      { id: '2-5', name: 'ตรงข้ามอาคารพลศึกษา', lat: 8.6492, lng: 99.8814 },
      { id: '2-6', name: 'สระว่ายน้ำ', lat: 8.6493, lng: 99.8806 },
      { id: '2-7', name: 'สนามเทนนิส', lat: 8.6494, lng: 99.8801 },
    ]
  },
  {
    id: 3,
    name: 'สาย 3 (หอพัก - หน้ามหาวิทยาลัย)',
    startPoint: 'อาคารกิจกรรมนักศึกษา (หอพัก)',
    endPoint: 'โลตัสท่าศาลา / ศูนย์การแพทย์ มวล.',
    color: '#7e22ce', // Purple
    bgColor: 'rgba(126, 34, 206, 0.12)',
    borderColor: '#7e22ce',
    polyline: [
      { lat: 8.6475, lng: 99.8936 }, // ตึกกิจกรรม
      { lat: 8.6478, lng: 99.8936 },
      { lat: 8.6478, lng: 99.8929 }, //หัวเลี้ยวหอ 5
      { lat: 8.6475, lng: 99.8928 }, //หัวเลี้ยวหอ 5 (2)
      { lat: 8.6475, lng: 99.8904 },
      { lat: 8.6479, lng: 99.8904 },
      { lat: 8.6486, lng: 99.8904 }, // หอพัก Residence
      { lat: 8.6487, lng: 99.8874 },
      { lat: 8.6479, lng: 99.8873 },
      { lat: 8.64795, lng: 99.8893 }, // ลัก 18
      { lat: 8.64795, lng: 99.8904 },
      { lat: 8.6475, lng: 99.8904 },
      { lat: 8.6475, lng: 99.8928 }, //หัวเลี้ยวหอ 5 (2)
      { lat: 8.6478, lng: 99.8929 }, //หัวเลี้ยวหอ 5
      { lat: 8.6478, lng: 99.8936 },
      { lat: 8.6469, lng: 99.8936 }, // ตึกกิจกรรม
      { lat: 8.6469, lng: 99.8940 }, //แยก อบ
      { lat: 8.6456, lng: 99.8940 }, //ทางผ่านเอดี
      { lat: 8.6451, lng: 99.8942 },
      { lat: 8.6444, lng: 99.8948 },
      { lat: 8.6461, lng: 99.89665 },  //  ทางไปไทยบุรี
      { lat: 8.6459, lng: 99.8970 },
      { lat: 8.6458, lng: 99.8975 },   //หน้าไทยบุรี
      { lat: 8.6458, lng: 99.8978 },
      { lat: 8.6461, lng: 99.8982 },
      { lat: 8.6434, lng: 99.9011 }, //ทางไปตึกบริหาร
      { lat: 8.6426, lng: 99.9019 },
      { lat: 8.6421, lng: 99.9012 },
      { lat: 8.6420, lng: 99.9012 },
      { lat: 8.6419, lng: 99.9018 },
      { lat: 8.6417, lng: 99.9019 },
      { lat: 8.6416, lng: 99.9031 }, //ทางไปวงเวียน
      { lat: 8.6417, lng: 99.9032 },
      { lat: 8.6417, lng: 99.9034 },  
      { lat: 8.6416, lng: 99.9035 },
      { lat: 8.6416, lng: 99.9086 },
      { lat: 8.6416, lng: 99.9092 },
      { lat: 8.6418, lng: 99.9099 },
      { lat: 8.6421, lng: 99.9106 },
      { lat: 8.6431, lng: 99.9122 },
      { lat: 8.6468, lng: 99.9153 },
      { lat: 8.6492, lng: 99.9165 },
      { lat: 8.6547, lng: 99.9202 },
      { lat: 8.6582, lng: 99.9235 },//แยกหน้ามอ
      { lat: 8.6640, lng: 99.9233 },
      { lat: 8.6640, lng: 99.9235 },
      { lat: 8.6630, lng: 99.9235 },//หน้าโลตัส
      { lat: 8.6583, lng: 99.9237 },
      { lat: 8.6581, lng: 99.9235 },
      { lat: 8.6545, lng: 99.9203 },
      { lat: 8.6487, lng: 99.9162 },
      { lat: 8.6467, lng: 99.9153 },
      { lat: 8.6433, lng: 99.9127 },
      { lat: 8.6403, lng: 99.9156 },
      { lat: 8.6394, lng: 99.9147 },
      { lat: 8.6424, lng: 99.9115 },//ศกพ
      { lat: 8.6415, lng: 99.9093 },
      { lat: 8.6415, lng: 99.9035 },
      { lat: 8.6414, lng: 99.9033 },
      { lat: 8.6414, lng: 99.9032 },
      { lat: 8.6415, lng: 99.9031 },
      { lat: 8.6415, lng: 99.9019 },
      { lat: 8.6417, lng: 99.9019 },
      { lat: 8.6419, lng: 99.9018 },
      { lat: 8.6420, lng: 99.9012 },
      { lat: 8.6421, lng: 99.9012 },
      { lat: 8.6426, lng: 99.9019 },
      { lat: 8.6434, lng: 99.9011 }, // ทางไปตึกบริหาร
      { lat: 8.6461, lng: 99.8982 },
      { lat: 8.6458, lng: 99.8978 },
      { lat: 8.6458, lng: 99.8975 }, // หน้าไทยบุรี
      { lat: 8.6459, lng: 99.8970 },
      { lat: 8.6461, lng: 99.89665 }, // ทางไปไทยบุรี
      { lat: 8.6444, lng: 99.8948 },
      { lat: 8.6451, lng: 99.8942 },
      { lat: 8.6456, lng: 99.8940 }, // ทางผ่านเอดี
      { lat: 8.6469, lng: 99.8940 }, // แยก อบ
      { lat: 8.6469, lng: 99.8936 }, // ตึกกิจกรรม
      { lat: 8.6478, lng: 99.8936 },
      { lat: 8.6478, lng: 99.8929 }, // หัวเลี้ยวหอ 5
      { lat: 8.6475, lng: 99.8928 }, // หัวเลี้ยวหอ 5 (2)
      { lat: 8.6475, lng: 99.8904 },
      { lat: 8.64795, lng: 99.8904 },
      { lat: 8.64795, lng: 99.8893 }, // ลัก 18
      { lat: 8.6479, lng: 99.8873 },
      { lat: 8.6487, lng: 99.8874 },
      { lat: 8.6486, lng: 99.8904 }, // หอพัก Residence
      { lat: 8.6479, lng: 99.8904 },
      { lat: 8.6475, lng: 99.8904 },
      { lat: 8.6475, lng: 99.8928 }, // หัวเลี้ยวหอ 5 (2)
      { lat: 8.6478, lng: 99.8929 }, // หัวเลี้ยวหอ 5
      { lat: 8.6478, lng: 99.8936 },
      { lat: 8.6475, lng: 99.8936 }, // ตึกกิจกรรม
    ],
    stops: [
      { id: '3-1', name: 'อาคารกิจกรรม', lat: 8.6474, lng: 99.8937 },
      { id: '3-2', name: 'หอพัก Residence', lat: 8.6479, lng: 99.8876 },
      { id: '3-3', name: 'หอพักลักษณานิเวศ 18', lat: 8.6479, lng: 99.8893 },
      { id: '3-4', name: 'หอพักลักษณานิเวศ 5', lat: 8.6475, lng: 99.8921 },
      { id: '3-5', name: 'ตรงข้ามอาคารกิจกรรมนักศึกษา', lat: 8.6474, lng: 99.8936 },
      { id: '3-6', name: 'ศูนย์รวมรถ', lat: 8.6463, lng: 99.8940 },
      { id: '3-7', name: 'อาคารสถาปัตยกรรมและการออกแบบ', lat: 8.6450, lng: 99.8943 },
      { id: '3-8', name: 'อาคารเรียนรวม 3', lat: 8.6446, lng: 99.8951 },
      { id: '3-9', name: 'อาคารไทยบุรี', lat: 8.6458, lng: 99.8975 },
      { id: '3-10', name: 'ตรงข้ามอาคาร ST', lat: 8.6447, lng: 99.8997 },
      { id: '3-11', name: 'อาคารบริหาร (หน้าเสาธง)', lat: 8.6419, lng: 99.9014 },
      { id: '3-12', name: 'ศูนย์การแพทย์ มวล.', lat: 8.6446, lng: 99.9134 },
      { id: '3-13', name: 'อาคารบริหาร (หน้าเสาธง)', lat: 8.6419, lng: 99.9014 },
      { id: '3-14', name: 'โรงแรมคุ้มสวัสดิ์', lat: 8.6493, lng: 99.9166 },
      { id: '3-15', name: 'เซเว่นอีเลฟเว่น ถนนวลัยลักษณ์', lat: 8.6545, lng: 99.9203 },
      { id: '3-16', name: 'ทางเข้ามหาวิทยาลัย', lat: 8.6574, lng: 99.9228 },
      { id: '3-17', name: 'โลตัสท่าศาลา', lat: 8.6632, lng: 99.9235 },
    ]
  }
];

export const INITIAL_BUSES = [
  {
    id: 'WU-101',
    route: 1,
    progressIndex: 3,
    speed: 34,
    eta: 3,
    passengers: 15,
    seated: 15,
    standing: 0,
    status: 'กำลังให้บริการ',
    late: 0,
    driverName: 'สมชาย ดีเยี่ยม',
    seats: ['occupied','free','occupied','occupied','occupied','occupied','occupied','free','occupied','occupied','occupied','free','occupied','occupied','occupied','free','occupied','occupied','occupied','free']
  },
  {
    id: 'WU-102',
    route: 1,
    progressIndex: 7,
    speed: 28,
    eta: 6,
    passengers: 20,
    seated: 20,
    standing: 0,
    status: 'ที่นั่งเต็ม',
    late: 2,
    driverName: 'อนันต์ สุขใจ',
    seats: ['occupied','occupied','occupied','occupied','occupied','occupied','occupied','occupied','occupied','occupied','occupied','occupied','occupied','occupied','occupied','occupied','occupied','occupied','occupied','occupied']
  },
  {
    id: 'WU-103',
    route: 1,
    progressIndex: 14,
    speed: 26,
    eta: 5,
    passengers: 11,
    seated: 11,
    standing: 0,
    status: 'กำลังให้บริการ',
    late: 0,
    driverName: 'สุชาติ ใจดี',
    seats: ['occupied','occupied','free','occupied','free','occupied','free','occupied','occupied','occupied','free','occupied','occupied','free','free','occupied','free','occupied','free','free']
  },
  {
    id: 'WU-104',
    route: 1,
    progressIndex: 24,
    speed: 22,
    eta: 8,
    passengers: 10,
    seated: 10,
    standing: 0,
    status: 'กำลังให้บริการ',
    late: 1,
    driverName: 'ณรงค์ มีสุข',
    seats: ['occupied','free','occupied','occupied','free','occupied','free','free','occupied','occupied','free','occupied','occupied','free','free','occupied','free','free','occupied','free']
  },
  {
    id: 'WU-201',
    route: 2,
    progressIndex: 2,
    speed: 24,
    eta: 4,
    passengers: 13,
    seated: 13,
    standing: 0,
    status: 'กำลังให้บริการ',
    late: 0,
    driverName: 'วิชัย มั่นคง',
    seats: ['occupied','free','occupied','occupied','free','occupied','free','occupied','occupied','free','occupied','occupied','free','free','occupied','occupied','free','occupied','occupied','free']
  },
  {
    id: 'WU-301',
    route: 3,
    progressIndex: 4,
    speed: 18,
    eta: 9,
    passengers: 9,
    seated: 9,
    standing: 0,
    status: 'รถมาสายเกิน 5 นาที',
    late: 7,
    driverName: 'ประเสริฐ เจริญดี',
    seats: ['occupied','free','free','occupied','free','occupied','free','occupied','free','occupied','free','free','occupied','occupied','free','free','free','occupied','free','free']
  },
  {
    id: 'WU-302',
    route: 3,
    progressIndex: 20,
    speed: 30,
    eta: 4,
    passengers: 16,
    seated: 16,
    standing: 0,
    status: 'กำลังให้บริการ',
    late: 0,
    driverName: 'อำนาจ พรชัย',
    seats: ['occupied','occupied','occupied','free','occupied','occupied','free','occupied','occupied','free','occupied','occupied','occupied','free','occupied','occupied','free','occupied','occupied','occupied']
  },
  {
    id: 'WU-303',
    route: 3,
    progressIndex: 46,
    speed: 25,
    eta: 6,
    passengers: 10,
    seated: 10,
    standing: 0,
    status: 'กำลังให้บริการ',
    late: 1,
    driverName: 'เกรียงไกร สุขสันต์',
    seats: ['occupied','free','occupied','occupied','free','occupied','free','occupied','occupied','free','occupied','free','occupied','free','free','occupied','free','free','occupied','free']
  },
];

export const INITIAL_REPORTS = [
  {
    id: 'REP-101',
    busId: 'WU-101',
    driverId: '600101',
    driverName: 'สมชาย ดีเยี่ยม',
    userId: '68108596',
    category: 'ไม่จอดรับผู้โดยสาร',
    location: 'บริเวณหน้าอาคารไทยบุรี',
    timestamp: 'วันนี้ 09:30 น.',
    details: 'รถไม่ชะลอจอดรับผู้โดยสารที่ยืนรอตรงจุดจอด ทั้งที่มีที่นั่งว่าง',
    scoreImpact: -3,
    status: 'รอตรวจสอบ',
    adminNote: '',
    driverResponse: '',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'REP-102',
    busId: 'WU-102',
    driverId: '600102',
    driverName: 'อนันต์ สุขใจ',
    userId: '68108596',
    category: 'ขับรถเร็ว',
    location: 'ถนนสายหลักหน้าศูนย์บรรณสาร',
    timestamp: 'เมื่อวานนี้ 14:15 น.',
    details: 'ขับขี่ค่อนข้างเร็วในเขตจำกัดความเร็ว 30 km/h',
    scoreImpact: -5,
    status: 'ตักเตือน/หักคะแนน',
    adminNote: 'ผู้ดูแลระบบตรวจสอบพิกัด GPS ยืนยันความเร็ว 38 km/h ได้ส่งตักเตือนและตัดคะแนนความประพฤติ 5 คะแนน',
    driverResponse: 'รับทราบครับ จะระมัดระวังและควบคุมความเร็วไม่เกิน 30 km/h ครับ',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'REP-103',
    busId: 'WU-101',
    driverId: '600101',
    driverName: 'สมชาย ดีเยี่ยม',
    userId: '68108596',
    category: 'พฤติกรรมไม่สุภาพ',
    location: 'จุดจอดหน้าหอพักลักษณานิเวศ',
    timestamp: '2 วันที่แล้ว',
    details: 'ปิดประตูก่อนผู้โดยสารก้าวพ้นบันไดรถ',
    scoreImpact: -3,
    status: 'แก้ไขเรียบร้อย',
    adminNote: 'ผู้ดูแลระบบได้ส่งเรื่องให้คนขับ และตักเตือนให้ตรวจสอบกระจกข้างก่อนออกรถ',
    driverResponse: 'คนขับขออภัยในความไม่สะดวก ได้ตักเตือนตนเองและจะตรวจดูกระจกข้างทุกครั้งก่อนปิดประตูและออกรถครับ',
    driverResolvedAt: '10:45 น.',
    resolvedAt: '11:00 น.',
    createdAt: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 'REP-104',
    busId: 'WU-201',
    driverId: '600201',
    driverName: 'วิชัย มั่นคง',
    userId: '68108596',
    category: 'ขับรถเร็ว',
    location: 'สามแยกอาคารสถาปัตยกรรมฯ',
    timestamp: '3 วันที่แล้ว',
    details: 'ขับกระตุกและเข้าโค้งค่อนข้างเร็ว',
    scoreImpact: -4,
    status: 'ตักเตือน/หักคะแนน',
    adminNote: 'แอดมินตรวจสอบบันทึก Telemetry ยืนยันแรงเหวี่ยงเกินเกณฑ์ ตัดคะแนนความประพฤติ 4 คะแนน',
    driverResponse: '',
    createdAt: new Date(Date.now() - 259200000).toISOString()
  },
  {
    id: 'REP-105',
    busId: 'WU-301',
    driverId: '600301',
    driverName: 'อำนาจ ชูเชิด',
    userId: '68108596',
    category: 'ออกรถก่อนเวลา',
    location: 'จุดจอดโลตัสท่าศาลา',
    timestamp: '4 วันที่แล้ว',
    details: 'ออกรถก่อนรอบเวลาในตาราง 2 นาที',
    scoreImpact: -2,
    status: 'แก้ไขเรียบร้อย',
    adminNote: 'แจ้งคนขับให้รักษารอบเวลาตามตารางเดินรถอย่างเคร่งครัด',
    driverResponse: 'รับทราบครับ จะเทียบเวลากลางและออกรถตรงตามตารางครับ',
    driverResolvedAt: '16:30 น.',
    resolvedAt: '17:00 น.',
    createdAt: new Date(Date.now() - 345600000).toISOString()
  }
];

export const CAMPUS_BUILDINGS = [
  { name: 'อาคารไทยบุรี', x: 48, y: 52, category: 'อาคารเรียนรวม', route: 1 },
  { name: 'อาคารบริหาร (ตรงข้ามเสาธง)', x: 45, y: 42, category: 'สำนักงานบริหาร', route: 2 },
  { name: 'อาคารกิจกรรมนักศึกษา', x: 63, y: 72, category: 'ศูนย์กิจกรรม', route: 1 },
  { name: 'อาคารสถาปัตยกรรมฯ', x: 42, y: 72, category: 'อาคารเรียน', route: 2 },
  { name: 'โรงพยาบาลสัตว์ใหญ่', x: 34, y: 38, category: 'ศูนย์การแพทย์', route: 2 },
  { name: 'สวนวลัยลักษณ์', x: 32, y: 28, category: 'สวนสาธารณะ', route: 3 },
  { name: 'อาคารพลศึกษา / สระว่ายน้ำ', x: 48, y: 84, category: 'ศูนย์กีฬา', route: 2 },
  { name: 'หอพัก Residence / ลักษณานิเวศ', x: 80, y: 45, category: 'หอพักนักศึกษา', route: 1 },
  { name: 'โลตัสท่าศาลา', x: 88, y: 15, category: 'ศูนย์การค้า / จุดจอดนอก มวล.', route: 3 }
];

export const INITIAL_ANNOUNCEMENTS = [
  {
    id: 1,
    title: 'สาย 3 เพิ่มเที่ยววิ่งช่วงพักเที่ยง',
    time: '10 นาทีที่แล้ว',
    category: 'ข่าวสารบริการ',
    urgent: false,
    text: 'เพื่อรองรับผู้ใช้บริการช่วงเวลา 11:30 - 13:30 น. เพิ่มความถี่วิ่งทุก 8 นาที'
  },
  {
    id: 2,
    title: 'แจ้งเตือน: รถ WU-301 ล่าช้า 7 นาที',
    time: '25 นาทีที่แล้ว',
    category: 'สถานะการเดินรถ',
    urgent: true,
    text: 'เนื่องจากมีปริมาณการจราจรหนาแน่นบริเวณประตูทางเข้ามหาวิทยาลัย'
  },
  {
    id: 3,
    title: 'update เซนเซอร์ตรวจจับที่นั่งเวอร์ชันใหม่',
    time: 'เมื่อวานนี้',
    category: 'อัปเดตระบบ',
    urgent: false,
    text: 'เซนเซอร์ตรวจจับที่นั่ง 14 จุด ส่งข้อมูลแม่นยำแบบ Real-time 100%'
  }
];

export const INITIAL_SENSORS = [
  {
    id: 'SNS-101-GPS',
    name: 'GPS Tracker ประจำรถ WU-101',
    type: 'GPS Tracker',
    busId: 'WU-101',
    location: 'ห้องคนขับ WU-101 (สาย 1)',
    status: 'ปกติ',
    lastPing: '1 วินาทีที่แล้ว',
    battery: '100% (ต่อไฟตรง)',
    accuracy: '±1.2 เมตร',
    reading: 'พิกัด 8.6475, 99.8936 | ความเร็ว 22 km/h'
  },
  {
    id: 'SNS-101-SEAT',
    name: 'Smart Seat Matrix 20 จุด (WU-101)',
    type: 'Smart Seat Matrix',
    busId: 'WU-101',
    location: 'เบาะห้องโดยสาร 20 ที่นั่ง WU-101',
    status: 'กำลังส่งข้อมูล',
    lastPing: '2 วินาทีที่แล้ว',
    battery: '98%',
    accuracy: '100%',
    reading: 'ที่นั่งว่าง 6/20 | น้ำหนักเฉลี่ย 54 kg/ที่นั่ง'
  },
  {
    id: 'SNS-101-IR',
    name: 'Infrared Passenger Counter ประตูหน้า-กลาง (WU-101)',
    type: 'Passenger Counter (IR)',
    busId: 'WU-101',
    location: 'บันไดขึ้น-ลง WU-101',
    status: 'ปกติ',
    lastPing: '3 วินาทีที่แล้ว',
    battery: '95%',
    accuracy: '98.8%',
    reading: 'ขึ้น 38 คน | ลง 24 คน | ยืน 0 คน'
  },
  {
    id: 'SNS-101-DOOR',
    name: 'Door Safety Sensor (WU-101)',
    type: 'Door Sensor',
    busId: 'WU-101',
    location: 'กลอนประตูอัตโนมัติ WU-101',
    status: 'ปกติ',
    lastPing: '5 วินาทีที่แล้ว',
    battery: '100%',
    accuracy: '100%',
    reading: 'ปิดสนิท (ประตูปิดก่อนออกรถ)'
  },
  {
    id: 'SNS-201-GPS',
    name: 'GPS Tracker ประจำรถ WU-201',
    type: 'GPS Tracker',
    busId: 'WU-201',
    location: 'ห้องคนขับ WU-201 (สาย 2)',
    status: 'ปกติ',
    lastPing: '2 วินาทีที่แล้ว',
    battery: '100%',
    accuracy: '±1.5 เมตร',
    reading: 'พิกัด 8.6495, 99.8798 | ความเร็ว 18 km/h'
  },
  {
    id: 'SNS-201-SEAT',
    name: 'Smart Seat Matrix 20 จุด (WU-201)',
    type: 'Smart Seat Matrix',
    busId: 'WU-201',
    location: 'เบาะห้องโดยสาร 20 ที่นั่ง WU-201',
    status: 'กำลังส่งข้อมูล',
    lastPing: '3 วินาทีที่แล้ว',
    battery: '96%',
    accuracy: '100%',
    reading: 'ที่นั่งว่าง 12/20 | มีผู้โดยสาร 8 คน'
  },
  {
    id: 'SNS-301-GPS',
    name: 'GPS Tracker ประจำรถ WU-301',
    type: 'GPS Tracker',
    busId: 'WU-301',
    location: 'ห้องคนขับ WU-301 (สาย 3)',
    status: 'ปกติ',
    lastPing: '1 วินาทีที่แล้ว',
    battery: '100%',
    accuracy: '±1.1 เมตร',
    reading: 'พิกัด 8.6582, 99.9235 | ความเร็ว 32 km/h'
  },
  {
    id: 'SNS-STP-THB',
    name: 'IoT Station Camera & Beacon (อาคารไทยบุรี)',
    type: 'Station IoT Hub',
    busId: '-',
    location: 'จุดจอดหน้าอาคารไทยบุรี',
    status: 'ปกติ',
    lastPing: '10 วินาทีที่แล้ว',
    battery: 'ระบบไฟฟ้าโซลาร์เซลล์',
    accuracy: '99.9%',
    reading: 'ตรวจพบผู้โดยสารรอรถ 7 คน'
  }
];

export const INITIAL_SCHEDULES = [
  {
    id: 'SCH-01',
    driverId: '600101',
    driverName: 'สมชาย ดีเยี่ยม',
    busId: 'WU-101',
    route: 1,
    shiftName: 'กะเช้า (Morning Rush)',
    startTime: '07:00',
    endTime: '12:00',
    frequency: 'ทุก 8 นาที',
    status: 'กำลังปฏิบัติหน้าที่',
    notes: 'วิ่งวนรอบหอพัก - อาคารเรียนรวม 3 - อาคารไทยบุรี'
  },
  {
    id: 'SCH-02',
    driverId: '600102',
    driverName: 'อนันต์ สุขใจ',
    busId: 'WU-102',
    route: 1,
    shiftName: 'กะบ่าย (Afternoon Shift)',
    startTime: '12:00',
    endTime: '17:00',
    frequency: 'ทุก 10 นาที',
    status: 'เตรียมเข้ากะ',
    notes: 'เสริมรอบหอพัก Residence ช่วงเลิกเรียน'
  },
  {
    id: 'SCH-03',
    driverId: '600201',
    driverName: 'วิชัย มั่นคง',
    busId: 'WU-201',
    route: 2,
    shiftName: 'กะเช้า-บ่าย (Day Shift)',
    startTime: '07:30',
    endTime: '15:30',
    frequency: 'ทุก 12 นาที',
    status: 'กำลังปฏิบัติหน้าที่',
    notes: 'สายศูนย์กีฬา - หอพักนักศึกษา'
  },
  {
    id: 'SCH-04',
    driverId: '600301',
    driverName: 'อำนาจ ชูเชิด',
    busId: 'WU-301',
    route: 3,
    shiftName: 'กะเช้า (Medical Shuttle)',
    startTime: '07:00',
    endTime: '13:00',
    frequency: 'ทุก 15 นาที',
    status: 'กำลังปฏิบัติหน้าที่',
    notes: 'วิ่งบริการเชื่อมต่อศูนย์การแพทย์ มวล. และหน้ามหาวิทยาลัย'
  },
  {
    id: 'SCH-05',
    driverId: '600302',
    driverName: 'บุญส่ง แก้วมณี',
    busId: 'WU-302',
    route: 3,
    shiftName: 'กะค่ำ (Evening Express)',
    startTime: '16:00',
    endTime: '21:00',
    frequency: 'ทุก 10 นาที',
    status: 'เตรียมเข้ากะ',
    notes: 'รอบบริการรับ-ส่งนักศึกษาและบุคลากรกลับหอพัก'
  }
];

export const passengerNav = [
  { id: 'home', label: 'หน้าแรก', icon: LayoutDashboard },
  { id: 'map', label: 'ตำแหน่งรถ', icon: Map },
  { id: 'seats', label: 'จำนวนที่นั่งว่าง', icon: Armchair },
  { id: 'routes', label: 'เส้นทาง & จุดจอด', icon: Route },
  { id: 'search', label: 'ค้นหาจุดจอด', icon: Search },
  { id: 'report', label: 'ร้องเรียนคนขับ', icon: Flag },
  { id: 'profile', label: 'โปรไฟล์ & ตั้งค่า', icon: User }
];

export const driverNav = [
  { id: 'driver-home', label: 'หน้าหลัก', icon: Gauge },
  { id: 'driver-schedule', label: 'ตารางการขับรถ', icon: CalendarClock },
  { id: 'driver-stops', label: 'ตารางเส้นทาง & จุดจอด', icon: MapPin },
  { id: 'driver-reports', label: 'การร้องเรียน', icon: Flag },
  { id: 'profile', label: 'โปรไฟล์ & ตั้งค่า', icon: User }
];

export const adminNav = [
  { id: 'dashboard', label: 'ภาพรวมระบบ', icon: LayoutDashboard },
  { id: 'users', label: 'จัดการข้อมูลผู้ใช้งาน', icon: User },
  { id: 'drivers', label: 'จัดการข้อมูลคนขับรถ', icon: Gauge },
  { id: 'buses', label: 'จัดการข้อมูลรถมันม่วง', icon: Bus },
  { id: 'schedules', label: 'จัดการตารางเดินรถ', icon: CalendarClock },
  { id: 'routes', label: 'จัดการเส้นทาง & จุดจอด', icon: Route },
  { id: 'reports', label: 'จัดการข้อมูลร้องเรียน', icon: Flag }
];

// ======================================================================
// USER & STAFF & ADMIN DATASETS (นักศึกษา, บุคลากร, บุคคลภายนอก, ผู้ดูแลระบบ, คนขับ)
// ======================================================================

export const MOCK_ADMINS = [
  {
    id: 'admin',
    password: 'admin',
    name: 'ผู้ดูแลระบบกลาง มวล. (Super Admin)',
    roleLabel: 'ผู้ดูแลระบบ (Admin)',
    department: 'ศูนย์เทคโนโลยีดิจิทัล (DTC)',
    status: 'ผู้ดูแลระบบหลัก'
  },
  {
    id: 'ADMIN-01',
    password: 'admin',
    name: 'นายเกรียงศักดิ์ คมนาคม (Fleet Supervisor)',
    roleLabel: 'ผู้ดูแลระบบ (Fleet Admin)',
    department: 'ฝ่ายยานพาหนะและบริการ มวล.',
    status: 'ผู้ดูแลระบบยานพาหนะ'
  }
];

export const MOCK_STUDENTS = [
  { id: '68108596', password: '123456', name: 'นภัทรสรณ์ ศรีชาย', faculty: 'สำนักวิชาสารสนเทศศาสตร์', major: 'เทคโนโลยีสารสนเทศอัจฉริยะ', year: 'ชั้นปีที่ 2', status: 'นักศึกษาปกติ' },
  { id: '68112233', password: '123456', name: 'สมชาย ใจดี', faculty: 'สำนักวิชาพยาบาลศาสตร์', major: 'พยาบาลศาสตร์', year: 'ชั้นปีที่ 2', status: 'นักศึกษาปกติ' },
  { id: '69155443', password: '123456', name: 'สมศรี ขยันยิ่ง', faculty: 'สำนักวิชาวิศวกรรมศาสตร์และเทคโนโลยี', major: 'วิศวกรรมคอมพิวเตอร์และปัญญาประดิษฐ์', year: 'ชั้นปีที่ 1', status: 'นักศึกษาปกติ' },
  { id: '65123456', password: '123456', name: 'จิดาภา แสงจันทร์', faculty: 'สำนักวิชาเภสัชศาสตร์', major: 'เภสัชกรรม', year: 'ชั้นปีที่ 5', status: 'นักศึกษาปกติ' },
  { id: '67199887', password: '123456', name: 'สุริวัล ทองเทพ', faculty: 'สำนักวิชาสารสนเทศศาสตร์', major: 'นิเทศศาสตร์', year: 'ชั้นปีที่ 3', status: 'นักศึกษาปกติ' }
];

export const MOCK_STAFF = [
  { id: '1809900123456', password: '123456', name: 'ดร.สมเกียรติ มั่งคั่ง', department: 'ศูนย์นวัตกรรมดิจิทัล', position: 'นักวิชาการคอมพิวเตอร์', status: 'บุคลากร มวล.' },
  { id: '3800100456789', password: '123456', name: 'ผศ.ดร.วรรณภา จันทร์หอม', department: 'ศูนย์ส่งเสริมและพัฒนานักศึกษา', position: 'นักพัฒนากิจกรรมสร้างสรรค์', status: 'บุคลากร มวล.' },
  { id: '1100500987654', password: '123456', name: 'ศิริพร บุญช่วย', department: 'ประชาชนทั่วไป / ผู้ใช้บริการ', position: 'บุคคลภายนอก', status: 'ประชาชนทั่วไป' },
  { id: '5801200345678', password: '123456', name: 'วิชัย เกียรติบูรพา', department: 'ประชาชนทั่วไป / ผู้ใช้บริการ', position: 'บุคคลภายนอก', status: 'ประชาชนทั่วไป' }
];

export const MOCK_DRIVERS = [
  { id: '600101', password: '123456', name: 'สมชาย ดีเยี่ยม', busId: 'WU-101', route: 1, phone: '081-234-5678', experienceYears: 8, score: 94, status: 'กำลังให้บริการ' },
  { id: '600102', password: '123456', name: 'อนันต์ สุขใจ', busId: 'WU-102', route: 1, phone: '089-876-5432', experienceYears: 12, score: 95, status: 'กำลังให้บริการ' },
  { id: '600103', password: '123456', name: 'สุชาติ ใจดี', busId: 'WU-103', route: 1, phone: '086-555-1234', experienceYears: 6, score: 100, status: 'กำลังให้บริการ' },
  { id: '600201', password: '123456', name: 'วิชัย มั่นคง', busId: 'WU-201', route: 2, phone: '082-333-4455', experienceYears: 10, score: 96, status: 'กำลังให้บริการ' },
  { id: '600202', password: '123456', name: 'ประเสริฐ ยิ้มแย้ม', busId: 'WU-202', route: 2, phone: '084-666-7788', experienceYears: 5, score: 100, status: 'กำลังให้บริการ' },
  { id: '600301', password: '123456', name: 'อำนาจ ชูเชิด', busId: 'WU-301', route: 3, phone: '088-999-0011', experienceYears: 14, score: 98, status: 'กำลังให้บริการ' },
  { id: '600302', password: '123456', name: 'บุญส่ง แก้วมณี', busId: 'WU-302', route: 3, phone: '083-444-2211', experienceYears: 7, score: 100, status: 'พักกะการทำงาน' }
];

// Password Storage Persistence Helpers
export const getStoredPassword = (userId, defaultPw = '123456') => {
  try {
    const customPws = JSON.parse(localStorage.getItem('wu_bus_custom_passwords_v1') || '{}');
    if (customPws && customPws[userId]) {
      return customPws[userId];
    }
  } catch (e) {}
  return defaultPw;
};

export const setStoredPassword = (userId, newPw) => {
  try {
    const customPws = JSON.parse(localStorage.getItem('wu_bus_custom_passwords_v1') || '{}');
    customPws[userId] = newPw;
    localStorage.setItem('wu_bus_custom_passwords_v1', JSON.stringify(customPws));
    return true;
  } catch (e) {
    return false;
  }
};
