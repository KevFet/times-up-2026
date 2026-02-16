import React from 'react';
import { motion } from 'framer-motion';

interface NeonTimerProps {
    timeLeft: number;
    totalTime: number;
}

export const NeonTimer: React.FC<NeonTimerProps> = ({ timeLeft, totalTime }) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (timeLeft / totalTime) * circumference;

    return (
        <div className="relative flex items-center justify-center w-32 h-32">
            <svg className="w-full h-full transform -rotate-90">
                {/* Background Circle */}
                <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeWidth="6"
                    fill="transparent"
                />
                {/* Active Circle */}
                <motion.circle
                    cx="64"
                    cy="64"
                    r={radius}
                    stroke="var(--accent-primary)"
                    strokeWidth="6"
                    strokeDasharray={circumference}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1, ease: "linear" }}
                    strokeLinecap="round"
                    fill="transparent"
                    className="timer-ring"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white tabular-nums">
                    {timeLeft}
                </span>
                <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">SEC</span>
            </div>
        </div>
    );
};
