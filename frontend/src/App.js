import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext'; // Corrected import
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

// A wrapper to protect routes that require authentication
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth(); // Use the new custom hook

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-hacker-green text-2xl animate-pulse">LOADING_KERNEL...</div>;
  }

  return user ? children : <Navigate to="/login" />;
};

const AppContent = () => (
  <Router>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route 
        path="/dashboard" 
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  </Router>
);

// The main App component now just sets up the provider
const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;