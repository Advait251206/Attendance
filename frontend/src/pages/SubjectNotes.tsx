import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAttendance } from '../context/AttendanceContext';
import GlitchText from '../components/common/GlitchText';
import NoteEditor from '../components/specific/NoteEditor';
import { containerVariants, itemVariants } from '../utils/animations';
import clsx from 'clsx';
import { ChevronRight } from 'lucide-react';

const SubjectNotes: React.FC = () => {
    const { subjects, loading } = useAttendance();
    const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

    const selectedSubject = subjects.find(s => s._id === selectedSubjectId);

    if (loading) return <div className="text-primary animate-pulse">LOADING MODULES...</div>;

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-8 h-[calc(100vh-140px)] flex flex-col"
        >
            <header className="border-b border-white/5 pb-6 shrink-0">
                <h2 className="text-neon-gray text-sm font-mono mb-2">KNOWLEDGE_BASE</h2>
                <GlitchText text="SUBJECT NOTES" size="lg" />
            </header>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 min-h-0">
                {/* Sidebar List */}
                <div className="md:col-span-3 lg:col-span-3 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {subjects.length === 0 && <p className="text-gray-500 font-mono text-sm">NO SUBJECTS AVAILABLE.</p>}
                    {subjects.map(subject => (
                        <motion.button
                            key={subject._id}
                            variants={itemVariants}
                            onClick={() => setSelectedSubjectId(subject._id)}
                            className={clsx(
                                "w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-center justify-between group",
                                selectedSubjectId === subject._id
                                    ? "bg-primary/10 border-primary/50 shadow-[0_0_10px_rgba(0,243,255,0.2)]"
                                    : "bg-surface/30 border-white/5 hover:border-white/20 hover:bg-surface/50"
                            )}
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className={clsx("w-2 h-2 rounded-full shrink-0 transition-transform", selectedSubjectId === subject._id && "scale-125 shadow-[0_0_5px_currentColor]")} style={{ backgroundColor: subject.color }}></div>
                                <span className={clsx("font-bold truncate text-sm", selectedSubjectId === subject._id ? "text-white" : "text-gray-400 group-hover:text-gray-200")}>
                                    {subject.name}
                                </span>
                            </div>
                            {selectedSubjectId === subject._id && <ChevronRight className="w-4 h-4 text-primary" />}
                        </motion.button>
                    ))}
                </div>

                {/* Editor Area */}
                <div className="md:col-span-9 lg:col-span-9 h-full">
                    {selectedSubject ? (
                        <motion.div
                            key={selectedSubject._id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                            className="h-full"
                        >
                            <NoteEditor subject={selectedSubject} />
                        </motion.div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl bg-surface/10 text-gray-500 font-mono">
                            <p>SELECT A SUBJECT TO ACCESS DATA.</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default SubjectNotes;
