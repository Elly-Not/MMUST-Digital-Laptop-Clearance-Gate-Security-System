import { Student, Laptop, SecurityGuard, GateLog, StudentNotification, GateOccupancyStats } from '../types';
import { INITIAL_STUDENTS, INITIAL_LAPTOPS, INITIAL_GUARDS, INITIAL_GATE_LOGS } from '../data/mockData';

const STORAGE_KEYS = {
  STUDENTS: 'mmust_sec_students_v2',
  LAPTOPS: 'mmust_sec_laptops_v2',
  GUARDS: 'mmust_sec_guards_v2',
  LOGS: 'mmust_sec_logs_v2',
  NOTIFICATIONS: 'mmust_sec_notifications_v2',
};

const INITIAL_NOTIFICATIONS: StudentNotification[] = [
  {
    id: 'NOTIF-101',
    reg_no: 'BIT/0042/2022',
    laptop_id: 'LPT-MMUST-001',
    laptop_summary: 'HP EliteBook 840 G6 (5CD83419KZ)',
    title: 'Gate Pass Clearance: Entry Logged',
    message: 'Your HP EliteBook 840 G6 was cleared for ENTRY at Main Gate (Kakamega - Webuye Highway) by Officer Daniel Wanjala. Timestamp: 07:42 AM.',
    action: 'Entry',
    gate: 'Main Gate (Kakamega - Webuye Highway)',
    timestamp: '07:42 AM',
    date: '2026-09-23',
    read: false,
    sms_sent: true,
    email_sent: true,
    recipient_phone: '+254 712 345 678',
    recipient_email: 'brian.ochieng@student.mmust.ac.ke',
  },
  {
    id: 'NOTIF-102',
    reg_no: 'ENG/0312/2023',
    laptop_id: 'LPT-MMUST-003',
    laptop_summary: 'Lenovo ThinkPad T14 Gen 2 (PF2M8A9K)',
    title: 'Gate Pass Clearance: Entry Logged',
    message: 'Your Lenovo ThinkPad T14 Gen 2 was cleared for ENTRY at Main Gate by Officer Daniel Wanjala. Timestamp: 07:55 AM.',
    action: 'Entry',
    gate: 'Main Gate (Kakamega - Webuye Highway)',
    timestamp: '07:55 AM',
    date: '2026-09-23',
    read: true,
    sms_sent: true,
    email_sent: true,
    recipient_phone: '+254 701 456 789',
    recipient_email: 'kelvin.cheruiyot@student.mmust.ac.ke',
  },
  {
    id: 'NOTIF-103',
    reg_no: 'COM/0119/2021',
    laptop_id: 'LPT-MMUST-002',
    laptop_summary: 'Dell Latitude 5490 (8B21XQ2)',
    title: 'CRITICAL SECURITY ALERT: Laptop Blacklisted',
    message: 'Your Dell Latitude 5490 (S/N: 8B21XQ2) was placed on the MMUST Gate Security Stolen Blacklist. All university gates have been signaled with RED sirens upon scan.',
    action: 'Stolen Alert',
    gate: 'MMUST Security Directorate Headquarters',
    timestamp: '04:40 PM',
    date: '2026-09-21',
    read: false,
    sms_sent: true,
    email_sent: true,
    recipient_phone: '+254 723 987 654',
    recipient_email: 'faith.mwende@student.mmust.ac.ke',
  },
];

