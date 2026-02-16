import React from 'react';
import { motion } from 'framer-motion';

interface NeonTimerProps {
    timeLeft: number;
    totalTime: number;
}

export const NeonTimer: React.FC<NeonTimerProps> = ({ timeLeft, totalTime }) => {
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (timeLeft / totalTime) * circumference;

    return (
        <div className="relative flex items-center justify-center w-48 h-48">
            {/* Pulsing Ambient Glow */}
            <motion.div
                animate={{
                    scale: timeLeft < 10 ? [1, 1.1, 1] : 1,
                    opacity: timeLeft < 10 ? [0.2, 0.4, 0.2] : 0.2
                }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-accent-primary blur-3xl"
            />

            <svg className="w-full h-full transform -rotate-90 relative z-10">
                {/* Track */}
                <circle
                    cx="50%"
                    cy="50%"
                    r={radius}
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="8"
                    fill="transparent"
                />

                {/* Progress Ring */}
                <motion.circle
                    cx="50%"
                    cy="50%"
                    r={radius}
                    stroke="var(--accent-primary)"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1, ease: "linear" }}
                    strokeLinecap="round"
                    fill="transparent"
                    className="timer-glow"
                />
            </svg>

            {/* Time Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                <span className={`text-6xl font-black tabular-nums tracking-tighter ${timeLeft < 10 ? 'text-accent-primary' : 'text-white'}`}>
                    {timeLeft}
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">
                    Seconds
                </span>
            </div>
        </div>
    );
};
