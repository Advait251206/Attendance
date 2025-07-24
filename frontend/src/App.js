// frontend/src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';

// This is a special component that protects routes that require a user to be logged in.
// If the user is not logged in, it redirects them to the login page.
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

// This component handles the main routing logic of the app.
const AppRoutes = () => {
  const { user, loading } = useAuth();

  // Show a loading indicator while the app is checking for an existing session.
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {/* The invalid comment was here. It has now been removed. */}
        <p className="animate-pulse text-2xl text-cyber-blue">Initializing Secure Connection...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" /> : <LoginPage />}
      />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

// This is the main App component that wraps everything.
function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="bg-matrix-bg text-terminal-gray min-h-screen font-fira-code">
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;