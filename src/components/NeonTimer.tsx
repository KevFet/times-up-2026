import React from 'react';
import { motion } from 'framer-motion';

interface NeonTimerProps {
    timeLeft: number;
    totalTime: number;
}

export const NeonTimer: React.FC<NeonTimerProps> = ({ timeLeft, totalTime }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (timeLeft / totalTime) * circumference;

    return (
        <div className="relative flex items-center justify-center w-40 h-40">
            {/* Outer Glow */}
            <div className={`absolute inset-0 rounded-full blur-2xl transition-opacity duration-500 ${timeLeft < 10 ? 'bg-accent-primary/20 opacity-100' : 'bg-accent-primary/5 opacity-50'}`} />

            <svg className="w-full h-full transform -rotate-90 relative z-10">
                <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke="rgba(255, 255, 255, 0.03)"
                    strokeWidth="8"
                    fill="transparent"
                />
                <motion.circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke="var(--accent-primary)"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1, ease: "linear" }}
                    strokeLinecap="round"
                    fill="transparent"
                    className="timer-ring shadow-xl"
                    style={{ filter: 'drop-shadow(0 0 12px var(--accent-primary))' }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                <span className={`text-5xl font-black tabular-nums transition-colors ${timeLeft < 10 ? 'text-accent-primary' : 'text-white'}`}>
                    {timeLeft}
                </span>
                <span className="text-[10px] text-white/30 uppercase tracking-[0.4em] font-black mt-1">SECONDS</span>
            </div>
        </div>
    );
};
