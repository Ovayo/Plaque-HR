
export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  hireDate: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  hourlyRate: number;
  avatar: string;
  isActive: boolean;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: 'vacation' | 'sick' | 'personal' | 'unpaid';
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  createdAt: string;
}

export interface LeaveBalance {
  employeeId: string;
  vacation: number;
  sick: number;
  personal: number;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  location?: {
    lat: number;
    lng: number;
  };
  status: 'present' | 'absent' | 'late' | 'on-leave';
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  month: string;
  year: number;
  grossPay: number;
  deductions: number;
  netPay: number;
  status: 'pending' | 'processed' | 'paid';
  hoursWorked: number;
  department: string;
}

export type View = 'dashboard' | 'attendance' | 'payroll' | 'employees' | 'leave' | 'reports';
