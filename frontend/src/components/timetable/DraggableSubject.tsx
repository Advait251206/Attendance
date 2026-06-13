import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';
import { GripVertical } from 'lucide-react';

interface DraggableSubjectProps {
    id: string; 
    subject: any;
    isInGrid?: boolean;
    day?: string;
    time?: string;
}

const DraggableSubject: React.FC<DraggableSubjectProps> = ({ id, subject, isInGrid, day, time }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id,
        data: { subject, origin: isInGrid ? 'grid' : 'palette', day, time }
    });

    const style = {
        transform: CSS.Translate.toString(transform),
    };

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={clsx(
                "flex items-center gap-2 cursor-grab active:cursor-grabbing border transition-shadow",
                isInGrid ? "rounded-lg" : "rounded-lg",
                isDragging ? "opacity-50 z-50 shadow-xl scale-105" : "opacity-100",
                isInGrid 
                    ? "w-full h-full justify-center shadow-none hover:bg-white/5 hover:border-white/20" 
                    : "w-full p-3 mb-2 shadow-md hover:translate-x-1"
            )}
            // Dynamic Coloring
                style={{ 
                    ...style,
                    backgroundColor: (() => {
                        if (subject.name.match(/break|recess|lunch/i)) return 'rgba(255,255,255,0.05)';
                    switch(subject.color) {
                        case 'cyan': return 'rgba(0,243,255,0.15)';
                        case 'purple': return 'rgba(188,19,254,0.15)';
                        case 'red': return 'rgba(255,0,60,0.15)';
                        case 'green': return 'rgba(50,255,50,0.15)'; // Lime Green
                        case 'yellow': return 'rgba(255,255,0,0.15)';
                        case 'orange': return 'rgba(255,165,0,0.15)';
                        case 'blue': return 'rgba(45,45,255,0.15)';
                        case 'gray': return 'rgba(107, 114, 128, 0.2)';
                        default: return 'rgba(45,45,255,0.15)';
                    }
                })(),
                borderColor: (() => {
                    if (subject.name.match(/break|recess|lunch/i)) return 'rgba(255,255,255,0.2)';
                    switch(subject.color) {
                        case 'cyan': return 'rgba(0,243,255,0.3)';
                        case 'purple': return 'rgba(188,19,254,0.3)';
                        case 'red': return 'rgba(255,0,60,0.3)';
                        case 'green': return 'rgba(50,255,50,0.5)'; // Lime Green
                        case 'yellow': return 'rgba(255,255,0,0.3)';
                        case 'orange': return 'rgba(255,165,0,0.3)';
                        case 'blue': return 'rgba(45,45,255,0.3)';
                        default: return 'rgba(45,45,255,0.3)';
                    }
                })()
            }}
        >
            {!isInGrid && <GripVertical className="w-4 h-4 text-white/30" />}
            <span 
                className={clsx(
                    "font-bold font-display truncate",
                    isInGrid ? "text-[10px] leading-tight" : "text-sm"
                )}
                style={{ 
                    color: (() => {
                        switch(subject.color) {
                            case 'cyan': return 'rgb(0,243,255)';
                            case 'purple': return 'rgb(188,19,254)';
                            case 'red': return 'rgb(255,0,60)';
                            case 'green': return 'rgb(50,255,50)';
                            case 'yellow': return 'rgb(255,255,0)';
                            case 'orange': return 'rgb(255,165,0)';
                            case 'blue': return 'rgb(80,80,255)';
                            default: return subject.color; // Fallback
                        }
                    })()
                }}
            >
                 {subject.name.match(/break|recess|lunch/i) ? subject.name.toUpperCase() : subject.name}
            </span>
        </div>
    );
};

export default DraggableSubject;
