import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAttendance } from '../context/AttendanceContext';
import GlitchText from '../components/common/GlitchText';
import { containerVariants } from '../utils/animations';
import { Clock, CheckCircle, XCircle, AlertCircle, Edit3 } from 'lucide-react';
import { format, parseISO, isSameDay } from 'date-fns';
import api from '../api/axios';
import clsx from 'clsx';
import type { Subject } from '../types';
import CyberDatePicker from '../components/common/CyberDatePicker';
import TimetableEditor from '../components/timetable/TimetableEditor';

const Timetable: React.FC = () => {
    const { subjects } = useAttendance();
    const [viewMode, setViewMode] = useState<'default' | 'specific'>('default');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [isEditing, setIsEditing] = useState(false);
    const [logs, setLogs] = useState<any[]>([]);

    // Fetch logs only when in specific mode
    // Fetch logs and refresh subjects automatically every 5s
    // Fetch logs whenever view changes OR subjects update (e.g. triggered by AI)
    useEffect(() => {
        let isMounted = true;

        if (viewMode === 'specific') {
            const fetchLogs = async () => {
                try {
                    const res = await api.get('/attendance');
                    if (isMounted) setLogs(res.data);
                } catch (err) {
                    console.error("Failed to fetch logs", err);
                }
            };

            fetchLogs();

            return () => {
                isMounted = false;
            };
        }
    }, [viewMode, selectedDate, subjects]);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const times = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

    // --- Helper Logic ---
    const getSubjectForSlot = (day: string, time: string) => {
        return subjects.find(s =>
            s.timetableSlides?.some(slot => slot.day === day && slot.time === time)
        );
    };

    const getDailySchedule = (date: Date) => {
        const formattedDay = format(date, 'EEEE');
        const dayName = days.find(d => d.toLowerCase() === formattedDay.toLowerCase());
        const dayLogs = logs.filter(log => isSameDay(parseISO(log.date), date));

        if (!dayName) return [];

        // 1. Get ALL Scheduled Classes for this Day (Dynamic Time)
        const scheduled = subjects.flatMap(subject => {
            // Find all slides for this day
            const slides = subject.timetableSlides?.filter(slide =>
                slide.day.trim().toLowerCase() === dayName.trim().toLowerCase()
            ) || [];

            return slides.map(slide => {
                // Find matching logs - Get ALL logs for this subject
                const matchingLogs = dayLogs.filter(l =>
                    (typeof l.subjectId === 'string' ? l.subjectId === subject._id : l.subjectId._id === subject._id)
                );
                // Select the LATEST log (last in array)
                const log = matchingLogs.length > 0 ? matchingLogs[matchingLogs.length - 1] : undefined;

                return {
                    type: 'scheduled',
                    time: slide.time,
                    subject,
                    status: log?.status || 'Pending',
                    log
                };
            });
        });

        // 2. Get Extra classes
        const extraClasses = dayLogs.filter(log => {
            const hasSubject = log.subjectId && (typeof log.subjectId === 'string' || log.subjectId._id);
            if (!hasSubject) return false;
            
            const sId = typeof log.subjectId === 'string' ? log.subjectId : log.subjectId._id;
            const isScheduledToday = subjects.find(s => s._id === sId)?.timetableSlides?.some(slot =>
                slot.day.toLowerCase() === dayName.toLowerCase()
            );
            return !isScheduledToday;
        }).map(log => {
             const hasSubject = log.subjectId && (typeof log.subjectId === 'string' || log.subjectId._id);
             if (!hasSubject) return null;

             const sId = typeof log.subjectId === 'string' ? log.subjectId : log.subjectId._id;
            const subject = subjects.find(s => s._id === sId);
            if (!subject) return null;

            return {
                type: 'extra',
                time: 'EXTRA',
                subject: subject,
                status: log.status,
                log
            };
        }).filter((item): item is { type: string; time: string; subject: Subject; status: any; log: any } => !!item);

        const sortedSchedule = [...scheduled, ...extraClasses].sort((a, b) => {
            if (a.time === 'EXTRA') return 1;
            if (b.time === 'EXTRA') return -1;
            return a.time.localeCompare(b.time);
        });

        // Merge consecutive items
        const mergedSchedule: typeof sortedSchedule = [];
        sortedSchedule.forEach((item, index) => {
            if (index === 0) {
                mergedSchedule.push(item);
                return;
            }

            const prev = mergedSchedule[mergedSchedule.length - 1];
            
            // Check if same subject and consecutive numeric hours
            // Simple check: same subject_id and adjacent in sorted list?
            // "adjacent" means time is consecutive? 
            // e.g. 09:00 and 10:00.
            
            const isSameSubject = prev.subject._id === item.subject._id;
            const prevHour = parseInt(prev.time.split(':')[0]);
            const currHour = parseInt(item.time.split(':')[0]);
            const isConsecutive = (currHour - prevHour) === 1;

            if (isSameSubject && isConsecutive) {
                // Merge visual: Update "time" label to show range or start
                // We keep 'time' as start time for sorting, but maybe add a displayTime?
                // Or just keep the first one.
                // The item being pushed needs to represent the block.
                // We won't push the current item, effectively merging it into prev.
                
                // Optional: Update prev to indicate duration/end time?
                // The UI might just show "09:00". User knows it's double?
                // Or we append range string? "09:00 - 11:00"
                // Let's modify the `time` of prev to be a range if possible, or just keep start.
                // User asked "One attendance considered". 
                // If we hide the second button, they can only click one. Perfect.
            } else {
                mergedSchedule.push(item);
            }
        });

        return mergedSchedule;
    };

    const dailySchedule = getDailySchedule(selectedDate);

    // --- Render Components ---

    if (isEditing) {
        return <TimetableEditor onClose={() => setIsEditing(false)} />;
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-8"
        >
            <header className="flex flex-col md:flex-row justify-between items-end border-b border-white/5 pb-6 gap-4">
                <div>
                    <h2 className="text-neon-gray text-sm font-mono mb-2">SCHEDULE MATRIX</h2>
                    <GlitchText text="TIMETABLE" size="lg" />
                </div>

                <div className='flex gap-4 items-center'>
                    {/* View Switcher */}
                    <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                        <button
                            onClick={() => setViewMode('default')}
                            className={clsx(
                                "px-4 py-2 rounded text-xs font-bold font-mono transition-all",
                                viewMode === 'default' ? "bg-primary text-black shadow-[0_0_15px_rgba(0,243,255,0.4)]" : "text-gray-400 hover:text-white"
                            )}
                        >
                            DEFAULT WEEKLY TIMETABLE
                        </button>
                        <button
                            onClick={() => setViewMode('specific')}
                            className={clsx(
                                "px-4 py-2 rounded text-xs font-bold font-mono transition-all",
                                viewMode === 'specific' ? "bg-primary text-black shadow-[0_0_15px_rgba(0,243,255,0.4)]" : "text-gray-400 hover:text-white"
                            )}
                        >
                            SPECIFIC DATE
                        </button>
                    </div>

                    {viewMode === 'default' && (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg border border-white/20 transition-colors flex items-center gap-2"
                        >
                            <Edit3 className="w-4 h-4" /> 
                            <span className="font-mono text-xs hidden md:block">EDIT DEFAULT TIMETABLE</span>
                        </button>
                    )}
                </div>
            </header>

            <AnimatePresence mode="wait">
                {viewMode === 'default' ? (
                    <motion.div
                        key="default"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="overflow-x-auto pb-4 custom-scrollbar"
                    >
                        <div className="min-w-[800px] border border-white/5 rounded-xl bg-surface/20">
                            {/* Header Row */}
                            <div className="grid grid-cols-9 border-b border-white/5 bg-black/40">
                                <div className="p-4 border-r border-white/5 text-gray-400 font-mono text-xs flex items-center justify-center">
                                    <Clock className="w-4 h-4" />
                                </div>
                                {times.map(time => {
                                    const [hour] = time.split(':').map(Number);
                                    const format12h = (h: number) => {
                                        const period = h >= 12 ? 'PM' : 'AM';
                                        const displayH = h > 12 ? h - 12 : (h === 0 || h === 12 ? 12 : h);
                                        return `${displayH}${period}`;
                                    };
                                    return (
                                        <div key={time} className="p-4 border-r border-white/5 text-gray-400 font-mono text-xs text-center border-l border-white/5 last:border-r-0 whitespace-nowrap">
                                            {format12h(hour)} - {format12h(hour + 1)}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Day Rows */}
                            {days.map(day => (
                                <div key={day} className="grid grid-cols-9 border-b border-white/5 last:border-b-0 group hover:bg-white/5 transition-colors">
                                    <div className="p-4 border-r border-white/5 font-display font-bold text-gray-300 flex items-center justify-center uppercase bg-black/20">
                                        {day.substring(0, 3)}
                                    </div>
                                    {times.map(time => {
                                        const subject = getSubjectForSlot(day, time);
                                        return (
                                            <div key={`${day}-${time}`} className="relative p-2 border-r border-white/5 last:border-r-0 min-h-[80px]">
                                                {subject ? (
                                                    <motion.div
                                                        initial={{ scale: 0.9, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        className="w-full h-full rounded-lg p-2 flex flex-col justify-center items-center text-center gap-1 shadow-lg border border-white/10"
                                                        style={{ backgroundColor: `${subject.name.match(/break|recess|lunch/i) ? 'rgba(255,255,255,0.05)' : subject.color === 'cyan' ? 'rgba(0,243,255,0.15)' : subject.color === 'purple' ? 'rgba(188,19,254,0.15)' : subject.color === 'red' ? 'rgba(255,0,60,0.15)' : 'rgba(45,45,255,0.15)'}` }}
                                                    >
                                                        <span className={clsx("text-xs font-bold leading-tight", subject.name.match(/break|recess|lunch/i) ? "text-gray-500 font-mono tracking-widest text-[10px]" : "")} style={{ color: subject.name.match(/break|recess|lunch/i) ? undefined : subject.color }}>
                                                            {subject.name.match(/break|recess|lunch/i) ? subject.name.toUpperCase() : subject.name}
                                                        </span>
                                                    </motion.div>
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <span className="text-white/5 text-2xl font-mono">+</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="specific"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        {/* Date Picker Bar */}
                        <div className="flex items-center gap-4">
                            <CyberDatePicker
                                selectedDate={selectedDate}
                                onChange={setSelectedDate}
                            />
                            <div className="text-xs font-mono text-gray-500 bg-surface/10 px-4 py-3 rounded-xl border border-white/5">
                                {format(selectedDate, 'EEEE').toUpperCase()} SCHEDULE
                            </div>
                        </div>

                        {/* List View */}
                        <div className="grid gap-4">
                            {dailySchedule.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 font-mono border border-dashed border-white/10 rounded-xl">
                                    NO CLASSES SCHEDULED FOR THIS DATE.
                                </div>
                            ) : (
                                dailySchedule.map((item, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: idx * 0.1 }}
                                        key={idx}
                                        className="flex items-center gap-4 p-4 rounded-xl bg-surface/10 border border-white/5 relative overflow-hidden group hover:border-white/20 transition-colors"
                                    >
                                        {/* Status Indicator Bar */}
                                        <div className={clsx(
                                            "absolute left-0 top-0 bottom-0 w-1",
                                            item.status === 'Present' ? 'bg-primary' :
                                                item.status === 'Absent' ? 'bg-danger' :
                                                    item.status === 'Cancelled' ? 'bg-gray-500' :
                                                        item.type === 'extra' ? 'bg-yellow-500' : 'bg-white/10'
                                        )} />

                                        {/* Time Box */}
                                        <div className="w-32 shrink-0 flex flex-col items-center justify-center border-r border-white/10 pr-4">
                                            <span className={clsx("font-mono text-sm font-bold whitespace-nowrap", item.type === 'extra' ? 'text-yellow-500' : 'text-white')}>
                                                {(() => {
                                                    if (item.time === 'EXTRA') return 'EXTRA CLASS';
                                                    if (!item.time.includes(':')) return item.time;

                                                    const h = parseInt(item.time.split(':')[0]);

                                                    const startP = h >= 12 && h < 24 ? 'PM' : 'AM';
                                                    const startStr = `${h % 12 || 12}${startP}`;

                                                    const endH = h + 1;
                                                    const endP = (endH % 24) >= 12 ? 'PM' : 'AM';
                                                    const endStr = `${endH % 12 || 12}${endP}`;

                                                    return `${startStr} - ${endStr}`;
                                                })()}
                                            </span>
                                        </div>

                                        {/* Subject Info */}
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold font-display" style={{ color: item.subject.color }}>
                                                {item.subject.name}
                                            </h3>
                                            {item.log?.note && (
                                                <p className="text-xs font-mono text-gray-400 mt-1">
                                                    NOTE: "{item.log.note}"
                                                </p>
                                            )}
                                        </div>

                                        {/* Status Badge */}
                                        <div className="px-4">
                                            {item.status === 'Present' && (
                                                <div className="flex items-center gap-2 text-primary font-bold font-mono text-sm shadow-[0_0_10px_rgba(0,243,255,0.3)] px-3 py-1 rounded bg-primary/10">
                                                    <CheckCircle className="w-4 h-4" /> PRESENT
                                                </div>
                                            )}
                                            {item.status === 'Absent' && (
                                                <div className="flex items-center gap-2 text-danger font-bold font-mono text-sm shadow-[0_0_10px_rgba(255,0,60,0.3)] px-3 py-1 rounded bg-danger/10">
                                                    <XCircle className="w-4 h-4" /> ABSENT
                                                </div>
                                            )}
                                            {item.status === 'Cancelled' && (
                                                <div className="flex items-center gap-2 text-gray-500 font-bold font-mono text-sm">
                                                    <AlertCircle className="w-4 h-4" /> CANCELLED
                                                </div>
                                            )}
                                            {item.status === 'Pending' && (
                                                <div className="flex items-center gap-2 text-gray-600 font-bold font-mono text-sm opacity-50">
                                                    UNMARKED
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-4 p-4 border border-dashed border-white/10 rounded-xl bg-surface/10 text-sm font-mono text-gray-500">
                <span className="text-primary">TIP:</span> Use <strong>EDIT DEFAULT TIMETABLE</strong> for permanent changes. Ask AI for <strong>"Add Math class today"</strong> for temporary overrides.
            </div>
        </motion.div>
    );
};

export default Timetable;
