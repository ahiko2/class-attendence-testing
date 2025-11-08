import React from 'react';
import { Page } from '../types';
import { ClipboardListIcon, UserPlusIcon, BookOpenIcon, CalendarIcon, UsersIcon } from './Icons';

interface SidebarProps {
    activePage: Page;
    setActivePage: (page: Page) => void;
}

const NavItem: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void; }> = ({ icon, label, isActive, onClick }) => {
    const baseClasses = "flex items-center px-4 py-3 text-gray-600 dark:text-gray-300 rounded-lg transition-colors duration-200";
    const activeClasses = "bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-300 font-bold";
    const inactiveClasses = "hover:bg-gray-200 dark:hover:bg-gray-700";

    return (
        <a href="#" onClick={(e) => { e.preventDefault(); onClick(); }} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
            {icon}
            <span className="ml-4">{label}</span>
        </a>
    );
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage }) => {
    return (
        <aside className="w-64 bg-white dark:bg-gray-800 p-4 flex-col shadow-lg hidden md:flex">
            <div className="flex items-center mb-8 px-2">
                <UsersIcon className="w-10 h-10 text-primary-500" /> 
                <h1 className="text-xl font-bold ml-2 text-gray-800 dark:text-white">Attendance</h1>
            </div>
            <nav className="flex-grow space-y-2">
                <NavItem 
                    label="Daily Attendance" 
                    icon={<ClipboardListIcon className="w-6 h-6" />}
                    isActive={activePage === 'daily_attendance'}
                    onClick={() => setActivePage('daily_attendance')}
                />
                 <NavItem 
                    label="Subject Management" 
                    icon={<BookOpenIcon className="w-6 h-6" />}
                    // FIX: Corrected variable name from 'active_page' to 'activePage'.
                    isActive={activePage === 'subject_management'}
                    onClick={() => setActivePage('subject_management')}
                />
                <NavItem 
                    label="Student Management" 
                    icon={<UserPlusIcon className="w-6 h-6" />}
                    // FIX: Corrected variable name from 'active_page' to 'activePage'.
                    isActive={activePage === 'student_management'}
                    onClick={() => setActivePage('student_management')}
                />
                <NavItem 
                    label="Calendar View" 
                    icon={<CalendarIcon className="w-6 h-6" />}
                    // FIX: Corrected variable name from 'active_page' to 'activePage'.
                    isActive={activePage === 'calendar_view'}
                    onClick={() => setActivePage('calendar_view')}
                />
            </nav>
            <div className="mt-auto text-center text-xs text-gray-400 dark:text-gray-500">
                <p>&copy; 2024 Attendance Tracker</p>
            </div>
        </aside>
    );
};

export default Sidebar;