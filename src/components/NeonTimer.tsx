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
            <svg className="w-full h-full transform -rotate-90 relative z-10">
                {/* Track */}
                <circle
                    cx="50%"
                    cy="50%"
                    r={radius}
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="4"
                    fill="transparent"
                />

                {/* Progress Ring */}
                <motion.circle
                    cx="50%"
                    cy="50%"
                    r={radius}
                    stroke={timeLeft < 10 ? "#FF0000" : "#FFFFFF"}
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1, ease: "linear" }}
                    strokeLinecap="round"
                    fill="transparent"
                    style={{
                        filter: timeLeft < 10 ? 'drop-shadow(0 0 8px #FF0000)' : 'none'
                    }}
                />
            </svg>

            {/* Time Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                <span className={`text-6xl font-black tabular-nums tracking-tighter italic ${timeLeft < 10 ? 'text-[#FF0000]' : 'text-white'}`}>
                    {timeLeft}
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-20">
                    SEC
                </span>
            </div>
        </div>
    );
};
