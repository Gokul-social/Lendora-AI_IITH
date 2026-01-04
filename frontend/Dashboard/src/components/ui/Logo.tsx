/**
 * Lendora AI - Logo Component
 * Professional logo with gradient and icon
 */

import { motion } from 'framer-motion';

interface LogoProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showText?: boolean;
    className?: string;
}

export function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16',
    };

    const textSizes = {
        sm: 'text-base',
        md: 'text-xl',
        lg: 'text-2xl',
        xl: 'text-3xl',
    };

    const iconSizes = {
        sm: 'w-5 h-5',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-10 h-10',
    };

    return (
        <motion.div
            className={`flex items-center gap-3 ${className}`}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
            {/* Logo Icon */}
            <div className={`${sizeClasses[size]} relative rounded-xl bg-gradient-to-br from-primary via-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-primary/30 border-2 border-primary/20 overflow-hidden`}>
                <motion.svg
                    className={`${iconSizes[size]} text-white relative z-10`}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* L for Lendora - stylized */}
                    <motion.path
                        d="M6 4V20M6 4H14"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                    />
                    {/* AI symbol - neural network nodes */}
                    <motion.circle
                        cx="16"
                        cy="8"
                        r="1.5"
                        fill="currentColor"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                    />
                    <motion.circle
                        cx="18"
                        cy="12"
                        r="1.5"
                        fill="currentColor"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                    />
                    <motion.circle
                        cx="16"
                        cy="16"
                        r="1.5"
                        fill="currentColor"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
                    />
                    {/* Connection lines */}
                    <motion.path
                        d="M16 8L18 12M18 12L16 16"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.6 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                    />
                </motion.svg>
                {/* Animated glow effect */}
                <motion.div 
                    className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/30 via-white/10 to-transparent"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>

            {/* Logo Text */}
            {showText && (
                <div className="flex flex-col">
                    <h1 className={`${textSizes[size]} font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight`}>
                        Lendora
                    </h1>
                    <p className={`${
                        size === 'sm' ? 'text-[9px]' : 
                        size === 'md' ? 'text-[10px]' : 
                        size === 'lg' ? 'text-[11px]' : 
                        'text-xs'
                    } text-muted-foreground font-medium leading-tight`}>
                        Privacy-First DeFi
                    </p>
                </div>
            )}
        </motion.div>
    );
}

