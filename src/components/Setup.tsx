import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, RefreshCw, CheckCircle2 } from 'lucide-react';

interface SetupProps {
    gameId: string;
    onComplete: () => void;
}

const Setup: React.FC<SetupProps> = ({ gameId, onComplete }) => {
    const { i18n } = useTranslation();
    const [cards, setCards] = useState<any[]>([]);
    const [discardedCount, setDiscardedCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchCards = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('cards')
            .select('*')
            .limit(200);

        if (data) {
            const shuffled = [...data].sort(() => 0.5 - Math.random());
            setCards(shuffled.slice(0, 44).map(c => ({ ...c, discarded: false })));
        }
        setDiscardedCount(0);
        setLoading(false);
    };

    useEffect(() => {
        fetchCards();
    }, []);

    const toggleDiscard = (id: string) => {
        setCards(prev => prev.map(c => {
            if (c.id === id) {
                if (!c.discarded && discardedCount >= 4) return c;
                const newDiscarded = !c.discarded;
                setDiscardedCount(prevCount => newDiscarded ? prevCount + 1 : prevCount - 1);
                return { ...c, discarded: newDiscarded };
            }
            return c;
        }));
    };

    const start = async () => {
        if (discardedCount === 4) {
            const finalCards = cards.filter(c => !c.discarded);
            const gameCards = finalCards.map(c => ({
                game_id: gameId,
                card_id: c.id,
                status: 'deck'
            }));

            await supabase.from('game_cards').insert(gameCards);
            onComplete();
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-6">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-t-4 border-r-4 border-accent-primary rounded-full shadow-[0_0_30px_rgba(255,45,85,0.4)]"
                />
                <span className="text-white/40 font-black uppercase tracking-[0.5em] text-xs">Generating Deck...</span>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center px-4">
            <div className="text-center mb-10">
                <span className="text-xs font-black text-accent-primary uppercase tracking-[0.5em] mb-3 block">Deck Selection</span>
                <h2 className="text-5xl font-black text-white mb-3 tracking-tighter">Discard your cards</h2>
                <p className="text-white/40 font-medium text-lg">Tap on 4 celebrities you don't want to play with.</p>
            </div>

            <div className="w-full bg-[#0d1117] border border-white/5 rounded-[40px] p-8 mb-8 shadow-2xl relative overflow-hidden">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[55vh] overflow-y-auto pr-2 custom-scrollbar">
                    <AnimatePresence>
                        {cards.map((card, idx) => (
                            <motion.button
                                key={card.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.01 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => toggleDiscard(card.id)}
                                className={`group relative p-6 rounded-[24px] border-2 transition-all duration-300 flex flex-col items-center justify-center gap-3 text-center min-h-[140px] ${card.discarded
                                        ? 'bg-accent-primary border-accent-primary shadow-[0_0_20px_rgba(255,45,85,0.4)]'
                                        : 'bg-[#161b22] border-white/5 hover:border-white/20'
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${card.discarded ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'
                                    }`}>
                                    {card.discarded ? <Trash2 size={18} className="text-white" /> : <RefreshCw size={18} className="text-white/20 group-hover:text-white/40 transition-colors" />}
                                </div>
                                <span className={`text-sm font-black uppercase tracking-wider leading-tight ${card.discarded ? 'text-white' : 'text-white/80'
                                    }`}>
                                    {card[`name_${i18n.language}`] || card.name_en}
                                </span>

                                {card.discarded && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute top-3 right-3"
                                    >
                                        <CheckCircle2 size={16} className="text-white/60" />
                                    </motion.div>
                                )}
                            </motion.button>
                        ))}
                    </AnimatePresence>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0d1117] to-transparent pointer-events-none" />
            </div>

            <div className="w-full max-w-md flex flex-col items-center gap-8">
                <div className="flex items-center gap-4 py-4 px-8 rounded-full bg-white/5 border border-white/5 backdrop-blur-md">
                    <div className={`w-3 h-3 rounded-full ${discardedCount === 4 ? 'bg-accent-success animate-pulse shadow-[0_0_10px_#34c759]' : 'bg-white/10'}`} />
                    <p className={`text-sm font-black tracking-[0.3em] ${discardedCount === 4 ? 'text-accent-success' : 'text-white/40'}`}>
                        {discardedCount} / 4 DISCARDED
                    </p>
                </div>

                <button
                    disabled={discardedCount !== 4}
                    onClick={start}
                    className={`btn-primary w-full shadow-[0_20px_40px_rgba(255,45,85,0.3)] transition-all duration-500 py-6 text-xl tracking-tighter ${discardedCount !== 4 ? 'opacity-20 pointer-events-none grayscale scale-95' : 'hover:scale-105 active:scale-95'
                        }`}
                >
                    ENTER THE ARENA
                </button>
            </div>
        </div>
    );
};

export default Setup;
