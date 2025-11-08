import React, { useState, useMemo, useEffect } from 'react';
import { CalendarIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '../components/Icons';
import { AttendanceHistory, ClassData, AttendanceStatus, DailyRecord } from '../types';
import isEqual from 'lodash.isequal';
import Toast from '../components/Toast';


const StatusButton: React.FC<{
  label: AttendanceStatus;
  isActive: boolean;
  onClick: () => void;
  activeClass: string;
  size?: 'sm' | 'md'
}> = ({ label, isActive, onClick, activeClass, size = 'md' }) => {
  const baseClasses = 'rounded-md font-semibold transition-all duration-200 ease-in-out transform hover:scale-105';
  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';
  const inactiveClasses = 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600';
  const finalClasses = isActive ? `${baseClasses} ${sizeClasses} ${activeClass} text-white shadow-lg` : `${baseClasses} ${sizeClasses} ${inactiveClasses}`;

  return (
    <button onClick={onClick} className={finalClasses}>
      {label}
    </button>
  );
};

interface CalendarViewProps {
    classesData: ClassData[];
    attendanceHistory: AttendanceHistory;
    saveAttendance: (classId: string, date: string, attendanceData: Record<string, AttendanceStatus>, notes: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ classesData, attendanceHistory, saveAttendance }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedClassId, setSelectedClassId] = useState<string>(classesData[0]?.id || '');
    const [selectedDay, setSelectedDay] = useState<DailyRecord & { date: Date } | null>(null);

    const [editedAttendance, setEditedAttendance] = useState<Record<string, AttendanceStatus>>({});
    const [editedNotes, setEditedNotes] = useState('');
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const isDirty = useMemo(() => {
        if (!selectedDay) return false;
        const notesChanged = selectedDay.notes !== editedNotes;
        const attendanceChanged = !isEqual(selectedDay.attendance, editedAttendance);
        return notesChanged || attendanceChanged;
    }, [selectedDay, editedNotes, editedAttendance]);

    useEffect(() => {
        if (selectedDay) {
            setEditedAttendance(selectedDay.attendance);
            setEditedNotes(selectedDay.notes);
        }
    }, [selectedDay]);

    const selectedClassStudents = useMemo(() => {
        return classesData.find(c => c.id === selectedClassId)?.students || [];
    }, [selectedClassId, classesData]);

    const changeMonth = (offset: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
        setSelectedDay(null);
    };

    const calendarGrid = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    }, [currentDate]);

    const getSummaryForDay = (date: Date): { present: number; absent: number; late: number; total: number } => {
        const dateString = date.toISOString().split('T')[0];
        const record = attendanceHistory[selectedClassId]?.[dateString];
        if (!record) return { present: 0, absent: 0, late: 0, total: 0 };
        
        const summary = { present: 0, absent: 0, late: 0 };
        let total = 0;
        Object.values(record.attendance).forEach(status => {
            if (status === AttendanceStatus.PRESENT) summary.present++;
            if (status === AttendanceStatus.ABSENT) summary.absent++;
            if (status === AttendanceStatus.LATE) summary.late++;
            if (status !== AttendanceStatus.UNMARKED) total++;
        });
        return { ...summary, total };
    };
    
    const handleDayClick = (date: Date) => {
        const dateString = date.toISOString().split('T')[0];
        const record = attendanceHistory[selectedClassId]?.[dateString];
        if (record) {
            setSelectedDay({ ...record, date });
        } else {
            setSelectedDay(null);
        }
    };
    
    const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
        setEditedAttendance(prev => {
            if (prev[studentId] === status) {
                 return { ...prev, [studentId]: AttendanceStatus.UNMARKED };
            }
            return { ...prev, [studentId]: status };
        });
    };

    const handleSaveChanges = () => {
        if (!selectedDay || !isDirty) return;
        const dateString = selectedDay.date.toISOString().split('T')[0];
        saveAttendance(selectedClassId, dateString, editedAttendance, editedNotes);
        setToastMessage('Changes saved successfully!');
        // Manually update selectedDay to reflect changes immediately without a full reload
        setSelectedDay(prev => prev ? { ...prev, attendance: editedAttendance, notes: editedNotes } : null);
    };
    
    const handleCancelChanges = () => {
        if (selectedDay) {
            setEditedAttendance(selectedDay.attendance);
            setEditedNotes(selectedDay.notes);
        }
    }


    return (
        <div className="space-y-6">
            <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
            <header>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Calendar View</h1>
                <p className="text-md text-gray-600 dark:text-gray-400 mt-1">Review and edit attendance records from previous dates.</p>
            </header>

            {classesData.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                         <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                             <div>
                                <label htmlFor="class-select-calendar" className="sr-only">Select Subject</label>
                                <select
                                    id="class-select-calendar"
                                    value={selectedClassId}
                                    onChange={(e) => {
                                        setSelectedClassId(e.target.value);
                                        setSelectedDay(null);
                                    }}
                                    className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                                >
                                    {classesData.map((cls) => (
                                        <option key={cls.id} value={cls.id}>
                                            {cls.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-4 mt-4 sm:mt-0">
                                <button onClick={() => changeMonth(-1)} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">&lt;</button>
                                <h2 className="text-xl font-semibold w-48 text-center">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                                <button onClick={() => changeMonth(1)} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">&gt;</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-1 text-center font-semibold text-gray-600 dark:text-gray-400 border-b dark:border-gray-700 pb-2 mb-2">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {calendarGrid.map((day, index) => {
                                if (!day) return <div key={`empty-${index}`} />;
                                const summary = getSummaryForDay(day);
                                const isSelected = selectedDay?.date.toDateString() === day.toDateString();
                                return (
                                    <div 
                                        key={day.toISOString()} 
                                        onClick={() => handleDayClick(day)}
                                        className={`p-2 rounded-lg aspect-square flex flex-col justify-between cursor-pointer transition-colors ${isSelected ? 'bg-primary-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                    >
                                        <span className={`font-bold ${isSelected ? 'text-white' : 'text-gray-800 dark:text-white'}`}>{day.getDate()}</span>
                                        {summary.total > 0 && (
                                            <div className="text-xs space-y-0.5">
                                                <div className="flex items-center justify-center gap-1"><CheckCircleIcon className={`w-3 h-3 ${isSelected ? 'text-green-200' : 'text-green-500'}`} /> {summary.present}</div>
                                                <div className="flex items-center justify-center gap-1"><XCircleIcon className={`w-3 h-3 ${isSelected ? 'text-red-200' : 'text-red-500'}`} /> {summary.absent}</div>
                                                <div className="flex items-center justify-center gap-1"><ClockIcon className={`w-3 h-3 ${isSelected ? 'text-yellow-200' : 'text-yellow-500'}`} /> {summary.late}</div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    
                    <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col">
                        <h2 className="text-xl font-semibold mb-4 border-b dark:border-gray-700 pb-2 flex-shrink-0">Details</h2>
                        {selectedDay ? (
                            <div className="flex flex-col flex-grow min-h-0">
                                <h3 className="font-bold text-lg mb-3 flex-shrink-0">{selectedDay.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                                
                                <div className="space-y-4 overflow-y-auto pr-2 flex-grow">
                                    <div>
                                        <h4 className="font-semibold mb-2">Class Notes</h4>
                                        <textarea
                                            value={editedNotes}
                                            onChange={(e) => setEditedNotes(e.target.value)}
                                            rows={4}
                                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-2">Student Attendance</h4>
                                         <div className="space-y-2">
                                            {selectedClassStudents.map(student => {
                                                const status = editedAttendance[student.id] || AttendanceStatus.UNMARKED;
                                                return (
                                                    <div key={student.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md gap-2">
                                                        <p className="font-medium text-sm">{student.name}</p>
                                                        <div className="flex items-center gap-1 flex-shrink-0">
                                                            <StatusButton size="sm" label={AttendanceStatus.PRESENT} isActive={status === AttendanceStatus.PRESENT} onClick={() => handleStatusChange(student.id, AttendanceStatus.PRESENT)} activeClass="bg-green-500"/>
                                                            <StatusButton size="sm" label={AttendanceStatus.LATE} isActive={status === AttendanceStatus.LATE} onClick={() => handleStatusChange(student.id, AttendanceStatus.LATE)} activeClass="bg-yellow-500"/>
                                                            <StatusButton size="sm" label={AttendanceStatus.ABSENT} isActive={status === AttendanceStatus.ABSENT} onClick={() => handleStatusChange(student.id, AttendanceStatus.ABSENT)} activeClass="bg-red-500"/>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                                {isDirty && (
                                    <div className="mt-4 pt-4 border-t dark:border-gray-700 flex justify-end gap-3 flex-shrink-0">
                                        <button onClick={handleCancelChanges} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg shadow-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75 transition-colors">
                                            Cancel
                                        </button>
                                        <button onClick={handleSaveChanges} className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-75 transition-colors">
                                            Save Changes
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 dark:text-gray-400 pt-10">
                                <CalendarIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-2"/>
                                <p>Select a day with a record to view or edit details.</p>
                            </div>
                        )}
                    </div>

                </div>
            ) : (
                 <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">No Subjects Available</h2>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Please register a subject first to view the calendar.</p>
                </div>
            )}
        </div>
    );
};

// Using a lightweight deep equal check to avoid adding a heavy library
// for this specific use case. This is a common pattern.
const lodash = {
    isEqual: (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b),
};


export default CalendarView;