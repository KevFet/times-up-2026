import React from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RulesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 30 }}
                        className="bg-[#0d1117] border border-white/10 w-full max-w-lg p-10 relative z-10 rounded-[40px] shadow-2xl"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-full bg-white/5 text-white/40 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="mb-8">
                            <span className="text-xs font-black text-accent-primary uppercase tracking-[0.5em] mb-2 block">Instructions</span>
                            <h2 className="text-4xl font-black text-white">{t('rules')}</h2>
                        </div>

                        <div className="space-y-8 text-white/60 leading-relaxed overflow-y-auto max-h-[60vh] pr-4 custom-scrollbar">
                            <section className="bg-white/5 p-6 rounded-3xl border border-white/5">
                                <h3 className="text-lg font-black mb-2 text-white uppercase tracking-wider">{t('phase1_title')}</h3>
                                <p className="text-sm font-medium">Pas de limite de mots, décrivez la célébrité. Pas de skip autorisé.</p>
                            </section>

                            <section className="bg-white/5 p-6 rounded-3xl border border-white/5">
                                <h3 className="text-lg font-black mb-2 text-white uppercase tracking-wider">{t('phase2_title')}</h3>
                                <p className="text-sm font-medium">Un seul mot par carte. Une seule proposition par équipe. Skip autorisé.</p>
                            </section>

                            <section className="bg-white/5 p-6 rounded-3xl border border-white/5">
                                <h3 className="text-lg font-black mb-2 text-white uppercase tracking-wider">{t('phase3_title')}</h3>
                                <p className="text-sm font-medium">Mimes et bruitages uniquement. Une seule proposition par équipe. Skip autorisé.</p>
                            </section>

                            <div className="pt-4">
                                <p className="text-xs text-white/30 font-medium italic">
                                    Toutes les phases utilisent les mêmes 40 cartes. Une fois toutes les cartes trouvées, on passe à la phase suivante.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
