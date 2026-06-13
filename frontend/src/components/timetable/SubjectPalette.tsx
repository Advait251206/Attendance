import React, { useState, useRef, useEffect } from 'react';
import DraggableSubject from './DraggableSubject';
import { Plus, Search, ChevronDown } from 'lucide-react';
import GlitchText from '../common/GlitchText';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

interface SubjectPaletteProps {
    subjects: any[];
    onAddSubject: (name: string, color: string, minAttendance: number) => void;
}

const COLORS = [
    { name: 'Cyan', value: 'cyan', hex: '#00f3ff' },
    { name: 'Purple', value: 'purple', hex: '#bc13fe' },
    { name: 'Red', value: 'red', hex: '#ff003c' },
    { name: 'Blue', value: 'blue', hex: '#2d2dff' },
    { name: 'Green', value: 'green', hex: '#00ff9f' },
    { name: 'Yellow', value: 'yellow', hex: '#fcee0a' },
    { name: 'Orange', value: 'orange', hex: '#ff8800' },
    { name: 'Gray', value: 'gray', hex: '#6b7280' }
];

const SubjectPalette: React.FC<SubjectPaletteProps> = ({ subjects, onAddSubject }) => {
    const [newItemName, setNewItemName] = useState('');
    const [newColor, setNewColor] = useState('cyan');
    const [newMin, setNewMin] = useState('75');
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newItemName.trim()) {
            onAddSubject(newItemName.trim(), newColor, parseInt(newMin) || 75);
            setNewItemName('');
            setNewColor('cyan');
            setNewMin('75');
            setIsDropdownOpen(false);
        }
    };

    const filteredSubjects = subjects.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const hasRecess = subjects.some(s => s.name.toUpperCase() === 'RECESS');

    const selectedColorObj = COLORS.find(c => c.value === newColor) || COLORS[0];

    return (
        <div className="w-64 shrink-0 bg-surface/10 border border-white/10 rounded-xl flex flex-col flex-1 min-h-0">
            <div className="p-4 border-b border-white/10">
                <h3 className="font-display font-bold uppercase text-gray-300 tracking-wider text-sm mb-4">SUBJECTS</h3>
                
                {/* Search */}
                <div className="relative mb-3">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                    <input 
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded px-2 py-1.5 pl-7 text-xs text-white focus:outline-none focus:border-primary/50"
                    />
                </div>

                {/* Add New */}
                <form onSubmit={handleAdd} className="flex flex-col gap-2 relative z-50">
                    <input 
                        type="text"
                        placeholder="New Subject Name"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-primary/50"
                    />
                    
                    <div className="flex gap-2 relative">
                         {/* Custom Color Dropdown */}
                         <div className="relative w-24" ref={dropdownRef}>
                            <button
                                type="button"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="w-full flex items-center justify-between bg-black/30 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-primary/50"
                            >
                                <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full shadow-[0_0_5px_currentColor]" style={{ color: selectedColorObj.hex, backgroundColor: selectedColorObj.hex }} />
                                    {selectedColorObj.name}
                                </span>
                                <ChevronDown className="w-3 h-3 text-gray-500" />
                            </button>

                            <AnimatePresence>
                                {isDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        className="absolute top-full left-0 right-0 mt-1 bg-black/90 border border-white/10 rounded overflow-hidden shadow-xl z-50 max-h-48 overflow-y-auto custom-scrollbar"
                                    >
                                        {COLORS.map((c) => (
                                            <button
                                                key={c.value}
                                                type="button"
                                                onClick={() => {
                                                    setNewColor(c.value);
                                                    setIsDropdownOpen(false);
                                                }}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                                            >
                                                <span className={clsx("w-2 h-2 rounded-full", newColor === c.value && "shadow-[0_0_8px_currentColor]")} style={{ backgroundColor: c.hex, color: c.hex }} />
                                                {c.name}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                         </div>

                         <input 
                            type="number"
                            placeholder="Min %"
                            min="0"
                            max="100"
                            value={newMin}
                            onChange={(e) => setNewMin(e.target.value)}
                            className="flex-1 bg-black/30 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-primary/50"
                        />
                         <button 
                            type="submit"
                            className="w-8 shrink-0 bg-primary/20 hover:bg-primary/30 text-primary p-1 rounded border border-primary/30 transition-colors flex items-center justify-center"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </form>

                {/* Quick Add Recess */}
                {!hasRecess && (
                    <button
                        onClick={() => onAddSubject('RECESS', 'gray', 0)}
                        className="w-full mt-2 bg-white/5 hover:bg-white/10 text-gray-400 text-xs py-1.5 rounded border border-dashed border-white/10 transition-colors flex items-center justify-center gap-2"
                    >
                        <Plus className="w-3 h-3" /> ADD RECESS
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {filteredSubjects.map(subject => (
                    <DraggableSubject 
                        key={subject._id} 
                        id={`palette-${subject._id}`} 
                        subject={subject} 
                    />
                ))}
            </div>
            
            <div className="p-2 text-[10px] text-gray-500 text-center font-mono bg-black/20">
                DRAG ITEMS TO GRID
            </div>
        </div>
    );
};

export default SubjectPalette;
