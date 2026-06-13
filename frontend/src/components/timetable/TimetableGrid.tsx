import React from 'react';
import DroppableSlot from './DroppableSlot';
import DraggableSubject from './DraggableSubject';
import { Clock } from 'lucide-react';

interface TimetableGridProps {
    subjects: any[];
}

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const times = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

const TimetableGrid: React.FC<TimetableGridProps> = ({ subjects }) => {
    
    // Helper to find what subject (if any) is in a slot
    const getSubjectForSlot = (day: string, time: string) => {
        // Need to check which subject has this slot in its slides
        return subjects.find(s => 
            s.timetableSlides?.some((slot: any) => slot.day === day && slot.time === time)
        );
    };

    return (
        <div className="flex-1 min-w-[800px] border border-white/5 rounded-xl bg-surface/20 overflow-hidden">
             {/* Header Row */}
             <div className="grid grid-cols-9 border-b border-white/5 bg-black/40">
                <div className="p-4 border-r border-white/5 text-gray-400 font-mono text-xs flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                </div>
                {times.map(time => {
                    const [hour] = time.split(':').map(Number);
                    
                    const formatTime = (h: number) => {
                        const period = h >= 12 ? 'PM' : 'AM';
                        const displayH = h > 12 ? h - 12 : (h === 0 || h === 12 ? 12 : h);
                        return `${displayH}${period}`;
                    };

                    const startStr = formatTime(hour);
                    const endStr = formatTime(hour + 1);

                    return (
                        <div key={time} className="p-4 border-r border-white/5 text-gray-400 font-mono text-xs text-center border-l border-white/5 last:border-r-0 whitespace-nowrap">
                            {startStr} - {endStr}
                        </div>
                    );
                })}
            </div>

            {/* Day Rows */}
            {days.map(day => {
                // Calculate merged slots
                const slots = [];
                let i = 0;
                while(i < times.length) {
                    const time = times[i];
                    const subject = getSubjectForSlot(day, time);
                    let span = 1;
                    
                    if (subject) {
                        // Look ahead
                        while (i + span < times.length) {
                            const nextTime = times[i + span];
                            const nextSubject = getSubjectForSlot(day, nextTime);
                            if (nextSubject && nextSubject._id === subject._id) {
                                span++;
                            } else {
                                break;
                            }
                        }
                    }
                    slots.push({ time, subject, span });
                    i += span;
                }

                return (
                    <div key={day} className="grid grid-cols-9 last:border-b-0">
                        <div className="p-4 border-r border-b border-white/5 font-display font-bold text-gray-300 flex items-center justify-center uppercase bg-black/20">
                            {day.substring(0, 3)}
                        </div>
                        {slots.map(slot => {
                            const { time, subject, span } = slot;
                            const slotId = `${day}:${time}`;
                            
                            return (
                                <DroppableSlot key={slotId} id={slotId} day={day} time={time} span={span}>
                                    {subject && (
                                        <DraggableSubject 
                                            id={`grid-${subject._id}-${day}-${time}`} 
                                            subject={subject} 
                                            isInGrid={true}
                                            day={day}
                                            time={time}
                                        />
                                    )}
                                </DroppableSlot>
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
};

export default TimetableGrid;