export const StorageService = {
  getStudents(): Student[] {
    const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
      return INITIAL_STUDENTS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_STUDENTS;
    }
  },

  getStudentByRegNo(regNo: string): Student | undefined {
    const students = this.getStudents();
    const cleanReg = regNo.trim().toUpperCase();
    return students.find((s) => s.reg_no.trim().toUpperCase() === cleanReg);
  },

  saveStudent(student: Student): void {
    const students = this.getStudents();
    const index = students.findIndex((s) => s.reg_no.toUpperCase() === student.reg_no.toUpperCase());
    if (index >= 0) {
      students[index] = student;
    } else {
      students.unshift(student);
    }
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  },

  getLaptops(): Laptop[] {
    const data = localStorage.getItem(STORAGE_KEYS.LAPTOPS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.LAPTOPS, JSON.stringify(INITIAL_LAPTOPS));
      return INITIAL_LAPTOPS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_LAPTOPS;
    }
  },

  getLaptopsByRegNo(regNo: string): Laptop[] {
    const laptops = this.getLaptops();
    const cleanReg = regNo.trim().toUpperCase();
    return laptops.filter((l) => l.reg_no.trim().toUpperCase() === cleanReg);
  },

  getLaptopById(laptopId: string): Laptop | undefined {
    const laptops = this.getLaptops();
    return laptops.find((l) => l.laptop_id.toUpperCase() === laptopId.toUpperCase());
  },

  findLaptopBySerialOrReg(query: string): Laptop | undefined {
    const clean = query.trim().toUpperCase();
    const laptops = this.getLaptops();
    return laptops.find(
      (l) =>
        l.serial_no.toUpperCase() === clean ||
        l.laptop_id.toUpperCase() === clean ||
        l.qr_data.toUpperCase().includes(clean)
    );
  },

  registerLaptop(laptop: Omit<Laptop, 'laptop_id' | 'registered_at' | 'qr_data'>): Laptop {
    const laptops = this.getLaptops();
    const id = `LPT-MMUST-${String(laptops.length + 1).padStart(3, '0')}`;
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const qr_data = `${laptop.reg_no}-${laptop.serial_no}-${id}`;

    const newLaptop: Laptop = {
      ...laptop,
      laptop_id: id,
      registered_at: timestamp,
      status: 'Active',
      qr_data,
    };

    laptops.unshift(newLaptop);
    localStorage.setItem(STORAGE_KEYS.LAPTOPS, JSON.stringify(laptops));

    // Send registration confirmation notification
    const student = this.getStudentByRegNo(laptop.reg_no);
    if (student) {
      this.addNotification({
        reg_no: laptop.reg_no,
        laptop_id: id,
        laptop_summary: `${laptop.brand} ${laptop.model} (${laptop.serial_no})`,
        title: 'New Device Registered & QR Pass Ready',
        message: `Your laptop ${laptop.brand} ${laptop.model} (S/N: ${laptop.serial_no}) has been registered with MMUST Security Directorate. Your digital QR gate pass is ready for download or printing.`,
        action: 'Registration',
        gate: 'Online Student Portal',
        recipient_phone: student.phone,
        recipient_email: student.email,
      });
    }

    return newLaptop;
  },

  updateLaptopStatus(laptopId: string, status: Laptop['status'], notes?: string): Laptop | undefined {
    const laptops = this.getLaptops();
    const index = laptops.findIndex((l) => l.laptop_id === laptopId);
    if (index === -1) return undefined;

    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    laptops[index].status = status;
    if (status === 'Stolen') {
      laptops[index].stolen_reported_at = timestamp;
      laptops[index].stolen_notes = notes || 'Device reported stolen by owner to MMUST Security Directorate.';
    } else if (status === 'Active') {
      laptops[index].stolen_reported_at = undefined;
      laptops[index].stolen_notes = undefined;
    }

    localStorage.setItem(STORAGE_KEYS.LAPTOPS, JSON.stringify(laptops));

    // Notify student of status update
    const currentLaptop = laptops[index];
    const student = this.getStudentByRegNo(currentLaptop.reg_no);
    if (student) {
      if (status === 'Stolen') {
        this.addNotification({
          reg_no: currentLaptop.reg_no,
          laptop_id: currentLaptop.laptop_id,
          laptop_summary: `${currentLaptop.brand} ${currentLaptop.model} (${currentLaptop.serial_no})`,
          title: 'CRITICAL: Device Flagged as Stolen on All Gates',
          message: `Your laptop ${currentLaptop.brand} ${currentLaptop.model} (S/N: ${currentLaptop.serial_no}) is now blacklisted. Immediate siren alert will activate at MMUST Main Gate, Gate B, and Gate C upon any scan attempt.`,
          action: 'Stolen Alert',
          gate: 'Security Directorate Command',
          recipient_phone: student.phone,
          recipient_email: student.email,
        });
      } else if (status === 'Active') {
        this.addNotification({
          reg_no: currentLaptop.reg_no,
          laptop_id: currentLaptop.laptop_id,
          laptop_summary: `${currentLaptop.brand} ${currentLaptop.model} (${currentLaptop.serial_no})`,
          title: 'Device Clearance Reinstated (Active)',
          message: `Your laptop ${currentLaptop.brand} ${currentLaptop.model} has been marked recovered and unblocked. You can now clear freely across all university gates.`,
          action: 'Recovery',
          gate: 'Security Directorate Command',
          recipient_phone: student.phone,
          recipient_email: student.email,
        });
      }
    }

    return laptops[index];
  },

  getGuards(): SecurityGuard[] {
    const data = localStorage.getItem(STORAGE_KEYS.GUARDS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.GUARDS, JSON.stringify(INITIAL_GUARDS));
      return INITIAL_GUARDS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_GUARDS;
    }
  },

  getGateLogs(): GateLog[] {
    const data = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_GATE_LOGS));
      return INITIAL_GATE_LOGS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_GATE_LOGS;
    }
  },

  addGateLog(params: {
    laptop_id: string;
    reg_no: string;
    guard_id: string;
    gate: string;
    action: 'Entry' | 'Exit';
    status_at_scan: Laptop['status'];
    notes?: string;
  }): { log: GateLog; notification: StudentNotification | null } {
    const logs = this.getGateLogs();
    const now = new Date();
    const hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const timestamp = `${String(formattedHours).padStart(2, '0')}:${minutes} ${ampm}`;
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const newLog: GateLog = {
      log_id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      laptop_id: params.laptop_id,
      reg_no: params.reg_no,
      guard_id: params.guard_id,
      gate: params.gate,
      action: params.action,
      timestamp,
      date,
      status_at_scan: params.status_at_scan,
      notes: params.notes,
    };

    logs.unshift(newLog);
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));

    // AUTOMATIC NOTIFICATION DISPATCH TO STUDENT:
    const student = this.getStudentByRegNo(params.reg_no);
    const laptop = this.getLaptopById(params.laptop_id);
    const guards = this.getGuards();
    const guard = guards.find((g) => g.guard_id === params.guard_id);
    const guardName = guard ? guard.name : 'MMUST Security Officer';

    let notification: StudentNotification | null = null;

    if (student && laptop) {
      const isEntry = params.action === 'Entry';
      const notificationTitle = isEntry
        ? `MMUST Gate Pass: Campus ENTRY Cleared`
        : `MMUST Gate Pass: Campus EXIT Cleared`;
      
      const notificationMsg = isEntry
        ? `Your ${laptop.brand} ${laptop.model} (S/N: ${laptop.serial_no}) was verified for ENTRY at ${params.gate} by ${guardName} at ${timestamp}. SMS confirmation sent to ${student.phone}.`
        : `Your ${laptop.brand} ${laptop.model} (S/N: ${laptop.serial_no}) was verified for EXIT at ${params.gate} by ${guardName} at ${timestamp}. Safe journey! SMS confirmation sent to ${student.phone}.`;

      notification = this.addNotification({
        reg_no: params.reg_no,
        laptop_id: params.laptop_id,
        laptop_summary: `${laptop.brand} ${laptop.model} (${laptop.serial_no})`,
        title: notificationTitle,
        message: notificationMsg,
        action: params.action,
        gate: params.gate,
        recipient_phone: student.phone,
        recipient_email: student.email,
      });
    }

    return { log: newLog, notification };
  },

  // Student Notifications API
  getNotifications(regNo?: string): StudentNotification[] {
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    let list: StudentNotification[] = [];
    if (!data) {
      list = INITIAL_NOTIFICATIONS;
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    } else {
      try {
        list = JSON.parse(data);
      } catch {
        list = INITIAL_NOTIFICATIONS;
      }
    }

    if (regNo) {
      const clean = regNo.trim().toUpperCase();
      return list.filter((n) => n.reg_no.trim().toUpperCase() === clean);
    }
    return list;
  },

  addNotification(params: Omit<StudentNotification, 'id' | 'timestamp' | 'date' | 'read' | 'sms_sent' | 'email_sent'>): StudentNotification {
    const list = this.getNotifications();
    const now = new Date();
    const hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const timestamp = `${String(formattedHours).padStart(2, '0')}:${minutes} ${ampm}`;
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const newNotif: StudentNotification = {
      id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...params,
      timestamp,
      date,
      read: false,
      sms_sent: true,
      email_sent: true,
    };

    list.unshift(newNotif);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    return newNotif;
  },

  markNotificationAsRead(id: string): void {
    const list = this.getNotifications();
    const index = list.findIndex((n) => n.id === id);
    if (index >= 0) {
      list[index].read = true;
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    }
  },

  markAllNotificationsAsRead(regNo: string): void {
    const list = this.getNotifications();
    const clean = regNo.trim().toUpperCase();
    const updated = list.map((n) => (n.reg_no.toUpperCase() === clean ? { ...n, read: true } : n));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
  },

  /**
   * Determine whether a laptop is currently 'Inside' or 'Outside' campus
   * based on its latest gate log.
   */
  getLaptopCurrentLocation(laptopId: string): { status: 'Inside' | 'Outside'; lastLog?: GateLog } {
    const logs = this.getGateLogs();
    const laptopLogs = logs.filter((l) => l.laptop_id === laptopId);
    if (laptopLogs.length === 0) {
      // If no log recorded yet, default to Outside (not yet checked in)
      return { status: 'Outside' };
    }
    // Most recent log is at index 0 because logs are unshifted
    const latest = laptopLogs[0];
    return {
      status: latest.action === 'Entry' ? 'Inside' : 'Outside',
      lastLog: latest,
    };
  },

  /**
   * Summary card calculation for GuardScannerApp:
   * Total laptops currently logged as 'Inside' vs 'Outside' for the selected gate.
   * If selectedGate is 'ALL', calculates campus-wide.
   * If a specific gate is selected:
   * - inside: laptops whose current location is 'Inside' AND whose last entry was at this gate (or overall on campus)
   * - outside: laptops whose last exit was at this gate (or not inside)
   * - todayEntries: total entry scans today at this gate
   * - todayExits: total exit scans today at this gate
   */
  getGateOccupancyStats(selectedGate: string): GateOccupancyStats {
    const laptops = this.getLaptops();
    const logs = this.getGateLogs();
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    let insideCount = 0;
    let outsideCount = 0;

    laptops.forEach((laptop) => {
      const { status, lastLog } = this.getLaptopCurrentLocation(laptop.laptop_id);
      if (selectedGate === 'ALL' || !selectedGate) {
        if (status === 'Inside') {
          insideCount++;
        } else {
          outsideCount++;
        }
      } else {
        // Filtered to selected gate
        if (status === 'Inside') {
          if (lastLog && lastLog.gate === selectedGate) {
            insideCount++;
          }
        } else {
          if (lastLog && lastLog.gate === selectedGate) {
            outsideCount++;
          } else if (!lastLog) {
            outsideCount++;
          }
        }
      }
    });

    const gateLogsToday = logs.filter((l) => {
      const matchDate = l.date === todayStr;
      const matchGate = selectedGate === 'ALL' || !selectedGate ? true : l.gate === selectedGate;
      return matchDate && matchGate;
    });

    const todayEntries = gateLogsToday.filter((l) => l.action === 'Entry').length;
    const todayExits = gateLogsToday.filter((l) => l.action === 'Exit').length;

    return {
      gate: selectedGate,
      inside: insideCount,
      outside: outsideCount,
      todayEntries,
      todayExits,
      totalRegistered: laptops.length,
    };
  },

  resetAll(): void {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
    localStorage.setItem(STORAGE_KEYS.LAPTOPS, JSON.stringify(INITIAL_LAPTOPS));
    localStorage.setItem(STORAGE_KEYS.GUARDS, JSON.stringify(INITIAL_GUARDS));
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_GATE_LOGS));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
  },
};
