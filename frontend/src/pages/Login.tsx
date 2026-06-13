import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import CyberButton from '../components/common/CyberButton';
import GlitchText from '../components/common/GlitchText';

const Login: React.FC = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, token } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (token) {
            navigate('/');
        }
    }, [token, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login({ identifier, password });
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Access Denied');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 w-full max-w-md p-8 bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,243,255,0.1)]"
            >
                <div className="text-center mb-8">
                    <motion.div 
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <GlitchText text="SYSTEM LOGIN" className="text-3xl font-bold text-primary mb-2 justify-center" />
                    </motion.div>
                    <p className="text-gray-400 text-sm">Enter credentials to access Neural Link</p>
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

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs text-primary uppercase tracking-wider">Username or Email</label>
                        <div className="relative group">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors" />
                            <input 
                                type="text" 
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:border-primary/50 focus:outline-none focus:shadow-[0_0_15px_rgba(0,243,255,0.2)] transition-all placeholder:text-gray-500"
                                placeholder="netrunner_01"
                                required 
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs text-primary uppercase tracking-wider">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors" />
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:border-primary/50 focus:outline-none focus:shadow-[0_0_15px_rgba(0,243,255,0.2)] transition-all placeholder:text-gray-500"
                                placeholder="••••••••"
                                required 
                            />
                        </div>
                    </div>

                    <CyberButton 
                        onClick={() => {}} // Form submit handles logic
                        variant="primary" 
                        className="w-full justify-center py-4 text-base"
                    >
                        {loading ? 'AUTHENTICATING...' : (
                            <span className="flex items-center gap-2">
                                JACK IN <ArrowRight className="w-4 h-4" />
                            </span>
                        )}
                    </CyberButton>
                </form>

                <div className="mt-8 text-center text-xs text-gray-500">
                    <p>Don't have a neural link?</p>
                    <Link to="/signup" className="text-primary hover:text-primary/80 transition-colors mt-1 inline-block border-b border-primary/30 hover:border-primary">
                        INITIALIZE NEW IDENTITY
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
