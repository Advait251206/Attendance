import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../api/axios';
import type { Subject } from '../types';
import { useAuth } from './AuthContext';

interface AttendanceContextType {
    subjects: Subject[];
    loading: boolean;
    error: string | null;
    refreshSubjects: () => Promise<void>;
    markAttendance: (logs: { date: string, subjectId: string, status: string, note?: string }[]) => Promise<void>;
    addSubject: (data: Partial<Subject>) => Promise<void>;
    deleteSubject: (id: string) => Promise<void>;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

// ... (Interface kept same)

export const AttendanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { token } = useAuth(); // Get token

    const fetchSubjects = async () => {
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const res = await api.get('/subjects');
            setSubjects(res.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch subjects');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchSubjects();
        } else {
            setSubjects([]); // Clear data if logged out
            setLoading(false);
        }
    }, [token]);

    const refreshSubjects = async () => {
        await fetchSubjects();
    };

    const markAttendance = async (logs: any[]) => {
        try {
            await api.post('/attendance', { logs });
            // Ideally optimistically update, but for now re-fetch to ensure stats are correct
            await fetchSubjects();
        } catch (err) {
            console.error('Error marking attendance:', err);
            throw err;
        }
    };

    const addSubject = async (data: Partial<Subject>) => {
        try {
            await api.post('/subjects', data);
            await fetchSubjects();
        } catch (err) {
            console.error('Error adding subject:', err);
            throw err;
        }
    };

    const deleteSubject = async (id: string) => {
        try {
            await api.delete(`/subjects/${id}`);
            setSubjects(prev => prev.filter(s => s._id !== id));
        } catch (err) {
            console.error('Error deleting subject:', err);
            throw err;
        }
    };

    return (
        <AttendanceContext.Provider value={{
            subjects,
            loading,
            error,
            refreshSubjects,
            markAttendance,
            addSubject,
            deleteSubject
        }}>
            {children}
        </AttendanceContext.Provider>
    );
};

export const useAttendance = () => {
    const context = useContext(AttendanceContext);
    if (!context) {
        throw new Error('useAttendance must be used within an AttendanceProvider');
    }
    return context;
};
