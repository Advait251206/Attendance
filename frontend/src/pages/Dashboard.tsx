import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAttendance } from '../context/AttendanceContext';
import GlitchText from '../components/common/GlitchText';
import NeonCard from '../components/common/NeonCard';
import ProgressRing from '../components/common/ProgressRing';
import { containerVariants } from '../utils/animations';
import { AlertTriangle, TrendingUp, Calendar } from 'lucide-react';

const Dashboard: React.FC = () => {
    const { subjects, loading } = useAttendance();
    const navigate = useNavigate();

    // Calculate Global Stats
    const globalStats = useMemo(() => {
        let totalClasses = 0;
        let attendedClasses = 0;

        subjects.forEach(sub => {
            totalClasses += sub.totalClasses || 0;
            attendedClasses += sub.attendedClasses || 0;
        });

        const percentage = totalClasses === 0 ? 0 : (attendedClasses / totalClasses) * 100;

        return {
            percentage,
            totalClasses,
            attendedClasses,
            bunked: totalClasses - attendedClasses
        };
    }, [subjects]);

    // Helper: Convert to 12h format
    const to12Hour = (time24: string) => {
        if (!time24) return '';
        const [h, m] = time24.split(':').map(Number);
        const period = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
    };

    // Calculate Next Class
    const nextClass = useMemo(() => {
        if (!subjects.length) return null;

        const now = new Date();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDayIndex = now.getDay(); // 0 = Sunday, 1 = Monday...
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        let allSlots: { name: string; dayIndex: number; minutes: number; timeStr: string; sortWeight: number }[] = [];

        subjects.forEach(sub => {
            sub.timetableSlides?.forEach(slot => {
                let dIndex = days.indexOf(slot.day);
                if (dIndex === -1) return; // Invalid day string

                let tMinutes = parseInt(slot.time.split(':')[0]) * 60 + parseInt(slot.time.split(':')[1]);

                // Calculate sorting weight
                // If it's today and time passed, treat as next week (add 7 days)
                // If it's a previous day in the week, treat as next week (add 7 days)
                let dayDiff = dIndex - currentDayIndex;
                if (dayDiff < 0 || (dayDiff === 0 && tMinutes <= currentMinutes)) {
                    dayDiff += 7;
                }

                allSlots.push({
                    name: sub.name,
                    dayIndex: dIndex,
                    minutes: tMinutes,
                    timeStr: slot.time,
                    sortWeight: dayDiff * 24 * 60 + tMinutes // Sort by absolute minutes from now
                });
            });
        });

        if (allSlots.length === 0) return null;

        // Sort by weight
        allSlots.sort((a, b) => a.sortWeight - b.sortWeight);

        const next = allSlots[0];

        // Determine label (Today, Tomorrow, or Day Name)
        let dayLabel = days[next.dayIndex];
        if (next.dayIndex === currentDayIndex) dayLabel = 'TODAY';
        if (next.dayIndex === (currentDayIndex + 1) % 7) dayLabel = 'TOMORROW';

        return {
            name: next.name,
            time: to12Hour(next.timeStr),
            day: dayLabel
        };
    }, [subjects]);

    const getStatusColor = (percentage: number, target: number) => {
        if (percentage >= target) return 'cyan';
        if (percentage >= target - 10) return 'yellow'; // Warning zone
        return 'red'; // Danger zone
    };

    if (loading) return <div className="flex h-full items-center justify-center text-primary font-mono animate-pulse">LOADING SYSTEM DATA...</div>;

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-8"
        >
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/5 pb-6">
                <div>
                    <h2 className="text-neon-gray text-sm font-mono mb-2">OVERVIEW</h2>
                    <GlitchText text="DASHBOARD" size="lg" />
                </div>
                <div className="font-mono text-right text-sm text-gray-400">
                    <p>ACADEMIC YEAR: 2025</p>
                    <p className="text-primary">STATUS: ACTIVE</p>
                </div>
            </header>

            {/* Hero Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Percentage Card */}
                <NeonCard className="md:col-span-1 flex flex-col items-center justify-center relative min-h-[250px]" glowColor="cyan">
                    <div className="absolute top-4 left-4 text-xs font-mono text-gray-400">TOTAL ATTENDANCE</div>
                    <ProgressRing
                        progress={globalStats.percentage}
                        size={180}
                        strokeWidth={12}
                        color={getStatusColor(globalStats.percentage, 75)}
                    />
                    <div className="mt-4 text-center">
                        <p className="text-gray-400 text-sm font-mono">TARGET: 75%</p>
                    </div>
                </NeonCard>

                {/* Quick Stats Grid */}
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <NeonCard delay={0.1} glowColor="purple" className="flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <span className="text-xs font-mono text-gray-400">CLASSES ATTENDED</span>
                            <TrendingUp className="text-secondary w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-4xl font-display font-bold text-white">{globalStats.attendedClasses}</span>
                            <span className="text-gray-500 font-mono text-sm"> / {globalStats.totalClasses}</span>
                        </div>
                    </NeonCard>

                    <NeonCard delay={0.2} glowColor="red" className="flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <span className="text-xs font-mono text-gray-400">CLASSES NOT ATTENDED</span>
                            <AlertTriangle className="text-danger w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-4xl font-display font-bold text-danger">{globalStats.bunked}</span>
                            <span className="text-danger/60 font-mono text-sm ml-2">NOT ATTENDED</span>
                        </div>
                    </NeonCard>

                    <NeonCard delay={0.3} glowColor="blue" className="col-span-1 sm:col-span-2 flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-xs font-mono text-gray-400">NEXT CLASS ({nextClass ? nextClass.day : '--'})</span>
                            {nextClass ? (
                                <div className="flex flex-col mt-1">
                                    <span className="text-2xl font-bold font-display text-accent">{nextClass.name}</span>
                                    <span className="text-sm font-mono text-accent/80">@ {nextClass.time}</span>
                                </div>
                            ) : (
                                <span className="text-xl font-bold font-display text-gray-600 mt-1">NO UPCOMING CLASSES</span>
                            )}
                        </div>
                        <Calendar className="text-accent w-8 h-8 opacity-50" />
                    </NeonCard>
                </div>
            </div>

            {/* Subjects Grid */}
            <div className="space-y-4">
                <h3 className="text-xl font-display text-white border-l-4 border-primary pl-4">SUBJECT PERFORMANCE</h3>
                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    variants={containerVariants}
                >
                    {subjects.filter(s => !s.name.match(/break|recess|lunch/i)).map((subject) => {
                        const subTotal = subject.totalClasses || 0;
                        const subAttended = subject.attendedClasses || 0;
                        const subPct = subTotal === 0 ? 0 : (subAttended / subTotal) * 100;
                        const statusColor = getStatusColor(subPct, subject.minAttendanceTarget);

                        return (
                            <NeonCard
                                key={subject._id}
                                glowColor={statusColor as any}
                                className="flex flex-col gap-4 cursor-pointer hover:bg-white/5 transition-all active:scale-95"
                                onClick={() => navigate(`/history?subjectId=${subject._id}`)}
                            >
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-lg truncate pr-2" style={{ color: subject.color }}>{subject.name}</h4>
                                    <span className={`text-xs px-2 py-1 rounded border ${statusColor === 'cyan' ? 'border-primary text-primary bg-primary/10' :
                                        statusColor === 'yellow' ? 'border-warning text-warning bg-warning/10' :
                                            'border-danger text-danger bg-danger/10'
                                        }`}>
                                        {subPct.toFixed(1)}%
                                    </span>
                                </div>

                                <div className="flex items-center gap-4">
                                    <ProgressRing progress={subPct} size={60} strokeWidth={4} showLabel={false} color={statusColor as any} />
                                    <div className="flex flex-col text-sm font-mono">
                                        <span className="text-white text-lg font-bold">{subAttended}<span className="text-gray-500 text-sm font-normal">/{subTotal}</span> <span className="text-gray-500 text-xs">ATTENDED</span></span>
                                        <span className="text-gray-400">{subTotal - subAttended} <span className="text-gray-600 text-xs">MISSED</span></span>
                                    </div>
                                </div>

                                <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center text-xs font-mono text-gray-500">
                                    <span>TARGET: {subject.minAttendanceTarget}%</span>
                                    {subTotal > 0 && subPct < subject.minAttendanceTarget && (
                                        <div className="flex items-center gap-1 px-2 py-1 bg-danger/20 border border-danger/50 text-danger font-bold text-[10px] tracking-widest rounded animate-pulse shadow-[0_0_10px_rgba(255,0,60,0.4)]">
                                            <AlertTriangle className="w-3 h-3" /> CRITICAL
                                        </div>
                                    )}
                                </div>
                            </NeonCard>
                        );
                    })}
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Dashboard;
