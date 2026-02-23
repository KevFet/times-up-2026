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
        <div className="flex-1 flex flex-col justify-center items-center w-full min-h-screen px-4 py-8 relative bg-[#050505] overflow-hidden">
            {/* Deep Ambient Orbs - 2026 Aesthetic */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex justify-center items-center">
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.4, 0.3] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute w-[80vw] h-[80vw] sm:w-[40vw] sm:h-[40vw] bg-accent-primary rounded-full blur-[140px] opacity-30 mix-blend-screen -translate-x-1/4 -translate-y-1/4"
                />
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute w-[70vw] h-[70vw] sm:w-[35vw] sm:h-[35vw] bg-[#5856D6] rounded-full blur-[140px] opacity-20 mix-blend-screen translate-x-1/3 translate-y-1/3"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[340px] space-y-10 relative z-10 flex flex-col items-center"
            >
                {/* Brand / Header */}
                <div className="flex flex-col items-center text-center space-y-5">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1A1111]/80 backdrop-blur-xl border border-accent-primary/30 shadow-[0_0_20px_rgba(255,59,48,0.2)]"
                    >
                        <Zap size={10} className="fill-accent-primary text-accent-primary" />
                        <span className="text-[9px] font-black tracking-[0.2em] text-accent-primary uppercase">
                            {t('edition', '2026 EDITION')}
                        </span>
                    </motion.div>

                    <div className="flex flex-col items-center leading-[0.85]">
                        <h1 className="text-[56px] font-black italic tracking-tighter text-white">
                            TIME'S
                        </h1>
                        <h2 className="text-[64px] font-black italic tracking-tighter text-accent-primary">
                            UP
                        </h2>
                    </div>
                    <p className="text-white/40 text-[11px] font-bold tracking-widest uppercase">
                        {t('subtitle', 'THE ULTIMATE GUESSING GAME')}
                    </p>
                </div>

                {/* Premium Glass Container */}
                <div className="w-full relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-b from-white/10 to-transparent rounded-[32px] blur-[2px] opacity-50" />
                    <div className="space-y-6 bg-[#0F0F11]/80 backdrop-blur-3xl border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.6)] rounded-[32px] p-7 sm:p-8 relative">

                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black tracking-widest text-white/50 uppercase ml-1">
                                {t('your_nickname', 'YOUR NICKNAME')}
                            </h3>
                            <input
                                type="text"
                                placeholder={t('nickname_placeholder', 'Ex. El Bicho')}
                                className="w-full bg-[#18181A] border border-white/5 rounded-2xl px-5 py-4 text-[13px] text-white focus:outline-none focus:bg-[#202022] focus:border-white/20 placeholder:text-white/20 font-black tracking-wider transition-all duration-300"
                            />
                        </div>

                        <button
                            onClick={createGame}
                            disabled={loading}
                            className="w-full relative overflow-hidden bg-white text-black font-black text-[12px] tracking-[0.15em] uppercase rounded-2xl py-4 flex items-center justify-center gap-2 hover:bg-[#F0F0F0] active:scale-[0.97] transition-all duration-300 disabled:opacity-50 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.25)]"
                        >
                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
                                        <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                    </motion.div>
                                ) : (
                                    <motion.div key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                                        <Plus size={16} strokeWidth={3} />
                                        {t('create_room', 'CREATE ROOM')}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>

                        <div className="flex items-center gap-4 py-1">
                            <div className="h-[1px] flex-1 bg-white/5" />
                            <span className="text-[9px] font-black uppercase text-white/30 tracking-widest">
                                {t('or_join_one', 'OR JOIN')}
                            </span>
                            <div className="h-[1px] flex-1 bg-white/5" />
                        </div>

                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                placeholder={t('code', 'CODE')}
                                className="flex-1 w-[55%] bg-[#18181A] border border-white/5 rounded-2xl px-4 py-4 text-[13px] text-center text-white font-black tracking-[0.2em] focus:outline-none focus:bg-[#202022] focus:border-white/20 placeholder:text-white/20 uppercase transition-all duration-300"
                            />
                            <button
                                onClick={joinGame}
                                disabled={loading || !code}
                                className="w-[45%] bg-[#252528] hover:bg-[#2A2A2D] text-white font-black text-[10px] tracking-widest uppercase rounded-2xl py-4 active:scale-[0.97] transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                            >
                                <Play size={10} className="fill-white" /> {t('join', 'JOIN')}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pt-4 text-center">
                    <p className="text-[9px] font-black tracking-widest uppercase text-white/20">
                        {t('made_with', 'MADE WITH PASSION 🔥')}
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Lobby;
