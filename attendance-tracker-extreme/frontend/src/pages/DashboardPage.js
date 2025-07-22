import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/solid';

const DashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="p-4 md:p-8 animate-fade-in">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl">{'[DASHBOARD]'}</h1>
          <p className="text-terminal-gray">Welcome, user: <span className="text-hacker-green">{user?.username}</span></p>
        </div>
        <button onClick={logout} className="flex items-center space-x-2 text-red-500 hover:text-red-400 transition-colors">
            <ArrowLeftOnRectangleIcon className="h-6 w-6" />
            <span>LOGOUT</span>
        </button>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card">
          <h2 className="text-2xl mb-4">{"// Today's Schedule"}</h2>
          {/* Timetable and attendance logging logic will go here. */}
        </div>

        <div className="card">
          <h2 className="text-2xl mb-4">{'// STATS_SUMMARY'}</h2>
          {/* Charts and streak trackers will go here. */}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;