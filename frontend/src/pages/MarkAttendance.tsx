import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAttendance } from '../context/AttendanceContext';
import GlitchText from '../components/common/GlitchText';
import SubjectRow from '../components/specific/SubjectRow';
import { containerVariants } from '../utils/animations';
import { format, isSameDay, parseISO } from 'date-fns';
import DailyTimetableEditor from '../components/timetable/DailyTimetableEditor';

const MarkAttendance: React.FC = () => {
    const { subjects, markAttendance, loading } = useAttendance();
    const [logs, setLogs] = useState<Record<string, { status: 'Present' | 'Absent' | 'Cancelled', note?: string }>>({});
    const [date] = useState(new Date());
    const [addedSubjects, setAddedSubjects] = useState<string[]>([]);
    const [showDailyEditor, setShowDailyEditor] = useState(false);

    // Extract fetch logic to be reusable
    const fetchTodayLogs = async () => {
        try {
            const res = await import('../api/axios').then(m => m.default.get('/attendance'));
            const allLogs: any[] = res.data;

            // Robust date comparison handling timezones
            const todayLogs = allLogs.filter((l: any) => isSameDay(parseISO(l.date), new Date()));

            const logMap: Record<string, { status: 'Present' | 'Absent' | 'Cancelled', note?: string }> = {};
            todayLogs.forEach((l: any) => {
                // Determine subjectId safely
                let sId: string | null = null;
                if (typeof l.subjectId === 'string') {
                    sId = l.subjectId;
                } else if (l.subjectId && l.subjectId._id) {
                    sId = l.subjectId._id;
                }
                
                if (sId) {
                    logMap[sId] = { status: l.status, note: l.note };
                }
            });
            setLogs(logMap);
        } catch (err) {
            console.error("Failed to fetch today's logs", err);
        }
    };

    // Initialize logs on load and refresh when subjects change
    useEffect(() => {
        fetchTodayLogs();
    }, [subjects]);

    const handleLogChange = async (subjectId: string, status: 'Present' | 'Absent' | 'Cancelled', note?: string) => {
        // Optimistic Update
        setLogs(prev => ({
            ...prev,
            [subjectId]: { status, note }
        }));

        // Auto Save
        try {
            await markAttendance([{
                date: date.toISOString(),
                subjectId,
                status,
                note
            }]);
        } catch (err) {
            console.error("Auto-save failed", err);
        }
    };

    if (loading) return <div className="text-primary animate-pulse">SYNCING...</div>;



    // Filter Logic: Scheduled Today OR Has Log OR Custom Added
    const subjectsToShow = subjects.filter(s => !s.name.match(/break|recess|lunch/i)).filter(subject => {
        const today = format(date, 'EEEE');
        const isScheduled = subject.timetableSlides?.some(slot => slot.day === today) || (!subject.timetableSlides || subject.timetableSlides.length === 0);
        const hasLog = !!logs[subject._id];
        const isAdded = addedSubjects.includes(subject._id);
        
        return isScheduled || hasLog || isAdded;
    });

    const handleSaveSchedule = (scheduleMap: Record<string, any>) => {
        // Extract unique subject IDs that are NOT 'RECESS'
        const uniqueIds = Array.from(new Set(
            Object.values(scheduleMap)
                .map((s: any) => s._id)
                .filter((id: string) => id !== 'RECESS')
        ));
        setAddedSubjects(uniqueIds as string[]);
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-8 pb-20 relative"
        >
            <header className="flex justify-between items-end border-b border-white/5 pb-6">
                <div>
                    <h2 className="text-neon-gray text-sm font-mono mb-2">DAILY LOG</h2>
                    <GlitchText text="MARK ATTENDANCE" size="lg" />
                    <p className="text-gray-400 font-mono mt-2">{format(date, 'EEEE, dd MMMM yyyy').toUpperCase()}</p>
                </div>
                <button 
                    onClick={() => setShowDailyEditor(true)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface/50 border border-white/10 hover:border-primary/50 text-xs font-mono text-cyan-400 transition-colors"
                >
                    EDIT SCHEDULE
                </button>
            </header>

            {subjects.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 font-mono border border-dashed border-white/10 rounded-xl m-4">
                    <p>NO SUBJECTS FOUND.</p>
                </div>
            ) : (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="space-y-4 pb-20"
                >
                    <p className="text-xs font-mono text-gray-500 uppercase">Select subjects to mark for today:</p>
                    {subjectsToShow.map((subject) => (
                        <SubjectRow
                            key={subject._id}
                            subject={subject}
                            status={logs[subject._id]?.status || null}
                            note={logs[subject._id]?.note}
                            onChange={(status, note) => handleLogChange(subject._id, status, note)}
                        />
                    ))}
                    {subjectsToShow.length === 0 && (
                        <motion.div className="p-8 text-center text-gray-500 font-mono border border-white/5 rounded-xl">
                            NO CLASSES SCHEDULED FOR TODAY.
                        </motion.div>
                    )}
                </motion.div>
            )}

            {/* Daily Editor Modal */}
            {showDailyEditor && (
                <DailyTimetableEditor
                    date={date}
                    dayName={format(date, 'EEEE')}
                    onClose={() => setShowDailyEditor(false)}
                    onSave={handleSaveSchedule}
                />
            )}
        </motion.div>
    );
};

export default MarkAttendance;
