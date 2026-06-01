import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import clsx from 'clsx';

interface CyberDatePickerProps {
    selectedDate: Date;
    onChange: (date: Date) => void;
}

const CyberDatePicker: React.FC<CyberDatePickerProps> = ({ selectedDate, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(selectedDate);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Sync viewDate if selectedDate changes externally (optional, but good UX)
    useEffect(() => {
        setViewDate(selectedDate);
    }, [selectedDate]);

    const nextMonth = () => setViewDate(addMonths(viewDate, 1));
    const prevMonth = () => setViewDate(subMonths(viewDate, 1));

    const handleDayClick = (day: Date) => {
        onChange(day);
        setIsOpen(false);
    };

    // Generate days
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
        <div className="relative" ref={containerRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    "flex items-center gap-3 bg-surface/20 px-4 py-3 rounded-xl border transition-all duration-300 group",
                    isOpen ? "border-primary shadow-[0_0_15px_rgba(0,243,255,0.3)] bg-surface/40" : "border-white/5 hover:border-white/20 hover:bg-surface/30"
                )}
            >
                <CalendarIcon className={clsx("w-5 h-5 transition-colors", isOpen ? "text-primary" : "text-gray-400 group-hover:text-white")} />
                <span className={clsx("font-mono text-sm uppercase tracking-wider", isOpen ? "text-white" : "text-gray-300")}>
                    {format(selectedDate, 'dd MMM yyyy')}
                </span>
            </button>

            {/* Dropdown Calendar */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full mt-4 left-0 z-50 w-[320px] bg-[#050505] border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] p-4 backdrop-blur-xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
                            <button onClick={prevMonth} className="p-1 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="font-display font-bold text-white tracking-widest uppercase">
                                {format(viewDate, 'MMMM yyyy')}
                            </span>
                            <button onClick={nextMonth} className="p-1 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Weekday Labels */}
                        <div className="grid grid-cols-7 mb-2">
                            {weekDays.map(day => (
                                <div key={day} className="text-center text-[10px] font-mono text-gray-500 uppercase py-1">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Days Grid */}
                        <div className="grid grid-cols-7 gap-1">
                            {calendarDays.map((day, idx) => {
                                const isSelected = isSameDay(day, selectedDate);
                                const isCurrentMonth = isSameMonth(day, viewDate);
                                const isTodayDate = isToday(day);

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleDayClick(day)}
                                        className={clsx(
                                            "relative h-9 w-9 rounded-lg flex items-center justify-center text-xs font-mono transition-all duration-200",
                                            !isCurrentMonth && "text-gray-800",
                                            isCurrentMonth && !isSelected && "text-gray-300 hover:bg-white/10 hover:text-white",
                                            isSelected && "bg-primary text-black font-bold shadow-[0_0_10px_rgba(0,243,255,0.4)]",
                                            isTodayDate && !isSelected && "border border-primary/50 text-primary"
                                        )}
                                    >
                                        {format(day, 'd')}
                                        {isTodayDate && !isSelected && (
                                            <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CyberDatePicker;
