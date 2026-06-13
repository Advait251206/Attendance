import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { glowButtonVariants } from '../../utils/animations';

interface CyberButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    children: React.ReactNode;
    icon?: React.ElementType;
}

const CyberButton: React.FC<CyberButtonProps> = ({ variant = 'primary', children, icon: Icon, className, ...props }) => {
    const variants = {
        primary: 'bg-primary/20 text-primary border border-primary/50 hover:bg-primary/30',
        secondary: 'bg-secondary/20 text-secondary border border-secondary/50 hover:bg-secondary/30',
        danger: 'bg-danger/20 text-danger border border-danger/50 hover:bg-danger/30',
        ghost: 'bg-transparent text-gray-400 hover:text-white border border-transparent hover:border-white/20',
    };

    return (
        <motion.button
            variants={glowButtonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            className={clsx(
                'relative px-6 py-2 rounded-lg font-mono font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 overflow-hidden',
                variants[variant],
                className
            )}
            {...props}
        >
            {/* Background Scan effect */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:animate-[shimmer_1s_infinite]" />

            {Icon && <Icon className="w-4 h-4" />}
            <span className="relative z-10">{children}</span>
        </motion.button>
    );
};

export default CyberButton;
