import React, { useState, useEffect } from 'react';
import { ClassData, Student, Page, AttendanceHistory, AttendanceStatus, DailyRecord } from './types';
import { classesAPI, studentsAPI, attendanceAPI } from './api';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
    const [activePage, setActivePage] = useState<Page>('daily_attendance');
    const [classesData, setClassesData] = useState<ClassData[]>([]);
    const [attendanceHistory, setAttendanceHistory] = useState<AttendanceHistory>({});
    const [loading, setLoading] = useState(true);

    // Load data from backend on mount
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const classes = await classesAPI.getAll();
            
            // Load students for each class
            const classesWithStudents = await Promise.all(
                classes.map(async (classItem) => {
                    const students = await studentsAPI.getByClass(classItem.id);
                    return {
                        id: classItem.id,
                        name: classItem.name,
                        students: students.map(s => ({
                            id: s.id,
                            name: s.name,
                            avatarUrl: s.avatar_url
                        }))
                    };
                })
            );
            
            setClassesData(classesWithStudents);
            
            // Load attendance history for all classes
            const history: AttendanceHistory = {};
            for (const classItem of classes) {
                const response = await attendanceAPI.getByClass(classItem.id);
                const records = response.attendance || [];
                const notesData = response.notes || [];
                
                // Create a map of dates to notes
                const notesMap: Record<string, string> = {};
                notesData.forEach((noteRecord: any) => {
                    const dateObj = new Date(noteRecord.date);
                    const year = dateObj.getUTCFullYear();
                    const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
                    const day = String(dateObj.getUTCDate()).padStart(2, '0');
                    const date = `${year}-${month}-${day}`;
                    notesMap[date] = noteRecord.notes || '';
                });
                
                // Group records by date
                const dateMap: Record<string, DailyRecord> = {};
                records.forEach((record: any) => {
                    // Handle date properly - MySQL returns dates as UTC, convert to local date string
                    const dateObj = new Date(record.date);
                    const year = dateObj.getUTCFullYear();
                    const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
                    const day = String(dateObj.getUTCDate()).padStart(2, '0');
                    const date = `${year}-${month}-${day}`;
                    
                    if (!dateMap[date]) {
                        dateMap[date] = { attendance: {}, notes: notesMap[date] || '' };
                    }
                    dateMap[date].attendance[record.student_id] = record.status as AttendanceStatus;
                });
                
                if (Object.keys(dateMap).length > 0) {
                    history[classItem.id] = dateMap;
                }
            }
            
            setAttendanceHistory(history);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddClass = async (newClass: Omit<ClassData, 'students'>) => {
        try {
            await classesAPI.create({ id: newClass.id, name: newClass.name });
            setClassesData(prev => [...prev, { ...newClass, students: [] }]);
        } catch (error) {
            console.error('Error adding class:', error);
        }
    };

    const handleRemoveClass = async (classId: string) => {
        try {
            await classesAPI.delete(classId);
            setClassesData(prev => prev.filter(c => c.id !== classId));
            setAttendanceHistory(prev => {
                const newHistory = {...prev};
                delete newHistory[classId];
                return newHistory;
            });
        } catch (error) {
            console.error('Error removing class:', error);
        }
    };

    const handleAddStudent = async (classId: string, studentName: string) => {
        const newStudent: Student = {
            id: `S${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
            name: studentName,
            avatarUrl: `https://picsum.photos/seed/S${Date.now()}/100/100`,
        };
        
        try {
            await studentsAPI.create(classId, {
                id: newStudent.id,
                name: newStudent.name,
                avatarUrl: newStudent.avatarUrl
            });
            setClassesData(prev => prev.map(c => 
                c.id === classId 
                    ? { ...c, students: [...c.students, newStudent] } 
                    : c
            ));
        } catch (error) {
            console.error('Error adding student:', error);
        }
    };

    const handleRemoveStudent = async (classId: string, studentId: string) => {
        try {
            await studentsAPI.delete(studentId);
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
        } catch (error) {
            console.error('Error removing student:', error);
        }
    };

    const handleSaveAttendance = async (classId: string, date: string, attendanceData: Record<string, AttendanceStatus>, notes: string) => {
        const newRecord: DailyRecord = {
            attendance: attendanceData,
            notes: notes
        };
        
        try {
            await attendanceAPI.save(classId, date, {
                attendance: attendanceData,
                notes: notes
            });
            setAttendanceHistory(prev => ({
                ...prev,
                [classId]: {
                    ...prev[classId],
                    [date]: newRecord
                }
            }));
        } catch (error) {
            console.error('Error saving attendance:', error);
        }
    };

    const handleClearAttendanceForDay = async (classId: string, date: string) => {
        try {
            await attendanceAPI.clear(classId, date);
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
        } catch (error) {
            console.error('Error clearing attendance:', error);
        }
    };

    if (loading) {
        return (
            <div className="bg-gray-100 dark:bg-gray-900 min-h-screen font-sans text-gray-900 dark:text-gray-100 flex items-center justify-center">
                <div className="text-2xl">Loading...</div>
            </div>
        );
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