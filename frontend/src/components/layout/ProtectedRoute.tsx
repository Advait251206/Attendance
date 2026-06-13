import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = () => {
    const { token, isLoading } = useAuth();

    if (isLoading) {
        // Loading spinner or splash screen
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-primary font-mono animate-pulse">
                INITIALIZING_SYSTEM_SECURITY...
            </div>
        );
    }

    return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
