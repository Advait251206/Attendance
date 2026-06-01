import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, ArrowRight, AlertCircle, Mail, Hash } from 'lucide-react';
import CyberButton from '../components/common/CyberButton';
import GlitchText from '../components/common/GlitchText';

const Signup: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        setLoading(true);
        try {
            await signup(formData);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration Failed');
        } finally {
            setLoading(false);
        }
    };
    
    // ... (rest of render until inputs)

    return (
        <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center relative overflow-hidden">
             {/* ... (background and header same) ... */}
            {/* Background Effects */}
            <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-secondary/5 to-transparent pointer-events-none" />

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-md p-8 bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.15)]"
            >
                {/* ... Header same ... */}
                <div className="text-center mb-8">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <GlitchText text="NEW IDENTITY" className="text-3xl font-bold text-secondary mb-2 justify-center" />
                    </motion.div>
                    <p className="text-gray-400 text-sm">Create your profile to join the network</p>
                </div>

                {error && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-danger/10 border border-danger/30 text-danger p-3 rounded-lg mb-6 flex items-center gap-2 text-sm"
                    >
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <label className="text-[10px] text-gray-400 uppercase tracking-wider">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-secondary transition-colors" />
                                <input 
                                    name="name"
                                    type="text" 
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:border-secondary/50 focus:outline-none transition-all placeholder:text-gray-500 text-sm"
                                    placeholder="John Doe"
                                    required 
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] text-gray-400 uppercase tracking-wider">Username</label>
                            <div className="relative group">
                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-secondary transition-colors" />
                                <input 
                                    name="username"
                                    type="text" 
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:border-secondary/50 focus:outline-none transition-all placeholder:text-gray-500 text-sm"
                                    placeholder="runner"
                                    required 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] text-gray-400 uppercase tracking-wider">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-secondary transition-colors" />
                            <input 
                                name="email"
                                type="email" 
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:border-secondary/50 focus:outline-none transition-all placeholder:text-gray-500 text-sm"
                                placeholder="runner@net.com"
                                required 
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] text-gray-400 uppercase tracking-wider">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-secondary transition-colors" />
                                <input 
                                    name="password"
                                    type="password" 
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:border-secondary/50 focus:outline-none transition-all placeholder:text-gray-500 text-sm"
                                    placeholder="••••••••"
                                    required 
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] text-gray-400 uppercase tracking-wider">Confirm</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-secondary transition-colors" />
                                <input 
                                    name="confirmPassword"
                                    type="password" 
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:border-secondary/50 focus:outline-none transition-all placeholder:text-gray-500 text-sm"
                                    placeholder="••••••••"
                                    required 
                                />
                            </div>
                        </div>
                    </div>

                    <CyberButton 
                        onClick={() => {}} // Form submit handles logic
                        variant="secondary" 
                        className="w-full justify-center py-4 text-base mt-2"
                    >
                        {loading ? 'REGISTERING...' : (
                            <span className="flex items-center gap-2">
                                UPLOAD TO NETWORK <ArrowRight className="w-4 h-4" />
                            </span>
                        )}
                    </CyberButton>
                </form>

                <div className="mt-8 text-center text-xs text-gray-500">
                    <p>Already waiting in the lobby?</p>
                    <Link to="/login" className="text-secondary hover:text-secondary/80 transition-colors mt-1 inline-block border-b border-secondary/30 hover:border-secondary">
                        ACCESS EXISTING ACCOUNT
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Signup;
