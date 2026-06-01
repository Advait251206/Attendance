import { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import api from '../api/axios';

interface User {
    id: string;
    name: string;
    username: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (userData: any) => Promise<void>;
    signup: (userData: any) => Promise<void>;
    setSession: (token: string, user: User) => void;
    updateUserProfile: (data: any) => Promise<void>;
    deleteAccount: () => Promise<void>;
    resetData: () => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Hydrate user from localStorage if basic details stored, or better: perform 'me' check.
        // For simplicity, we assume if token exists, we are logged in.
        // A robust app would verify token validity here.
        const storedUser = localStorage.getItem('user');
        if (storedUser && token) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse stored user", e);
                localStorage.removeItem('user');
            }
        }
        setIsLoading(false);
    }, [token]);

    const login = async (userData: any) => {
        const res = await api.post('/auth/login', userData);
        const { token, user } = res.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        setToken(token);
        setUser(user);
    };

    const signup = async (userData: any) => {
        const res = await api.post('/auth/signup', userData);
        const { token, user } = res.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        setToken(token);
        setUser(user);
    };

    const setSession = (token: string, user: User) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setToken(token);
        setUser(user);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    const updateUserProfile = async (data: any) => {
        const res = await api.put('/auth/profile', data);
        const updatedUser = res.data;
        
        // Update storage and state
        localStorage.setItem('user', JSON.stringify(updatedUser)); // Token remains valid
        setUser(updatedUser);
    };

    const deleteAccount = async () => {
        await api.delete('/auth/account');
        logout(); // Clear state and token
    };

    const resetData = async () => {
        await api.delete('/auth/data');
        // No logout needed, just data cleared
        // Ideally, we should also clear local 'subjects' state if it was stored here, 
        // but subjects are managed by AttendanceContext. 
        // The user will likely need to refresh or the app should trigger a refetch.
        // For now, we will reload the window to force a fresh state.
        window.location.reload(); 
    };

    return (
        <AuthContext.Provider value={{ user, token, login, signup, setSession, logout, updateUserProfile, deleteAccount, resetData, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
