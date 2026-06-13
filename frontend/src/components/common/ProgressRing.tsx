import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface ProgressRingProps {
    progress: number; // 0 to 100
    size?: number;
    strokeWidth?: number;
    color?: 'cyan' | 'purple' | 'red' | 'yellow' | 'blue';
    showLabel?: boolean;
}

const ProgressRing: React.FC<ProgressRingProps> = ({
    progress,
    size = 120,
    strokeWidth = 8,
    color = 'cyan',
    showLabel = true
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    const colorClasses = {
        cyan: 'stroke-primary drop-shadow-[0_0_8px_rgba(0,243,255,0.6)]',
        purple: 'stroke-secondary drop-shadow-[0_0_8px_rgba(188,19,254,0.6)]',
        red: 'stroke-danger drop-shadow-[0_0_8px_rgba(255,0,60,0.6)]',
        yellow: 'stroke-warning drop-shadow-[0_0_8px_rgba(252,238,10,0.6)]',
        blue: 'stroke-accent drop-shadow-[0_0_8px_rgba(45,45,255,0.6)]',
    };

    const textColors = {
        cyan: 'text-primary',
        purple: 'text-secondary',
        red: 'text-danger',
        yellow: 'text-warning',
        blue: 'text-accent',
    };

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="transform -rotate-90"
            >
                {/* Background Circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    className="text-white/5"
                />
                {/* Foreground Circle */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeLinecap="round"
                    className={clsx(colorClasses[color])}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                />
            </svg>

            {showLabel && (
                <div className="absolute flex flex-col items-center justify-center">
                    <span className={clsx("text-2xl font-display font-bold", textColors[color])}>
                        {Math.round(progress)}%
                    </span>
                </div>
            )}
        </div>
    );
};

export default ProgressRing;
