export interface Student {
  reg_no: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  faculty: string;
  year_of_study: string;
  national_id?: string;
  photo: string;
}

export type LaptopStatus = 'Active' | 'Stolen' | 'Under Investigation' | 'Decommissioned';

export interface Laptop {
  laptop_id: string;
  reg_no: string;
  brand: string;
  model: string;
  serial_no: string;
  color: string;
  photo: string;
  receipt_photo?: string;
  registered_at: string;
  status: LaptopStatus;
  stolen_reported_at?: string;
  stolen_notes?: string;
  qr_data: string;
}

export interface SecurityGuard {
  guard_id: string;
  name: string;
  badge_no: string;
  gate_assigned: string;
  phone: string;
  photo: string;
}

export interface GateLog {
  log_id: string;
  laptop_id: string;
  reg_no: string;
  guard_id: string;
  gate: string;
  action: 'Entry' | 'Exit';
  timestamp: string;
  date: string;
  status_at_scan: LaptopStatus;
  notes?: string;
}

export interface StudentNotification {
  id: string;
  reg_no: string;
  laptop_id: string;
  laptop_summary: string;
  title: string;
  message: string;
  action: 'Entry' | 'Exit' | 'Stolen Alert' | 'Registration' | 'Recovery';
  gate: string;
  timestamp: string;
  date: string;
  read: boolean;
  sms_sent: boolean;
  email_sent: boolean;
  recipient_phone: string;
  recipient_email: string;
}

export interface GateOccupancyStats {
  gate: string;
  inside: number;
  outside: number;
  todayEntries: number;
  todayExits: number;
  totalRegistered: number;
}

export type UserRole = 'student' | 'guard' | 'admin' | 'thesis';
