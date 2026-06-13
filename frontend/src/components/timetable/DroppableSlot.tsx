import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import clsx from 'clsx';

interface DroppableSlotProps {
    id: string; // "Monday:09:00"
    day: string;
    time: string;
    children?: React.ReactNode;
    span?: number;
    className?: string;
}

const DroppableSlot: React.FC<DroppableSlotProps> = ({ id, day, time, children, span = 1, className }) => {
    const { setNodeRef, isOver } = useDroppable({
        id,
        data: { day, time }
    });

    return (
        <div
            ref={setNodeRef}
            className={clsx(
                "relative p-1 border-r border-b border-white/5 min-h-[80px] transition-colors",
                isOver ? "bg-primary/20" : "hover:bg-white/5",
                span > 1 ? `col-span-${span}` : "",
                className
            )}
            style={{ gridColumn: span > 1 ? `span ${span} / span ${span}` : undefined }}
        >
            {children ? (
                children
            ) : (
                <div className="w-full h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-white/10 text-xl font-mono">+</span>
                </div>
            )}
        </div>
    );
};

export default DroppableSlot;
