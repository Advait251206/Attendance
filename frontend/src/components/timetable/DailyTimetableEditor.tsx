import React, { useState, useEffect } from 'react';
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, type DragStartEvent, type DragEndEvent } from '@dnd-kit/core';
import SubjectPalette from './SubjectPalette';
import { useAttendance } from '../../context/AttendanceContext';
import CyberButton from '../common/CyberButton';
import { Save, RotateCcw, Clock } from 'lucide-react';
import DraggableSubject from './DraggableSubject';
import DroppableSlot from './DroppableSlot';
import TrashBin from './TrashBin';

const times = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

// Pseudo-subject for Recess
const RECESS_SUBJECT = {
    _id: 'RECESS',
    name: 'RECESS',
    color: 'gray',
    minAttendanceTarget: 0
};

interface DailyTimetableEditorProps {
    date: Date;
    dayName: string;
    onClose: () => void;
    onSave: (scheduleMap: Record<string, any>) => void;
}

const DailyTimetableEditor: React.FC<DailyTimetableEditorProps> = ({ date, dayName, onClose, onSave }) => {
    const { subjects } = useAttendance();
    const [schedule, setSchedule] = useState<Record<string, any>>({});
    const [activeDragItem, setActiveDragItem] = useState<any>(null);
    const [hasChanges, setHasChanges] = useState(false);

    // Initialize with current actual schedule
    useEffect(() => {
        const initialSchedule: Record<string, any> = {};
        subjects.forEach(subject => {
            subject.timetableSlides?.forEach((slot: any) => {
                if (slot.day === dayName) {
                    initialSchedule[slot.time] = subject;
                }
            });
        });
        setSchedule(initialSchedule);
    }, [subjects, dayName]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const idStr = active.id.toString();
        
        // Check if Recess
        if (idStr === 'palette-RECESS') {
            setActiveDragItem(RECESS_SUBJECT);
            return;
        }

        const subjectId = idStr.split('-')[1];
        
        if (subjectId === 'RECESS') {
             setActiveDragItem(RECESS_SUBJECT);
        } else {
            const subject = subjects.find(s => s._id === subjectId);
            setActiveDragItem(subject);
        }

    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragItem(null);

        // Handle Drop on Trash
        if (over?.id === 'trash') {
            // Only handle removal if it came from the grid
             if (active.data.current?.origin === 'grid') {
                setSchedule(prev => {
                    const next = { ...prev };
                    delete next[active.data.current?.time];
                    return next;
                });
                setHasChanges(true);
             }
            return;
        }

        if (!over) {
            // Dropped outside? Remove from schedule if it was in grid
             if (active.data.current?.origin === 'grid') {
                setSchedule(prev => {
                    const next = { ...prev };
                    delete next[active.data.current?.time];
                    return next;
                });
                setHasChanges(true);
             }
            return;
        }

        const targetTime = over.data.current?.time;
        if (!targetTime) return;

        // Determine Subject
        let subject = null;
        if (active.id.toString() === 'palette-RECESS' || active.data.current?.subject._id === 'RECESS') {
            subject = RECESS_SUBJECT;
        } else {
            const subjectId = active.id.toString().split('-')[1];
            subject = subjects.find(s => s._id === subjectId);
        }

        if (subject) {
            setSchedule(prev => {
                const next = { ...prev };
                
                // Remove from old slot if moving within grid
                if (active.data.current?.origin === 'grid') {
                     delete next[active.data.current?.time]; 
                }

                next[targetTime] = subject;
                return next;
            });
            setHasChanges(true);
        }
    };

    const handleSaveClick = () => {
        onSave(schedule);
        onClose();
    };

    // Inject Recess into Palette, filtering out any existing "RECESS" subject to avoid duplicates
    const paletteSubjects = [RECESS_SUBJECT, ...subjects.filter(s => s.name.toUpperCase() !== 'RECESS')];

    // Helper to format 09:00 -> 9AM - 10AM
    const formatTimeRange = (time: string) => {
        const [h] = time.split(':').map(Number);
        const format = (hour: number) => {
            const period = hour >= 12 ? 'PM' : 'AM';
            const h12 = hour > 12 ? hour - 12 : (hour === 0 || hour === 12 ? 12 : hour);
            return `${h12}${period}`;
        };
        return `${format(h)} - ${format(h + 1)}`;
    };

    return (
        <DndContext 
            sensors={sensors} 
            onDragStart={handleDragStart} 
            onDragEnd={handleDragEnd}
        >
            <div className="fixed inset-y-0 right-0 left-0 md:left-64 z-40 bg-black flex flex-col p-6">
                 <div className="w-full h-full flex flex-col gap-4">
                     {/* Toolbar */}
                    <div className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-white/10 mx-6">
                        <div>
                            <h2 className="text-xl font-display font-bold text-primary">EDIT DAILY SCHEDULE</h2>
                            <p className="text-xs font-mono text-gray-500">
                                {dayName.toUpperCase()} • {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <button 
                                onClick={onClose} 
                                className="bg-danger/10 hover:bg-danger/20 text-danger border border-danger/30 px-4 py-2 rounded-lg transition-colors font-mono text-sm"
                            >
                                <span className="flex items-center gap-2">
                                    <RotateCcw className="w-4 h-4" /> CANCEL
                                </span>
                            </button>
                            <div className={hasChanges ? "" : "opacity-50 pointer-events-none grayscale"}>
                                <CyberButton onClick={handleSaveClick} variant="primary">
                                    <span className="flex items-center gap-2">
                                        <Save className="w-4 h-4" /> APPLY FOR TODAY
                                    </span>
                                </CyberButton>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-1 gap-6 overflow-hidden p-6 pt-2">
                        {/* Palette */}
                        <div className="flex flex-col h-full w-64 shrink-0">
                             <SubjectPalette 
                                subjects={paletteSubjects} 
                                onAddSubject={() => {}} 
                            />
                            <TrashBin />
                        </div>

                        {/* Daily Grid */}
                        <div className="flex-1 bg-black/20 border border-white/10 rounded-xl overflow-hidden flex flex-col">
                             <div className="p-4 border-b border-white/10 bg-black/40 text-center font-display font-bold uppercase text-gray-300 tracking-wider text-sm">
                                TIME SLOTS
                             </div>
                             <div className="overflow-y-auto flex-1">
                                <div className="w-full">
                                    {times.map(time => {
                                        const subject = schedule[time];
                                        return (
                                            <div key={time} className="flex items-stretch h-24 border-b border-white/10 last:border-b-0 bg-black/20 group hover:bg-white/5 transition-colors">
                                                {/* Time Label */}
                                                <div className="w-24 bg-black/20 flex flex-col items-center justify-center border-r border-white/10 p-2 text-center">
                                                    <Clock className="w-4 h-4 text-gray-500 mb-1" />
                                                    <span className="font-display font-bold text-gray-300 text-xs leading-tight">{formatTimeRange(time)}</span>
                                                </div>
                                                
                                                {/* Droppable Area */}
                                                <div className="flex-1">
                                                    <DroppableSlot 
                                                        id={`slot-${time}`} 
                                                        day={dayName} 
                                                        time={time}
                                                        className="h-full w-full p-1"
                                                    >
                                                        {subject && (
                                                            <div className="w-full h-full">
                                                                <DraggableSubject 
                                                                    id={`grid-${subject._id}-${dayName}-${time}`}
                                                                    subject={subject}
                                                                    isInGrid={true}
                                                                    day={dayName}
                                                                    time={time}
                                                                />
                                                            </div>
                                                        )}
                                                    </DroppableSlot>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                             </div>
                        </div>
                    </div>
                 </div>

                 <DragOverlay>
                    {activeDragItem ? (
                        <div className="w-64 opacity-80 rotate-3">
                             <DraggableSubject id="overlay" subject={activeDragItem} />
                        </div>
                    ) : null}
                </DragOverlay>
            </div>
        </DndContext>
    );
};

export default DailyTimetableEditor;
