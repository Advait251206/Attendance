import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAttendance } from '../context/AttendanceContext';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import api from '../api/axios';
import type { AttendanceRecord } from '../types';
import GlitchText from '../components/common/GlitchText';
import { containerVariants, itemVariants } from '../utils/animations';
import { Filter, Calendar as CalendarIcon } from 'lucide-react';
import clsx from 'clsx';

const History: React.FC = () => {
    const [logs, setLogs] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get('/attendance');
                setLogs(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const [searchParams, setSearchParams] = useSearchParams();
    const { subjects } = useAttendance();
    const selectedSubjectId = searchParams.get('subjectId');

    // Filter logs based on selection
    const filteredLogs = selectedSubjectId
        ? logs.filter(log => typeof log.subjectId === 'object' && log.subjectId?._id === selectedSubjectId)
        : logs;

    // Group logs by Date
    const groupedLogs = filteredLogs.reduce((acc, log) => {
        const dateKey = format(parseISO(log.date), 'yyyy-MM-dd');
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(log);
        return acc;
    }, {} as Record<string, AttendanceRecord[]>);

    if (loading) return <div className="text-primary animate-pulse">RETRIEVING AP LOGS...</div>;

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-8"
        >
            <header className="flex flex-col gap-6 border-b border-white/5 pb-6">
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-neon-gray text-sm font-mono mb-2">ARCHIVES</h2>
                        <GlitchText text="HISTORY LOGS" size="lg" />
                    </div>
                </div>

                {/* Subject Filter Chips */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <button
                        onClick={() => setSearchParams({})}
                        className={clsx(
                            "px-4 py-1.5 rounded-full text-xs font-bold tracking-wider transition-all whitespace-nowrap border",
                            !selectedSubjectId
                                ? "bg-primary text-black border-primary shadow-[0_0_10px_rgba(0,243,255,0.4)]"
                                : "bg-black/40 text-gray-400 border-white/10 hover:border-primary/50 hover:text-white"
                        )}
                    >
                        ALL
                    </button>
                    {subjects.map(sub => {
                        const colorMap: Record<string, string> = {
                            cyan: '#00f3ff',
                            purple: '#bc13fe',
                            red: '#ff003c',
                            yellow: '#fcee0a',
                            blue: '#2d2dff'
                        };
                        const hex = colorMap[sub.color?.toLowerCase()] || '#00f3ff';

                        return (
                            <button
                                key={sub._id}
                                onClick={() => setSearchParams({ subjectId: sub._id })}
                                className={clsx(
                                    "px-4 py-1.5 rounded-full text-xs font-bold tracking-wider transition-all whitespace-nowrap border",
                                    selectedSubjectId === sub._id
                                        ? "text-black shadow-[0_0_10px_currentColor]"
                                        : "bg-black/40 text-gray-400 border-white/10 hover:border-white/50 hover:text-white"
                                )}
                                style={selectedSubjectId === sub._id ? {
                                    backgroundColor: hex,
                                    borderColor: hex,
                                    color: '#000000'
                                } : {}}
                            >
                                {sub.name.toUpperCase()}
                            </button>
                        );
                    })}
                </div>
            </header>

            <div className="space-y-8 relative">
                {/* Timeline Vertical Line */}
                <div className="absolute left-[19px] top-0 bottom-0 w-px bg-white/10 z-0 hidden md:block" />

                {Object.entries(groupedLogs).sort((a, b) => b[0].localeCompare(a[0])).map(([dateKey, daysLogs]) => {
                    const dateObj = parseISO(dateKey);
                    return (
                        <motion.div variants={itemVariants} key={dateKey} className="relative z-10">
                            {/* Date Header */}
                            <div className="flex items-center gap-6 mb-4">
                                <div className="w-10 h-10 rounded-full bg-surface border border-primary/30 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                                    <CalendarIcon className="w-5 h-5 text-primary" />
                                </div>
                                <div className="bg-white/5 px-4 py-1.5 rounded-full border border-white/5 backdrop-blur-sm">
                                    <span className="text-sm font-bold font-display text-white">{format(dateObj, 'dd MMM yyyy')}</span>
                                    <span className="text-xs font-mono text-gray-500 ml-2 uppercase">{format(dateObj, 'EEEE')}</span>
                                </div>
                            </div>

                            {/* Day's Records */}
                            <div className="ml-5 md:ml-16 grid grid-cols-1 md:grid-cols-2 gap-3 pb-8 md:border-l border-white/5 md:pl-8">
                                {daysLogs.map((log) => {
                                    const subject = typeof log.subjectId === 'object' ? log.subjectId : null; // Populated?

                                    return (
                                        <div key={log._id} className={clsx(
                                            "p-4 rounded-lg border border-white/5 bg-surface/30 flex items-center justify-between",
                                            log.status === 'Present' ? 'border-l-4 border-l-primary' :
                                                log.status === 'Absent' ? 'border-l-4 border-l-danger' :
                                                    'border-l-4 border-l-gray-500'
                                        )}>
                                            <div>
                                                <h4 className="font-bold text-white text-sm">{subject?.name || 'Unknown Subject'}</h4>
                                                {log.note && <p className="text-xs font-mono text-gray-400 mt-1">"{log.note}"</p>}
                                            </div>
                                            <div className={clsx(
                                                "px-2 py-1 rounded text-xs font-bold uppercase tracking-wider",
                                                log.status === 'Present' ? 'text-primary bg-primary/10' :
                                                    log.status === 'Absent' ? 'text-danger bg-danger/10' :
                                                        'text-gray-400 bg-gray-500/10'
                                            )}>
                                                {log.status}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    );
                })}

                {logs.length === 0 && (
                    <div className="text-center py-20 text-gray-500 font-mono">
                        NO RECORDS FOUND IN ARCHIVE.
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default History;
