import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Trophy, MessageCircle, Mic } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface RulesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();

    const sections = [
        { icon: <MessageCircle className="text-accent-primary" />, title: 'Phase 1', desc: t('phase1_rules') },
        { icon: <Zap className="text-accent-secondary" />, title: 'Phase 2', desc: t('phase2_rules') },
        { icon: <Mic className="text-accent-success" />, title: 'Phase 3', desc: t('phase3_rules') }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-xl"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="card-main w-full max-w-xl z-10 px-8 py-12 flex flex-col items-center"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <div className="w-12 h-12 rounded-full bg-accent-primary/20 flex items-center justify-center mb-6">
                            <Trophy size={24} className="text-accent-primary fill-accent-primary" />
                        </div>

                        <h2 className="text-4xl font-black tracking-tighter mb-12">THE ARENA RULES</h2>

                        <div className="space-y-8 w-full">
                            {sections.map((s, idx) => (
                                <div key={idx} className="flex gap-6 items-start">
                                    <div className="shrink-0 w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center">
                                        {s.icon}
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-black text-xs uppercase tracking-widest opacity-40">{s.title}</h4>
                                        <p className="text-white text-base font-medium leading-relaxed">{s.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={onClose}
                            className="btn-premium w-full mt-12 bg-white text-black"
                        >
                            GOT IT
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
