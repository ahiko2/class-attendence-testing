
import React from 'react';
import { Student, AttendanceStatus } from '../types';

interface StudentRowProps {
  student: Student;
  status: AttendanceStatus;
  onStatusChange: (studentId: string, status: AttendanceStatus) => void;
}

const StatusButton: React.FC<{
  label: AttendanceStatus;
  isActive: boolean;
  onClick: () => void;
  activeClass: string;
}> = ({ label, isActive, onClick, activeClass }) => {
  const baseClasses = 'px-3 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 ease-in-out transform hover:scale-105';
  const inactiveClasses = 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600';
  const finalClasses = isActive ? `${baseClasses} ${activeClass} text-white shadow-lg` : `${baseClasses} ${inactiveClasses}`;

  return (
    <button onClick={onClick} className={finalClasses}>
      {label}
    </button>
  );
};

const StudentRow: React.FC<StudentRowProps> = ({ student, status, onStatusChange }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 transition-shadow hover:shadow-lg">
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <img src={student.avatarUrl} alt={student.name} className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700" />
        <div>
          <p className="font-bold text-lg text-gray-900 dark:text-white">{student.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">ID: {student.id}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <StatusButton
          label={AttendanceStatus.PRESENT}
          isActive={status === AttendanceStatus.PRESENT}
          onClick={() => onStatusChange(student.id, AttendanceStatus.PRESENT)}
          activeClass="bg-green-500 hover:bg-green-600"
        />
        <StatusButton
          label={AttendanceStatus.LATE}
          isActive={status === AttendanceStatus.LATE}
          onClick={() => onStatusChange(student.id, AttendanceStatus.LATE)}
          activeClass="bg-yellow-500 hover:bg-yellow-600"
        />
        <StatusButton
          label={AttendanceStatus.ABSENT}
          isActive={status === AttendanceStatus.ABSENT}
          onClick={() => onStatusChange(student.id, AttendanceStatus.ABSENT)}
          activeClass="bg-red-500 hover:bg-red-600"
        />
      </div>
    </div>
  );
};

export default StudentRow;
