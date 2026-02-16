import React from 'react';
import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface SwipeCardProps {
    name: string;
    onSwipeRight: () => void;
    onSwipeLeft?: () => void;
    canSkip: boolean;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({ name, onSwipeRight, onSwipeLeft, canSkip }) => {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-15, 15]);
    const opacity = useTransform(x, [-250, -150, 0, 150, 250], [0, 1, 1, 1, 0]);
    const scale = useTransform(x, [-200, 0, 200], [0.8, 1, 0.8]);

    const background = useTransform(
        x,
        [-150, 0, 150],
        [
            canSkip ? 'rgba(255, 45, 85, 0.4)' : 'rgba(13, 17, 23, 1)',
            'rgba(13, 17, 23, 1)',
            'rgba(52, 199, 89, 0.4)'
        ]
    );

    const controls = useAnimation();

    const handleDragEnd = async (_: any, info: any) => {
        if (info.offset.x > 140) {
            await controls.start({ x: 500, opacity: 0, transition: { duration: 0.3 } });
            onSwipeRight();
        } else if (info.offset.x < -140 && canSkip) {
            await controls.start({ x: -500, opacity: 0, transition: { duration: 0.3 } });
            onSwipeLeft?.();
        } else {
            controls.start({ x: 0, opacity: 1, scale: 1 });
        }
    };

    return (
        <motion.div
            drag="x"
            dragConstraints={{ left: canSkip ? -1000 : 0, right: 1000 }}
            animate={controls}
            onDragEnd={handleDragEnd}
            className="swipe-card shadow-2xl border-white/5"
            style={{
                ...style,
                x, rotate, opacity, background, scale,
                border: '1px solid rgba(255,255,255,0.05)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
        >
            <div className="absolute top-10 flex justify-center w-full gap-20 pointer-events-none opacity-20">
                <motion.div style={{ opacity: useTransform(x, [-100, 0], [1, 0]) }}>
                    <X size={32} className="text-accent-primary" />
                </motion.div>
                <motion.div style={{ opacity: useTransform(x, [0, 100], [0, 1]) }}>
                    <Check size={32} className="text-accent-success" />
                </motion.div>
            </div>

            <h3 className="text-5xl font-black text-center text-white tracking-tighter px-6 leading-[1.1]">
                {name}
            </h3>

            <div className="absolute bottom-12 flex flex-col items-center gap-2">
                <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-accent-primary"
                        style={{ width: useTransform(x, [-150, 0, 150], ['100%', '0%', '100%']) }}
                    />
                </div>
                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
                    {canSkip ? 'Swipe to decide' : 'Swipe to validate'}
                </span>
            </div>
        </motion.div>
    );
};

const style = {
    position: 'absolute' as const,
    width: '100%' as const,
    height: '100%' as const,
    borderRadius: '40px',
    display: 'flex' as const,
    flexDirection: 'column' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: '32px',
    cursor: 'grab' as const,
    userSelect: 'none' as const,
};
