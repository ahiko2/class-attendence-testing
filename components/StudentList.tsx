
import React from 'react';
import { Student, AttendanceStatus } from '../types';
import StudentRow from './StudentRow';

interface StudentListProps {
  students: Student[];
  attendance: Record<string, AttendanceStatus>;
  onStatusChange: (studentId: string, status: AttendanceStatus) => void;
}

const StudentList: React.FC<StudentListProps> = ({ students, attendance, onStatusChange }) => {
  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white pb-2 border-b-2 border-gray-200 dark:border-gray-700">
        Student Roster
      </h2>
      {students.map((student) => (
        <StudentRow
          key={student.id}
          student={student}
          status={attendance[student.id] || AttendanceStatus.UNMARKED}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
};

export default StudentList;
