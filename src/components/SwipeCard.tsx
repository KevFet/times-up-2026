import React from 'react';
import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface SwipeCardProps {
    name: string;
    onSwipeRight: () => void;
    onSwipeLeft?: () => void; // For skipping (Phases 2 & 3)
    canSkip: boolean;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({ name, onSwipeRight, onSwipeLeft, canSkip }) => {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-25, 25]);
    const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
    const background = useTransform(
        x,
        [-100, 0, 100],
        [
            canSkip ? 'rgba(255, 0, 85, 0.2)' : 'rgba(255, 255, 255, 0.08)',
            'rgba(255, 255, 255, 0.08)',
            'rgba(0, 255, 136, 0.2)'
        ]
    );

    const controls = useAnimation();

    const handleDragEnd = async (_: any, info: any) => {
        if (info.offset.x > 100) {
            await controls.start({ x: 500, opacity: 0 });
            onSwipeRight();
        } else if (info.offset.x < -100 && canSkip) {
            await controls.start({ x: -500, opacity: 0 });
            onSwipeLeft?.();
        } else {
            controls.start({ x: 0, opacity: 1 });
        }
    };

    return (
        <motion.div
            drag={canSkip ? "x" : "x"} // Phase 1 still has subtle resistance
            dragConstraints={{ left: canSkip ? -1000 : 0, right: 1000 }}
            style={{ x, rotate, opacity, background }}
            animate={controls}
            onDragEnd={handleDragEnd}
            className="swipe-card shadow-2xl"
        >
            <div className="absolute top-6 left-6 right-6 flex justify-between opacity-40">
                {canSkip && <X size={24} className="text-accent-danger" />}
                <Check size={24} className="text-accent-success" />
            </div>

            <h3 className="text-4xl font-black text-center text-white tracking-tight px-4 break-words">
                {name}
            </h3>

            <div className="absolute bottom-8 text-white/20 font-bold uppercase tracking-[0.2em] text-[10px] flex items-center gap-2">
                {canSkip ? (
                    <>
                        <X size={12} /> SWIPE LEFT TO SKIP | SWIPE RIGHT TO VALIDATE <Check size={12} />
                    </>
                ) : (
                    <>
                        SWIPE RIGHT TO VALIDATE <Check size={12} />
                    </>
                )}
            </div>
        </motion.div>
    );
};
