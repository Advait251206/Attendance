import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AttendanceProvider } from './context/AttendanceContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AIAssistant from './components/specific/AIAssistant';

// Pages
import Dashboard from './pages/Dashboard';
import MarkAttendance from './pages/MarkAttendance';
import Settings from './pages/Settings';
import History from './pages/History';
import SubjectNotes from './pages/SubjectNotes';
import Timetable from './pages/Timetable';
import Login from './pages/Login';
import Signup from './pages/Signup';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AttendanceProvider>
        <BrowserRouter>
          <AnimatePresence mode="wait">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="mark" element={<MarkAttendance />} />
                  <Route path="timetable" element={<Timetable />} />
                  <Route path="notes" element={<SubjectNotes />} />
                  <Route path="history" element={<History />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
              </Route>

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
          <AIAssistant />
        </BrowserRouter>
      </AttendanceProvider>
    </AuthProvider>
  );
};

export default App;
