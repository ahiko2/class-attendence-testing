import React, { useState } from 'react';
import { ClassData } from '../types';
import { XCircleIcon } from '../components/Icons';

interface SubjectManagementProps {
    classesData: ClassData[];
    addClass: (newClass: Omit<ClassData, 'students'>) => void;
    removeClass: (classId: string) => void;
}

const SubjectManagement: React.FC<SubjectManagementProps> = ({ classesData, addClass, removeClass }) => {
    const [className, setClassName] = useState('');
    const [classId, setClassId] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (className.trim() && classId.trim()) {
            if (classesData.some(c => c.id === classId.trim().toUpperCase())) {
                alert('A class with this ID already exists.');
                return;
            }
            addClass({ id: classId.trim().toUpperCase(), name: className.trim() });
            setClassName('');
            setClassId('');
        }
    };

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Subject Management</h1>
                <p className="text-md text-gray-600 dark:text-gray-400 mt-1">Add or remove subjects from the system.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Add New Subject</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="class-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subject Name</label>
                                <input 
                                    type="text" 
                                    id="class-name"
                                    value={className}
                                    onChange={e => setClassName(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="e.g., Advanced Calculus"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="class-id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subject ID</label>
                                <input 
                                    type="text" 
                                    id="class-id"
                                    value={classId}
                                    onChange={e => setClassId(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="e.g., MATH301"
                                    required
                                />
                            </div>
                            <button type="submit" className="w-full px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-75 transition-colors">
                                Add Subject
                            </button>
                        </form>
                    </div>
                </div>

                <div className="md:col-span-2">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                         <h2 className="text-xl font-semibold mb-4">Existing Subjects</h2>
                         <div className="space-y-3 max-h-[30rem] overflow-y-auto pr-2">
                            {classesData.length > 0 ? classesData.map(cls => (
                                <div key={cls.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                                    <div>
                                        <p className="font-semibold">{cls.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{cls.id} - {cls.students.length} students</p>
                                    </div>
                                    <button onClick={() => removeClass(cls.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full transition-colors hover:bg-red-100 dark:hover:bg-red-900/50">
                                        <XCircleIcon className="w-6 h-6"/>
                                    </button>
                                </div>
                            )) : (
                                <p className="text-gray-500 dark:text-gray-400">No subjects registered yet.</p>
                            )}
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default SubjectManagement;
