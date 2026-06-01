export type SubjectColor = 'cyan' | 'purple' | 'blue' | 'red' | 'yellow';

export interface Subject {
    _id: string;
    name: string;
    minAttendanceTarget: number;
    color: SubjectColor;
    timetableSlides: { day: string; time: string }[];
    // Stats from backend
    totalClasses?: number;
    attendedClasses?: number;
}

export interface AttendanceRecord {
    _id: string;
    date: string; // ISO date string
    subjectId: string | Subject;
    status: 'Present' | 'Absent' | 'Cancelled';
    note?: string;
}

export interface Note {
    _id: string;
    subjectId: string;
    content: string;
    updatedAt: string;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Cancelled';
