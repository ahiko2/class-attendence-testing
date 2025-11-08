
import React from 'react';
import { CheckCircleIcon, XCircleIcon, ClockIcon, UsersIcon } from './Icons';

interface SummaryCardProps {
  icon: React.ReactNode;
  label: string;
  count: number;
  colorClass: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ icon, label, count, colorClass }) => (
  <div className={`p-4 rounded-lg flex items-center gap-4 shadow-md ${colorClass}`}>
    {icon}
    <div>
      <p className="text-2xl font-bold">{count}</p>
      <p className="text-sm font-medium">{label}</p>
    </div>
  </div>
);

interface AttendanceSummaryProps {
  present: number;
  absent: number;
  late: number;
  total: number;
}

const AttendanceSummary: React.FC<AttendanceSummaryProps> = ({ present, absent, late, total }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <SummaryCard 
        icon={<UsersIcon className="w-10 h-10 text-blue-300"/>}
        label="Total Students"
        count={total}
        colorClass="bg-blue-500 text-white"
      />
      <SummaryCard 
        icon={<CheckCircleIcon className="w-10 h-10 text-green-300"/>}
        label="Present"
        count={present}
        colorClass="bg-green-500 text-white"
      />
      <SummaryCard 
        icon={<XCircleIcon className="w-10 h-10 text-red-300"/>}
        label="Absent"
        count={absent}
        colorClass="bg-red-500 text-white"
      />
      <SummaryCard 
        icon={<ClockIcon className="w-10 h-10 text-yellow-300"/>}
        label="Late"
        count={late}
        colorClass="bg-yellow-500 text-white"
      />
    </div>
  );
};

export default AttendanceSummary;
