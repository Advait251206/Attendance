import React, { useState, useEffect } from 'react';
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, type DragStartEvent, type DragEndEvent } from '@dnd-kit/core';
import SubjectPalette from './SubjectPalette';
import TimetableGrid from './TimetableGrid';
import TrashBin from './TrashBin';
import DraggableSubject from './DraggableSubject';
import { useAttendance } from '../../context/AttendanceContext';
import CyberButton from '../common/CyberButton';
import { Save, RotateCcw } from 'lucide-react';
import api from '../../api/axios';

const TimetableEditor: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { subjects, refreshSubjects } = useAttendance();
    const [localSubjects, setLocalSubjects] = useState<any[]>([]);
    const [deletedSubjectIds, setDeletedSubjectIds] = useState<string[]>([]);
    const [activeDragItem, setActiveDragItem] = useState<any>(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [saving, setSaving] = useState(false);

    // Initialize local state
    useEffect(() => {
        setLocalSubjects(JSON.parse(JSON.stringify(subjects)));
    }, [subjects]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleAddSubject = (name: string, color: string, minAttendance: number) => {
        const newSubject = {
            _id: `temp-${Date.now()}`,
            name,
            color, 
            minAttendanceTarget: minAttendance,
            timetableSlides: [],
            isNew: true
        };
        setLocalSubjects(prev => [...prev, newSubject]);
        setHasChanges(true);
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        // active.id format: "palette-subId" or "grid-subId-day-time"
        const subjectId = active.id.toString().split('-')[1];
        const subject = localSubjects.find(s => s._id === subjectId);
        setActiveDragItem(subject);
    };
    
    // Correction: I need to update DraggableSubject to pass { day, time } in data.
    // I will write TimetableEditor assuming DraggableSubject provides `active.data.current = { subject, origin, day, time }`.

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragItem(null);

        const activeData = active.data.current;

        // Handle Drop on Trash
        if (over?.id === 'trash') {
            const subjectId = activeData?.subject._id;
            
            // If dragging from Palette -> Delete Subject entirely
            if (activeData?.origin === 'palette' && subjectId) {
                // If it's a temp subject (new), just remove from local
                // If it's a real subject, mark for deletion
                if (!subjectId.startsWith('temp-')) {
                   setDeletedSubjectIds(prev => [...prev, subjectId]);
                }
                setLocalSubjects(prev => prev.filter(s => s._id !== subjectId));
                setHasChanges(true);
            }
            // If dragging from Grid -> Remove just that slot (same as dropping outside)
            else if (activeData?.origin === 'grid') {
                 setLocalSubjects(prev => {
                    const next = JSON.parse(JSON.stringify(prev));
                    const subject = next.find((s: any) => s._id === activeData.subject._id);
                    if (subject) {
                         subject.timetableSlides = subject.timetableSlides.filter((s: any) => 
                            !(s.day === activeData.day && s.time === activeData.time)
                        );
                    }
                    return next;
                 });
                 setHasChanges(true);
            }
            return;
        }

        if (!over) {
            // Check if dropped outside (remove if from grid)
            if (activeData?.origin === 'grid') {
                 setLocalSubjects(prev => {
                    const next = JSON.parse(JSON.stringify(prev));
                    const subject = next.find((s: any) => s._id === activeData.subject._id);
                    if (subject) {
                         subject.timetableSlides = subject.timetableSlides.filter((s: any) => 
                            !(s.day === activeData.day && s.time === activeData.time)
                        );
                    }
                    return next;
                 });
                 setHasChanges(true);
            }
            return;
        }
        
        const targetDay = over.data.current?.day;
        const targetTime = over.data.current?.time;
        
        if (!activeData || !targetDay || !targetTime) return;

        setLocalSubjects(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            const subject = next.find((s: any) => s._id === activeData.subject._id);
            
            if (!subject) return prev;

            // 1. If coming from grid, remove old slot
            if (activeData.origin === 'grid') {
                subject.timetableSlides = subject.timetableSlides.filter((s: any) => 
                    !(s.day === activeData.day && s.time === activeData.time)
                );
            }

            // 2. Add to new slot
            // Check if slot already exists (prevent duplicates)
            const exists = subject.timetableSlides.some((s: any) => s.day === targetDay && s.time === targetTime);
            if (!exists) {
                subject.timetableSlides.push({ day: targetDay, time: targetTime });
            }
            
            // 3. (Optional) Handle Collision? 
            // If another subject is in this slot, should we overwrite/swap?
            // For now, let's just push. Multiple subjects in one slot might overlap in UI. 
            // My `TimetableGrid` implementation uses `find` (first match). So subsequent ones are hidden. 
            // We should remove ANY other subject from this slot to avoid "hidden" classes.
            next.forEach((s: any) => {
                if (s._id !== subject._id) {
                    s.timetableSlides = s.timetableSlides.filter((slot: any) => 
                        !(slot.day === targetDay && slot.time === targetTime)
                    );
                }
            });

            return next;
        });
        setHasChanges(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Need a way to save. 
            // 1. Create new subjects first.
            const newSubjects = localSubjects.filter(s => s.isNew);
            for (const s of newSubjects) {
                const res = await api.post('/subjects', {
                    name: s.name,
                    minAttendanceTarget: s.minAttendanceTarget,
                    color: s.color,
                    timetableSlides: s.timetableSlides
                });
                // Update local ID with real ID
                s._id = res.data._id;
            }

            // 2. Update existing subjects
            const existing = localSubjects.filter(s => !s.isNew);
            // We can run these in parallel
            await Promise.all(existing.map(s => 
                 api.put(`/subjects/${s._id}`, { timetableSlides: s.timetableSlides })
            ));
            
            // 3. Delete Removed Subjects
            if (deletedSubjectIds.length > 0) {
                await Promise.all(deletedSubjectIds.map(id => api.delete(`/subjects/${id}`)));
            }

            await refreshSubjects();
            onClose();
        } catch (error) {
            console.error("Failed to save timetable", error);
            alert("Failed to save changes.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <DndContext 
            sensors={sensors} 
            onDragStart={handleDragStart} 
            onDragEnd={handleDragEnd}
        >
            <div className="flex flex-col gap-4 h-[calc(100vh-100px)]">
                {/* Toolbar */}
                <div className="flex justify-between items-center bg-surface/20 p-4 rounded-xl border border-white/10">
                    <h2 className="text-xl font-display font-bold text-primary">EDITOR MODE</h2>
                    <div className="flex gap-4">
                        <button 
                            onClick={onClose} 
                            className="bg-danger/10 hover:bg-danger/20 text-danger border border-danger/30 px-4 py-2 rounded-lg transition-colors font-mono text-sm"
                        >
                            <span className="flex items-center gap-2">
                                <RotateCcw className="w-4 h-4" /> CANCEL
                            </span>
                        </button>
                        <CyberButton onClick={handleSave} disabled={!hasChanges || saving} variant="primary">
                            <span className="flex items-center gap-2">
                                <Save className="w-4 h-4" /> {saving ? 'SAVING...' : 'SAVE CHANGES'}
                            </span>
                        </CyberButton>
                    </div>
                </div>

                <div className="flex flex-1 gap-6 overflow-hidden">
                    <div className="flex flex-col h-full">
                        <SubjectPalette subjects={localSubjects} onAddSubject={handleAddSubject} />
                        <TrashBin />
                    </div>
                    <TimetableGrid subjects={localSubjects} />
                </div>

                <DragOverlay>
                    {activeDragItem ? (
                        <div className="w-32 opacity-80 rotate-3">
                             <DraggableSubject id="overlay" subject={activeDragItem} />
                        </div>
                    ) : null}
                </DragOverlay>
            </div>
        </DndContext>
    );
};

export default TimetableEditor;
