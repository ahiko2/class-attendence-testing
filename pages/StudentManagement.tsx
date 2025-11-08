import React, { useState, useEffect } from 'react';
import { ClassData } from '../types';
import { XCircleIcon } from '../components/Icons';

interface StudentManagementProps {
    classesData: ClassData[];
    addStudent: (classId: string, studentName: string) => void;
    removeStudent: (classId: string, studentId: string) => void;
}

const StudentManagement: React.FC<StudentManagementProps> = ({ classesData, addStudent, removeStudent }) => {
    const [selectedClassId, setSelectedClassId] = useState<string>(classesData[0]?.id || '');
    const [studentName, setStudentName] = useState('');

    useEffect(() => {
        if (!selectedClassId && classesData.length > 0) {
            setSelectedClassId(classesData[0].id);
        }
    }, [classesData, selectedClassId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (studentName.trim() && selectedClassId) {
            addStudent(selectedClassId, studentName.trim());
            setStudentName('');
        }
    };
    
    const selectedClassStudents = classesData.find(c => c.id === selectedClassId)?.students || [];

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Student Management</h1>
                <p className="text-md text-gray-600 dark:text-gray-400 mt-1">Add or remove students for a subject.</p>
            </header>

            {classesData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                     <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Register New Student</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="class-select-manage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Subject</label>
                                <select
                                    id="class-select-manage"
                                    value={selectedClassId}
                                    onChange={(e) => setSelectedClassId(e.target.value)}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                                >
                                    {classesData.map((cls) => (
                                        <option key={cls.id} value={cls.id}>
                                            {cls.name} ({cls.id})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="student-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Student Full Name</label>
                                <input 
                                    type="text" 
                                    id="student-name"
                                    value={studentName}
                                    onChange={e => setStudentName(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="e.g., Jane Doe"
                                    required
                                />
                            </div>
                            <button type="submit" className="w-full px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-75 transition-colors">
                                Register Student
                            </button>
                        </form>
                    </div>
                </div>

                <div className="md:col-span-2">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Student Roster for {classesData.find(c => c.id === selectedClassId)?.name}</h2>
                        <div className="space-y-3 max-h-[30rem] overflow-y-auto pr-2">
                            {selectedClassStudents.length > 0 ? selectedClassStudents.map(student => (
                                <div key={student.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                                    <div className="flex items-center gap-3">
                                        <img src={student.avatarUrl} alt={student.name} className="w-10 h-10 rounded-full object-cover"/>
                                        <div>
                                            <p className="font-semibold">{student.name}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">ID: {student.id}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => removeStudent(selectedClassId, student.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full transition-colors hover:bg-red-100 dark:hover:bg-red-900/50">
                                        <XCircleIcon className="w-6 h-6"/>
                                    </button>
                                </div>
                            )) : (
                                <p className="text-gray-500 dark:text-gray-400">No students registered for this subject yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            ) : (
                <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">No Subjects Available</h2>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Please register a subject first before adding students.</p>
                </div>
            )}
        </div>
    );
};
export default StudentManagement;
