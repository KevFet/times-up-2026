import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Zap, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LobbyProps {
    onGameCreated: (gameId: string) => void;
    onJoinGame: (gameId: string) => void;
}

const Lobby: React.FC<LobbyProps> = ({ onGameCreated, onJoinGame }) => {
    const { t } = useTranslation();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);

    const createGame = async () => {
        setLoading(true);
        const gameCode = Math.random().toString(36).substring(2, 6).toUpperCase();

        const { data: game, error: gameError } = await supabase
            .from('games')
            .insert([{
                code: gameCode,
                status: 'playing',
                current_team: 1,
                scores: { team1: 0, team2: 0 },
                settings: { auto_picked: true }
            }])
            .select()
            .single();

        if (gameError || !game) {
            setLoading(false);
            return;
        }

        const { data: allCards } = await supabase.from('cards').select('*');
        if (allCards && allCards.length > 0) {
            const shuffled = [...allCards].sort(() => 0.5 - Math.random());
            const selectedCards = shuffled.slice(0, 40);
            const gameCards = selectedCards.map(c => ({
                game_id: game.id, card_id: c.id, status: 'deck'
            }));
            await supabase.from('game_cards').insert(gameCards);
        }

        onGameCreated(game.id);
        setLoading(false);
    };

    const joinGame = async () => {
        if (!code) return;
        setLoading(true);
        const { data } = await supabase
            .from('games')
            .select('*')
            .eq('code', code.toUpperCase())
            .single();

        if (data) onJoinGame(data.id);
        setLoading(false);
    };

    return (
        <div className="flex-1 flex flex-col justify-center items-center w-full min-h-screen px-4 py-8 relative bg-transparent overflow-hidden">
            {/* Native 2026 Liquid Background Pattern from index.css */}
            <div className="mesh-bg" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                className="w-full max-w-[360px] space-y-10 relative z-10 flex flex-col items-center"
            >
                {/* Brand / Header */}
                <div className="flex flex-col items-center text-center space-y-5">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="btn-ghost flex items-center justify-center gap-2 px-4 py-2 rounded-full shadow-[0_0_15px_rgba(255,59,48,0.2)]"
                        style={{ padding: '6px 16px', borderRadius: '100px' }}
                    >
                        <Zap size={14} className="text-accent-primary" style={{ filter: 'drop-shadow(0 0 10px rgba(255, 45, 85, 0.5))' }} />
                        <span className="text-[10px] font-black tracking-[0.2em] text-accent-primary uppercase">
                            {t('edition', '2026 EDITION')}
                        </span>
                    </motion.div>

                    <div className="flex flex-col items-center leading-[0.80] pt-2">
                        <h1 className="text-[64px] font-black italic tracking-tighter logo-text" style={{ fontSize: '72px' }}>
                            TIME'S
                        </h1>
                        <h2 className="text-[72px] font-black italic tracking-tighter text-accent-primary" style={{ filter: 'drop-shadow(0 0 15px rgba(255, 45, 85, 0.4))' }}>
                            UP
                        </h2>
                    </div>
                    <p className="text-white/50 text-[11px] font-bold tracking-widest uppercase">
                        {t('subtitle', 'THE ULTIMATE GUESSING GAME')}
                    </p>
                </div>

                {/* Main Glassmorphism UI Components - Uses global card-main class */}
                <div className="w-full card-main p-8 space-y-7 border border-white/10" style={{ backdropFilter: 'blur(36px)', background: 'rgba(5, 7, 12, 0.6)' }}>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black tracking-[0.2em] text-white/50 uppercase ml-2 block">
                            {t('your_nickname', 'YOUR NICKNAME')}
                        </label>
                        <input
                            type="text"
                            placeholder={t('nickname_placeholder', 'Ex. El Bicho')}
                            className="w-full bg-white/5 border border-white/10 backdrop-blur-md shadow-inner rounded-3xl px-5 py-5 text-[14px] text-white focus:outline-none focus:bg-white/10 focus:border-white/30 placeholder:text-white/20 font-black tracking-wider transition-all duration-300"
                        />
                    </div>

                    <button
                        onClick={createGame}
                        disabled={loading}
                        className="w-full btn-premium flex items-center justify-center py-5 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_35px_rgba(255,255,255,0.3)] duration-500"
                        style={{ padding: '20px 0' }}
                    >
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
                                    <div className="w-6 h-6 border-4 border-black/20 border-t-black rounded-full animate-spin" />
                                </motion.div>
                            ) : (
                                <motion.div key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                                    <Plus size={20} strokeWidth={3} />
                                    {t('create_room', 'CREATE ROOM')}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </button>

                    <div className="flex items-center gap-4 py-2 opacity-50">
                        <div className="h-[2px] flex-1 bg-white/10 rounded-full" />
                        <span className="text-[10px] font-black uppercase text-white/70 tracking-[0.2em]">
                            {t('or_join_one', 'OR JOIN ONE')}
                        </span>
                        <div className="h-[2px] flex-1 bg-white/10 rounded-full" />
                    </div>

                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder={t('code', 'CODE')}
                            className="flex-1 w-[55%] bg-white/5 border border-white/10 backdrop-blur-md shadow-inner rounded-[20px] px-4 py-5 text-[15px] text-center text-white font-black tracking-[0.3em] focus:outline-none focus:bg-white/10 focus:border-white/30 placeholder:text-white/20 uppercase transition-all duration-300"
                        />
                        <button
                            onClick={joinGame}
                            disabled={loading || !code}
                            className="w-[45%] btn-ghost px-0 py-0 flex items-center justify-center gap-2 active:scale-[0.97] transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none hover:bg-white/10 border border-white/20 rounded-[20px]"
                            style={{ padding: 0 }}
                        >
                            <Play size={12} className="fill-white" /> {t('join', 'JOIN')}
                        </button>
                    </div>
                </div>

                <div className="pt-2 text-center opacity-30">
                    <p className="text-[10px] font-black tracking-[0.3em] uppercase text-white">
                        {t('made_with', 'MADE WITH PASSION 🔥')}
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Lobby;
