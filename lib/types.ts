export type AttendanceStatus = 'present' | 'absent' | 'late' | 'justified' | null

export interface Student {
  id: string
  name: string
  email: string
  matricula: string
  avatar?: string
}

export interface AttendanceRecord {
  studentId: string
  date: string
  status: AttendanceStatus
  notes?: string
}

export interface Course {
  id: string
  name: string
  code: string
  section: string
  schedule: string
  room: string
  students: Student[]
  attendance: AttendanceRecord[]
}

export interface CalendarEvent {
  id: string
  title: string
  date: string
  type: 'class' | 'exam' | 'deadline' | 'holiday'
  courseId?: string
  description?: string
}

export interface AttendanceStats {
  present: number
  absent: number
  late: number
  justified: number
  unmarked: number
  total: number
}
