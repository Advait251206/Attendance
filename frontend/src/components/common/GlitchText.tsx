import React from 'react';
import clsx from 'clsx';

interface GlitchTextProps {
    text: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const GlitchText: React.FC<GlitchTextProps> = ({ text, className, size = 'lg' }) => {
    const sizeClasses = {
        sm: 'text-lg',
        md: 'text-2xl',
        lg: 'text-4xl',
        xl: 'text-6xl',
    };

    return (
        <div className={clsx('relative inline-block font-display font-bold uppercase tracking-widest group', sizeClasses[size], className)}>
            <span className="relative z-10">{text}</span>
            <span className="absolute top-0 left-0 -z-10 w-full h-full text-primary opacity-0 group-hover:opacity-70 group-hover:animate-glitch translate-x-[2px]">
                {text}
            </span>
            <span className="absolute top-0 left-0 -z-10 w-full h-full text-secondary opacity-0 group-hover:opacity-70 group-hover:animate-glitch translate-x-[-2px] animation-delay-100">
                {text}
            </span>
        </div>
    );
};

export default GlitchText;
