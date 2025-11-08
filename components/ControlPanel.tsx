
import React from 'react';
import { ClassData } from '../types';

interface ControlPanelProps {
  classes: ClassData[];
  selectedClassId: string;
  onClassChange: (classId: string) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ classes, selectedClassId, onClassChange }) => {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col sm:flex-row justify-between items-center gap-4">
      <div>
        <label htmlFor="class-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Select Class
        </label>
        <select
          id="class-select"
          value={selectedClassId}
          onChange={(e) => onClassChange(e.target.value)}
          className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
        >
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name} ({cls.id})
            </option>
          ))}
        </select>
      </div>
      <div className="text-right">
        <p className="text-lg font-semibold text-gray-800 dark:text-white">{today}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Attendance for today</p>
      </div>
    </div>
  );
};

export default ControlPanel;
