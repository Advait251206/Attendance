import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowLeftOnRectangleIcon, CalendarDaysIcon, BookOpenIcon } from '@heroicons/react/24/solid';
import AttendanceTracker from '../components/AttendanceTracker';
import SubjectManager from '../components/SubjectManager'; // Import the SubjectManager

const DashboardPage = () => {
  const { user, logout } = useAuth();
  // State to manage which tab is active. 'tracker' is the default.
  const [activeTab, setActiveTab] = useState('tracker');

  // Helper to get styling for the active/inactive tabs
  const getTabClassName = (tabName) => {
    return `flex items-center space-x-2 py-2 px-4 rounded-lg cursor-pointer transition-all duration-200 ${
      activeTab === tabName
        ? 'bg-hacker-green text-cyber-black'
        : 'hover:bg-cyber-black/50'
    }`;
  };

  return (
    <div className="p-4 md:p-8 animate-fade-in max-w-4xl mx-auto">
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

      {/* --- NEW: Tab Navigation --- */}
      <nav className="flex space-x-4 mb-8 border-b border-hacker-green/30">
        <button onClick={() => setActiveTab('tracker')} className={getTabClassName('tracker')}>
          <CalendarDaysIcon className="h-5 w-5" />
          <span>Daily Log</span>
        </button>
        <button onClick={() => setActiveTab('subjects')} className={getTabClassName('subjects')}>
          <BookOpenIcon className="h-5 w-5" />
          <span>Manage Subjects</span>
        </button>
      </nav>

      <main className="grid grid-cols-1 gap-8">
        {/* --- NEW: Conditional Rendering based on active tab --- */}
        {activeTab === 'tracker' && <AttendanceTracker />}
        {activeTab === 'subjects' && <SubjectManager />}
      </main>
    </div>
  );
};

export default DashboardPage;