import React, { useState } from 'react';
import { ClassData, Student, Page, AttendanceHistory, AttendanceStatus, DailyRecord } from './types';
import { CLASSES_DATA as INITIAL_CLASSES_DATA } from './constants';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
    const [activePage, setActivePage] = useState<Page>('daily_attendance');
    const [classesData, setClassesData] = useState<ClassData[]>(INITIAL_CLASSES_DATA);
    const [attendanceHistory, setAttendanceHistory] = useState<AttendanceHistory>({});

    const handleAddClass = (newClass: Omit<ClassData, 'students'>) => {
        setClassesData(prev => [...prev, { ...newClass, students: [] }]);
    };

    const handleRemoveClass = (classId: string) => {
        setClassesData(prev => prev.filter(c => c.id !== classId));
        setAttendanceHistory(prev => {
            const newHistory = {...prev};
            delete newHistory[classId];
            return newHistory;
        });
    };

    const handleAddStudent = (classId: string, studentName: string) => {
        const newStudent: Student = {
            id: `S${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
            name: studentName,
            avatarUrl: `https://picsum.photos/seed/S${Date.now()}/100/100`,
        };
        setClassesData(prev => prev.map(c => 
            c.id === classId 
                ? { ...c, students: [...c.students, newStudent] } 
                : c
        ));
    };

    const handleRemoveStudent = (classId: string, studentId: string) => {
        setClassesData(prev => prev.map(c => 
            c.id === classId 
                ? { ...c, students: c.students.filter(s => s.id !== studentId) } 
                : c
        ));
        // Also remove student from history
        setAttendanceHistory(prev => {
            const newHistory = {...prev};
            if(newHistory[classId]) {
                Object.keys(newHistory[classId]).forEach(date => {
                    delete newHistory[classId][date].attendance[studentId];
                });
            }
            return newHistory;
        });
    };

    const handleSaveAttendance = (classId: string, date: string, attendanceData: Record<string, AttendanceStatus>, notes: string) => {
        const newRecord: DailyRecord = {
            attendance: attendanceData,
            notes: notes
        };
        setAttendanceHistory(prev => ({
            ...prev,
            [classId]: {
                ...prev[classId],
                [date]: newRecord
            }
        }));
    };

    const handleClearAttendanceForDay = (classId: string, date: string) => {
        setAttendanceHistory(prev => {
            const newHistory = {...prev};
            if (newHistory[classId] && newHistory[classId][date]) {
                delete newHistory[classId][date];
                if (Object.keys(newHistory[classId]).length === 0) {
                    delete newHistory[classId];
                }
            }
            return newHistory;
        });
    }

    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen font-sans text-gray-900 dark:text-gray-100">
            <Dashboard
                activePage={activePage}
                setActivePage={setActivePage}
                classesData={classesData}
                addClass={handleAddClass}
                removeClass={handleRemoveClass}
                addStudent={handleAddStudent}
                removeStudent={handleRemoveStudent}
                attendanceHistory={attendanceHistory}
                saveAttendance={handleSaveAttendance}
                clearAttendanceForDay={handleClearAttendanceForDay}
            />
        </div>
    );
};

export default App;