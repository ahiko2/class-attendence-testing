export enum AttendanceStatus {
  PRESENT = 'Present',
  ABSENT = 'Absent',
  LATE = 'Late',
  UNMARKED = 'Unmarked',
}

export interface Student {
  id: string;
  name:string;
  avatarUrl: string;
}

export interface ClassData {
  id: string;
  name: string;
  students: Student[];
}

export type Page = 'daily_attendance' | 'student_management' | 'subject_management' | 'calendar_view';

export interface DailyRecord {
  attendance: Record<string, AttendanceStatus>;
  notes: string;
}

export type AttendanceHistory = Record<string, Record<string, DailyRecord>>;