// frontend/src/pages/DashboardPage.js

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/solid';
import AttendanceTracker from '../components/AttendanceTracker';

const DashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="p-4 md:p-8 animate-fade-in max-w-4xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl">{'[DASHBOARD]'}</h1>
          <p className="text-terminal-gray">Welcome, user: <span className="text-cyber-blue">{user?.username}</span></p>
        </div>
        <button onClick={logout} className="flex items-center space-x-2 text-red-500 hover:text-red-400 transition-colors">
            <ArrowLeftOnRectangleIcon className="h-6 w-6" />
            <span>LOGOUT</span>
        </button>
      </header>

      <main className="grid grid-cols-1 gap-8">
        <AttendanceTracker />
      </main>
    </div>
  );
};

export default DashboardPage;