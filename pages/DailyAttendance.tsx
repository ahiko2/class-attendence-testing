import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from '../components/Header';
import ControlPanel from '../components/ControlPanel';
import AttendanceSummary from '../components/AttendanceSummary';
import StudentList from '../components/StudentList';
import { AttendanceStatus, ClassData, AttendanceHistory } from '../types';
import Toast from '../components/Toast';
import { TrashIcon } from '../components/Icons';

interface DailyAttendanceProps {
  classesData: ClassData[];
  attendanceHistory: AttendanceHistory;
  saveAttendance: (classId: string, date: string, attendanceData: Record<string, AttendanceStatus>, notes: string) => void;
  clearAttendanceForDay: (classId: string, date: string) => void;
}

const getTodayDateString = () => new Date().toISOString().split('T')[0];

const DailyAttendance: React.FC<DailyAttendanceProps> = ({ classesData, attendanceHistory, saveAttendance, clearAttendanceForDay }) => {
    const [selectedClassId, setSelectedClassId] = useState<string>(classesData[0]?.id || '');
    const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
    const [notes, setNotes] = useState<string>('');
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const todayDateString = getTodayDateString();
    
    useEffect(() => {
        if (classesData.length > 0 && !classesData.find(c => c.id === selectedClassId)) {
            setSelectedClassId(classesData[0].id);
        } else if (classesData.length === 0) {
            setSelectedClassId('');
        }
    }, [classesData, selectedClassId]);

    useEffect(() => {
        const currentClass = classesData.find(c => c.id === selectedClassId);
        if (currentClass) {
            const savedRecord = attendanceHistory[selectedClassId]?.[todayDateString];
            const initialAttendance = currentClass.students.reduce((acc, student) => {
                acc[student.id] = savedRecord?.attendance?.[student.id] || AttendanceStatus.UNMARKED;
                return acc;
            }, {} as Record<string, AttendanceStatus>);
            setAttendance(initialAttendance);
            setNotes(savedRecord?.notes || '');
        } else {
            setAttendance({});
            setNotes('');
        }
    }, [selectedClassId, classesData, attendanceHistory, todayDateString]);

    const handleStatusChange = useCallback((studentId: string, status: AttendanceStatus) => {
        setAttendance(prev => {
            if(prev[studentId] === status) {
                return { ...prev, [studentId]: AttendanceStatus.UNMARKED };
            }
            return { ...prev, [studentId]: status };
        });
    }, []);

    const currentClass = useMemo(() => 
        classesData.find(c => c.id === selectedClassId), 
        [selectedClassId, classesData]
    );
    
    const currentStudents = useMemo(() => currentClass?.students || [], [currentClass]);

    const summary = useMemo(() => {
        const counts = { present: 0, absent: 0, late: 0 };
        Object.values(attendance).forEach(status => {
            if (status === AttendanceStatus.PRESENT) counts.present++;
            else if (status === AttendanceStatus.ABSENT) counts.absent++;
            else if (status === AttendanceStatus.LATE) counts.late++;
        });
        return counts;
    }, [attendance]);

    const handleSave = () => {
        if (!selectedClassId) return;
        saveAttendance(selectedClassId, todayDateString, attendance, notes);
        setToastMessage("Attendance and notes saved successfully!");
    };
    
    const handleClear = () => {
        if (!selectedClassId) return;
        if(confirm("Are you sure you want to clear today's attendance record and notes? This cannot be undone.")) {
            clearAttendanceForDay(selectedClassId, todayDateString);
            setToastMessage("Today's record has been cleared.");
        }
    };

    const isRecordSaved = attendanceHistory[selectedClassId]?.[todayDateString] !== undefined;

    return (
        <div className="space-y-6">
            <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
            <Header />
            {classesData.length > 0 ? (
            <>
                <ControlPanel 
                    classes={classesData}
                    selectedClassId={selectedClassId}
                    onClassChange={setSelectedClassId}
                />
                <AttendanceSummary 
                    present={summary.present}
                    absent={summary.absent}
                    late={summary.late}
                    total={currentStudents.length}
                />
                <StudentList 
                    students={currentStudents}
                    attendance={attendance}
                    onStatusChange={handleStatusChange}
                />
                 <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                    <label htmlFor="class-notes" className="block text-lg font-semibold text-gray-800 dark:text-white mb-2">
                        Class Notes for Today
                    </label>
                    <textarea
                        id="class-notes"
                        rows={4}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                        placeholder="e.g., Discussed Chapter 4, assigned homework due next week..."
                    />
                </div>
                <div className="flex justify-end items-center gap-4 mt-6">
                    {isRecordSaved && (
                        <button
                            onClick={handleClear}
                            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 transition-colors flex items-center gap-2"
                            aria-label="Clear today's attendance record"
                        >
                            <TrashIcon className="w-5 h-5"/>
                            Clear Record
                        </button>
                    )}
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-75 transition-colors"
                    >
                        Save Attendance
                    </button>
                </div>
            </>
            ) : (
                <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">No Classes Found</h2>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Please add a subject from the 'Subject Management' page.</p>
                </div>
            )}
        </div>
    );
};

export default DailyAttendance;