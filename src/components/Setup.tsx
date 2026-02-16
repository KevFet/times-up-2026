import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';

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

    if (loading) return <div className="text-white">Loading stars...</div>;

    return (
        <div className="w-full max-w-2xl flex flex-col items-center">
            <h2 className="text-4xl font-bold mb-2 text-white">{t('setup_title')}</h2>
            <p className="text-white/60 mb-8 text-center">{t('discard_instructions')}</p>

            <div className="glass-panel w-full p-6 mb-8 max-h-[50vh] overflow-y-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {cards.map((card) => (
                        <motion.button
                            key={card.id}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toggleDiscard(card.id)}
                            className={`p-4 rounded-xl border text-sm transition-all flex justify-between items-center ${card.discarded
                                    ? 'bg-accent-danger/20 border-accent-danger/50 text-accent-danger/80'
                                    : 'bg-white/5 border-white/10 text-white'
                                }`}
                        >
                            <span className="truncate">{card[`name_${i18n.language}`] || card.name_en}</span>
                            {card.discarded ? <Trash2 size={14} /> : null}
                        </motion.button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col items-center gap-4">
                <p className={`text-lg font-mono ${discardedCount === 4 ? 'text-accent-success' : 'text-white/40'}`}>
                    {discardedCount} / 4 DISCARDED
                </p>

                <button
                    disabled={discardedCount !== 4}
                    onClick={start}
                    className={`neon-button px-12 py-3 rounded-xl transition-all ${discardedCount === 4 ? 'primary' : 'opacity-30 pointer-events-none'
                        }`}
                >
                    {t('start_game')}
                </button>
            </div>
        </div>
    );
};

export default Setup;
