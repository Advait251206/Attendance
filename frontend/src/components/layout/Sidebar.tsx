import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckCircle, Calendar, BookOpen, Clock, Settings, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import clsx from 'clsx';

const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/mark', icon: CheckCircle, label: 'Attendance' },
    { path: '/timetable', icon: Clock, label: 'Timetable' },
    { path: '/notes', icon: BookOpen, label: 'Notes' },
    { path: '/history', icon: Calendar, label: 'History' },
    { path: '/settings', icon: Settings, label: 'Settings' },
];

const Sidebar: React.FC = () => {
    const { logout } = useAuth();
    return (
        <motion.aside
            initial={{ x: -100 }}
            animate={{ x: 0 }}
            className="fixed left-0 top-0 h-full w-20 md:w-64 bg-surface/80 backdrop-blur-md border-r border-white/5 flex flex-col z-50"
        >
            {/* Logo Area */}
            <div className="h-20 flex items-center justify-center border-b border-white/5">
                <h1 className="text-2xl font-display font-bold text-primary tracking-wider hidden md:block">
                    ATTEND<span className="text-white">.SYS</span>
                </h1>
                <div className="md:hidden text-primary font-bold text-xl">A.S</div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-8 flex flex-col gap-2 px-2 md:px-4">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => clsx(
                            "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                            isActive
                                ? "text-primary bg-primary/10 shadow-[0_0_15px_rgba(0,243,255,0.15)] border border-primary/20"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                        )}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon className={clsx("w-6 h-6 transition-transform", isActive ? "scale-110" : "group-hover:scale-110")} />
                                <span className="font-mono text-sm hidden md:block">{item.label}</span>

                                {/* Active Indicator Glow */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeNav"
                                        className="absolute inset-0 bg-primary/5 rounded-xl z-[-1]"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Logout Button */}
            <div className="p-2 md:p-4 pb-0">
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 text-danger hover:bg-danger/10 hover:shadow-[0_0_15px_rgba(255,0,0,0.15)] group"
                >
                    <LogOut className="w-6 h-6 transition-transform group-hover:scale-110" />
                    <span className="font-mono text-sm hidden md:block">Logout</span>
                </button>
            </div>

            {/* Footer Status */}
            <div className="p-4 border-t border-white/5 hidden md:block">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-neon-cyan"></div>
                    <span className="text-xs text-neon-gray font-mono">SYSTEM ONLINE</span>
                </div>
            </div>
        </motion.aside>
    );
};

export default Sidebar;
