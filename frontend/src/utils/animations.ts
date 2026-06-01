import type { Variants } from 'framer-motion';

export const pageVariants: Variants = {
    initial: { opacity: 0, y: 20, scale: 0.98 },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.4, ease: "circOut" }
    },
    exit: {
        opacity: 0,
        y: -20,
        filter: 'blur(10px)',
        transition: { duration: 0.3, ease: "easeIn" }
    }
};

export const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

export const itemVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { type: "spring", stiffness: 100 }
    }
};

export const hoverScale: Variants = {
    initial: { scale: 1 },
    hover: {
        scale: 1.02,
        boxShadow: "0 0 15px rgba(0, 243, 255, 0.3)",
        borderColor: "rgba(0, 243, 255, 0.6)",
        transition: { duration: 0.2 }
    },
    tap: { scale: 0.98 }
};

export const glowButtonVariants: Variants = {
    initial: { scale: 1, boxShadow: "0 0 0px rgba(0,0,0,0)" },
    hover: {
        scale: 1.05,
        boxShadow: "0 0 20px rgba(188, 19, 254, 0.6)",
        textShadow: "0 0 8px rgb(255,255,255)",
        transition: { repeat: Infinity, repeatType: "reverse", duration: 1.5 }
    },
    tap: { scale: 0.95 }
};
