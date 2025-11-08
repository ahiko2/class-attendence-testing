import React from 'react';
import Sidebar from './Sidebar';
import { Page, ClassData, AttendanceHistory, AttendanceStatus } from '../types';
import DailyAttendance from '../pages/DailyAttendance';
import StudentManagement from '../pages/StudentManagement';
import SubjectManagement from '../pages/SubjectManagement';
import CalendarView from '../pages/CalendarView';

interface DashboardProps {
    activePage: Page;
    setActivePage: (page: Page) => void;
    classesData: ClassData[];
    addClass: (newClass: Omit<ClassData, 'students'>) => void;
    removeClass: (classId: string) => void;
    addStudent: (classId: string, studentName: string) => void;
    removeStudent: (classId: string, studentId: string) => void;
    attendanceHistory: AttendanceHistory;
    saveAttendance: (classId: string, date: string, attendanceData: Record<string, AttendanceStatus>, notes: string) => void;
    clearAttendanceForDay: (classId: string, date: string) => void;
}

const Dashboard: React.FC<DashboardProps> = (props) => {
    const { activePage, setActivePage, classesData, attendanceHistory } = props;

    const renderPage = () => {
        switch (activePage) {
            case 'daily_attendance':
                return <DailyAttendance 
                            classesData={classesData} 
                            attendanceHistory={attendanceHistory}
                            saveAttendance={props.saveAttendance}
                            clearAttendanceForDay={props.clearAttendanceForDay}
                        />;
            case 'subject_management':
                return <SubjectManagement classesData={classesData} addClass={props.addClass} removeClass={props.removeClass} />;
            case 'student_management':
                return <StudentManagement classesData={classesData} addStudent={props.addStudent} removeStudent={props.removeStudent} />;
            case 'calendar_view':
                return <CalendarView 
                            classesData={classesData} 
                            attendanceHistory={attendanceHistory} 
                            saveAttendance={props.saveAttendance}
                        />;
            default:
                return <DailyAttendance 
                            classesData={classesData} 
                            attendanceHistory={attendanceHistory}
                            saveAttendance={props.saveAttendance}
                            clearAttendanceForDay={props.clearAttendanceForDay}
                        />;
        }
    };

    return (
        <div className="flex h-screen">
            <Sidebar activePage={activePage} setActivePage={setActivePage} />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                    {renderPage()}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;