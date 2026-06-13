import React, { useState } from 'react';
import { motion } from 'framer-motion';

import clsx from 'clsx';
import { MessageSquare } from 'lucide-react';
import type { Subject } from '../../types';
import { itemVariants } from '../../utils/animations';

interface SubjectRowProps {
    subject: Subject;
    onChange: (status: 'Present' | 'Absent' | 'Cancelled', note?: string) => void;
    status: 'Present' | 'Absent' | 'Cancelled' | null;
    note?: string;
}

const SubjectRow: React.FC<SubjectRowProps> = ({ subject, onChange, status, note }) => {
    const [showNote, setShowNote] = useState(false);
    const [currentNote, setCurrentNote] = useState(note || '');

    const handleStatusChange = (newStatus: 'Present' | 'Absent' | 'Cancelled') => {
        onChange(newStatus, currentNote);
    };

    const handleNoteBlur = () => {
        onChange(status || 'Present', currentNote); // Default to present if changing note
    };

    return (
        <motion.div
            variants={itemVariants}
            className={clsx(
                "relative p-4 rounded-xl border border-white/5 bg-surface/40 backdrop-blur-sm transition-all duration-300",
                status === 'Present' ? 'border-primary/30 shadow-[0_0_10px_rgba(0,243,255,0.1)]' :
                    status === 'Absent' ? 'border-danger/30 shadow-[0_0_10px_rgba(255,0,60,0.1)]' :
                        status === 'Cancelled' ? 'border-gray-600/30' : 'hover:border-white/20'
            )}
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Subject Info */}
                <div className="flex items-center gap-4">
                    <div className="w-1 h-12 rounded-full" style={{ backgroundColor: subject.color }}></div>
                    <div>
                        <h3 className="text-lg font-bold text-white">{subject.name}</h3>
                        {/* Show Time if mapped (TODO: Map real timetable time) */}
                        <p className="text-xs font-mono text-gray-500">SCHEDULED CLASS</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {['Present', 'Absent', 'Cancelled'].map((s) => (
                        <button
                            key={s}
                            onClick={() => handleStatusChange(s as any)}
                            className={clsx(
                                "px-3 py-2 rounded-lg flex items-center justify-center transition-all duration-200 border border-transparent font-bold text-xs tracking-wider uppercase",
                                // Active States
                                status === s && s === 'Present' && "bg-primary text-black shadow-[0_0_15px_rgba(0,243,255,0.5)] scale-105",
                                status === s && s === 'Absent' && "bg-danger text-white shadow-[0_0_15px_rgba(255,0,60,0.5)] scale-105",
                                status === s && s === 'Cancelled' && "bg-gray-600 text-white scale-105",
                                // Inactive States
                                status !== s && "bg-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-300"
                            )}
                        >
                            {s}
                        </button>
                    ))}

                    <div className="w-px h-8 bg-white/10 mx-2" />
                    <button
                        title="Add Note"
                        onClick={() => setShowNote(!showNote)}
                        className={clsx(
                            "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 border border-transparent",
                            (showNote || currentNote) ? "text-secondary bg-secondary/10 border-secondary/30" : "text-gray-400 hover:bg-white/5"
                        )}
                    >
                        <MessageSquare className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Note Input */}
            {showNote && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="mt-4"
                >
                    <textarea
                        value={currentNote}
                        onChange={(e) => setCurrentNote(e.target.value)}
                        onBlur={handleNoteBlur}
                        placeholder="Add a remark (e.g., Medical Leave, Proxy)..."
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-neon-white focus:border-secondary/50 focus:outline-none focus:shadow-[0_0_10px_rgba(188,19,254,0.1)] resize-none font-mono"
                        rows={2}
                    />
                </motion.div>
            )}
        </motion.div>
    );
};

export default SubjectRow;
