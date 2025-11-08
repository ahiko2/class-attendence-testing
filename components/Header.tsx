
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="mb-8 text-center">
      <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Class Attendance Tracker</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
        Select a class and manage student attendance for the day.
      </p>
    </header>
  );
};

export default Header;
