import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { Trash2, AlertCircle } from 'lucide-react';

interface SetupProps {
    gameId: string;
    onComplete: () => void;
}

const Setup: React.FC<SetupProps> = ({ gameId, onComplete }) => {
    const { t, i18n } = useTranslation();
    const [cards, setCards] = useState<any[]>([]);
    const [discardedCount, setDiscardedCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCards() {
            const { data } = await supabase
                .from('cards')
                .select('*')
                .limit(44);

            if (data) {
                setCards(data.map(c => ({ ...c, discarded: false })));
            }
            setLoading(false);
        }
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
            <div className="flex flex-col items-center justify-center p-20 gap-4">
                <div className="w-12 h-12 border-4 border-accent-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-white/40 font-black uppercase tracking-[0.3em] text-xs">Loading Deck...</span>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
            <div className="text-center mb-10">
                <span className="text-xs font-black text-accent-primary uppercase tracking-[0.5em] mb-2 block">Preparation</span>
                <h2 className="text-4xl font-black text-white mb-2">{t('setup_title')}</h2>
                <p className="text-white/40 font-medium">{t('discard_instructions')}</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[32px] w-full p-8 mb-10 max-h-[50vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {cards.map((card) => (
                        <motion.button
                            key={card.id}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toggleDiscard(card.id)}
                            className={`p-4 rounded-2xl border text-sm font-bold transition-all flex justify-between items-center ${card.discarded
                                ? 'bg-accent-primary/20 border-accent-primary text-white'
                                : 'bg-white/5 border-white/5 text-white/60 hover:border-white/20'
                                }`}
                        >
                            <span className="truncate">{card[`name_${i18n.language}`] || card.name_en}</span>
                            {card.discarded ? <Trash2 size={14} className="flex-shrink-0" /> : null}
                        </motion.button>
                    ))}
                </div>
            </div>

            <div className="w-full flex flex-col items-center gap-6">
                <div className="flex items-center gap-3 py-3 px-6 rounded-full bg-white/5 border border-white/5">
                    <AlertCircle size={16} className={discardedCount === 4 ? 'text-accent-success' : 'text-white/20'} />
                    <p className={`text-sm font-black tracking-widest ${discardedCount === 4 ? 'text-accent-success' : 'text-white/40'}`}>
                        {discardedCount} / 4 DISCARDED
                    </p>
                </div>

                <button
                    disabled={discardedCount !== 4}
                    onClick={start}
                    className={`btn-primary w-full max-w-sm ${discardedCount !== 4 ? 'opacity-20 pointer-events-none grayscale' : ''}`}
                >
                    {t('start_game')}
                </button>
            </div>
        </div>
    );
};

export default Setup;
