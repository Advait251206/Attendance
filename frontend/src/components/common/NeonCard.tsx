import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { itemVariants } from '../../utils/animations';

interface NeonCardProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    glowColor?: 'cyan' | 'purple' | 'red' | 'blue' | 'yellow';
    onClick?: () => void;
}

const NeonCard: React.FC<NeonCardProps> = ({ children, className, delay = 0, glowColor = 'cyan', onClick }) => {
    const glowClasses = {
        cyan: 'hover:shadow-neon-cyan hover:border-primary/50',
        purple: 'hover:shadow-neon-purple hover:border-secondary/50',
        red: 'hover:shadow-neon-red hover:border-danger/50',
        blue: 'hover:shadow-[0_0_10px_rgba(45,45,255,0.5)] hover:border-accent/50',
        yellow: 'hover:shadow-[0_0_10px_rgba(252,238,10,0.5)] hover:border-warning/50',
    };

    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.01, y: -2 }}
            onClick={onClick}
            data-mate-ledge="true" // Tag for Miku to detect
            className={clsx(
                'glass-card p-6 rounded-2xl border border-white/5 transition-all duration-300 relative overflow-hidden group',
                glowClasses[glowColor],
                onClick && 'cursor-pointer',
                className
            )}
        >
            {/* Corner Accents */}
            <div className={clsx("absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 transition-colors duration-300 opacity-60 group-hover:opacity-100",
                glowColor === 'cyan' ? 'border-primary' : glowColor === 'purple' ? 'border-secondary' : glowColor === 'red' ? 'border-danger' : glowColor === 'yellow' ? 'border-warning' : 'border-accent')} />
            <div className={clsx("absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 transition-colors duration-300 opacity-60 group-hover:opacity-100",
                glowColor === 'cyan' ? 'border-primary' : glowColor === 'purple' ? 'border-secondary' : glowColor === 'red' ? 'border-danger' : glowColor === 'yellow' ? 'border-warning' : 'border-accent')} />
            <div className={clsx("absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 transition-colors duration-300 opacity-60 group-hover:opacity-100",
                glowColor === 'cyan' ? 'border-primary' : glowColor === 'purple' ? 'border-secondary' : glowColor === 'red' ? 'border-danger' : glowColor === 'yellow' ? 'border-warning' : 'border-accent')} />
            <div className={clsx("absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 transition-colors duration-300 opacity-60 group-hover:opacity-100",
                glowColor === 'cyan' ? 'border-primary' : glowColor === 'purple' ? 'border-secondary' : glowColor === 'red' ? 'border-danger' : glowColor === 'yellow' ? 'border-warning' : 'border-accent')} />

            {children}
        </motion.div>
    );
};

export default NeonCard;
