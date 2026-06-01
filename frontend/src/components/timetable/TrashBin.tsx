import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Trash2 } from 'lucide-react';
import clsx from 'clsx';

const TrashBin: React.FC = () => {
    const { setNodeRef, isOver } = useDroppable({
        id: 'trash',
        data: { type: 'trash' }
    });

    return (
        <div 
            ref={setNodeRef}
            className={clsx(
                "w-full h-24 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all duration-300 gap-2 mt-4",
                isOver 
                    ? "border-red-500 bg-red-500/20 text-red-500 scale-105 shadow-[0_0_20px_rgba(255,0,0,0.3)]" 
                    : "border-white/10 bg-black/20 text-gray-500 hover:border-red-500/50 hover:text-red-500/50"
            )}
        >
            <Trash2 className={clsx("w-8 h-8", isOver && "animate-bounce")} />
            <span className="text-xs font-mono font-bold tracking-widest">
                {isOver ? "RELEASE TO DELETE" : "DROP HERE TO REMOVE"}
            </span>
        </div>
    );
};

export default TrashBin;
