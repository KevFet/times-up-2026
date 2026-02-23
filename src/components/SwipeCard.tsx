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
    const rotate = useTransform(x, [-200, 200], [-10, 10]);
    const opacity = useTransform(x, [-300, -200, 0, 200, 300], [0, 1, 1, 1, 0]);
    const scale = useTransform(x, [-200, 0, 200], [0.95, 1, 0.95]);

    const background = useTransform(
        x,
        [-150, 0, 150],
        [
            canSkip ? 'rgba(255, 0, 0, 0.15)' : 'rgba(18, 18, 18, 1)',
            'rgba(18, 18, 18, 1)',
            'rgba(255, 255, 255, 0.1)'
        ]
    );

    const controls = useAnimation();

    const handleDragEnd = async (_: any, info: any) => {
        if (info.offset.x > 120) {
            await controls.start({ x: 500, opacity: 0, transition: { duration: 0.2, ease: "easeIn" } });
            onSwipeRight();
            controls.set({ x: 0, opacity: 0, scale: 0.8 });
            controls.start({ opacity: 1, scale: 1 });
        } else if (info.offset.x < -120 && canSkip) {
            await controls.start({ x: -500, opacity: 0, transition: { duration: 0.2, ease: "easeIn" } });
            onSwipeLeft?.();
            controls.set({ x: 0, opacity: 0, scale: 0.8 });
            controls.start({ opacity: 1, scale: 1 });
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
            className="flex flex-col items-center justify-center p-8 text-center"
            style={{
                x,
                rotate,
                opacity,
                scale,
                background,
                position: 'absolute',
                inset: 0,
                cursor: 'grab',
                userSelect: 'none',
                touchAction: 'none',
                borderRadius: '24px',
                border: '1px solid #222222',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
            }}
        >
            <div className="absolute top-8 inset-x-0 flex justify-center gap-24 pointer-events-none">
                <motion.div style={{ opacity: useTransform(x, [-80, -20], [1, 0]) }}>
                    <X size={40} color="#FF0000" />
                </motion.div>
                <motion.div style={{ opacity: useTransform(x, [20, 80], [0, 1]) }}>
                    <Check size={40} color="#FFFFFF" />
                </motion.div>
            </div>

            <h3 className="text-5xl font-black text-white tracking-tight leading-tight uppercase font-style-italic italic">
                {name}
            </h3>

            <div className="absolute bottom-12 flex flex-col items-center gap-3 opacity-20">
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                    Slide to Validate
                </span>
            </div>
        </motion.div>
    );
};
