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
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="glass-panel w-full max-w-lg p-8 relative z-10 border-white/20"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-white/60 hover:text-white"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-3xl font-bold mb-6 text-accent-primary">{t('rules')}</h2>

                        <div className="space-y-6 text-white/90 leading-relaxed overflow-y-auto max-h-[60vh] pr-4">
                            <section>
                                <h3 className="text-xl font-semibold mb-2 text-white">{t('phase1_title')}</h3>
                                <p>Pas de limite de mots, décrivez la célébrité. Pas de skip autorisé.</p>
                            </section>

                            <section>
                                <h3 className="text-xl font-semibold mb-2 text-white">{t('phase2_title')}</h3>
                                <p>Un seul mot par carte. Une seule proposition par équipe. Skip autorisé.</p>
                            </section>

                            <section>
                                <h3 className="text-xl font-semibold mb-2 text-white">{t('phase3_title')}</h3>
                                <p>Mimes et bruitages uniquement. Une seule proposition par équipe. Skip autorisé.</p>
                            </section>

                            <div className="pt-4 border-t border-white/10">
                                <p className="text-sm text-white/40 italic">
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
