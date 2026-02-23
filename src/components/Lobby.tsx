import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Zap, ArrowRight } from 'lucide-react';
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

        // 1. Create the game
        const { data: game, error: gameError } = await supabase
            .from('games')
            .insert([{
                code: gameCode,
                status: 'playing', // Directly to playing
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

        // 2. The "Computer" picks cards (40 cards)
        const { data: allCards } = await supabase
            .from('cards')
            .select('*');

        if (allCards && allCards.length > 0) {
            const shuffled = [...allCards].sort(() => 0.5 - Math.random());
            const selectedCards = shuffled.slice(0, 40);

            const gameCards = selectedCards.map(c => ({
                game_id: game.id,
                card_id: c.id,
                status: 'deck'
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
        <div className="flex-1 flex flex-col justify-center items-center w-full px-4 sm:px-6 py-12 relative overflow-hidden">
            {/* 2026 Background Ambient Glow */}
            <div className="absolute inset-0 z-0 pointer-events-none flex justify-center items-center">
                <div className="absolute w-[150vw] h-[150vw] sm:w-[50vw] sm:h-[50vw] bg-accent-primary/20 rounded-full blur-[100px] opacity-50 mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
                <div className="absolute w-[120vw] h-[120vw] sm:w-[40vw] sm:h-[40vw] bg-blue-500/10 rounded-full blur-[120px] opacity-40 mix-blend-screen translate-x-1/4 translate-y-1/4" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[340px] space-y-10 relative z-10"
            >
                {/* Title Section */}
                <div className="text-center space-y-4">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                    >
                        <Zap size={10} className="fill-accent-primary text-accent-primary" />
                        <span className="text-[9px] font-black tracking-widest text-accent-primary uppercase">{t('edition')}</span>
                    </motion.div>

                    <div className="flex flex-col items-center leading-none">
                        <h1 className="text-[52px] font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 drop-shadow-[0_0_25px_rgba(255,255,255,0.2)]">
                            TIME'S
                        </h1>
                        <h2 className="text-[58px] font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-accent-primary to-accent-primary/60 -mt-3 drop-shadow-[0_0_20px_rgba(255,59,48,0.4)]">
                            UP
                        </h2>
                    </div>
                    <p className="text-white/50 text-[11px] font-medium tracking-wide pt-1">
                        {t('subtitle')}
                    </p>
                </div>

                {/* Glassmorphism Interactive Panel border-white/10 */}
                <div className="space-y-6 bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-[28px] p-6 sm:p-7 relative overflow-hidden">
                    {/* Inner subtle glow line for volume effect */}
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                    <div className="space-y-2">
                        <label className="text-[9px] font-black tracking-widest text-white/40 uppercase ml-2 block">
                            {t('your_nickname')}
                        </label>
                        <input
                            type="text"
                            placeholder={t('nickname_placeholder')}
                            className="w-full bg-white/5 border border-white/[0.05] shadow-inner rounded-[16px] px-5 py-4 text-sm text-white focus:outline-none focus:bg-white/10 focus:border-white/20 focus:ring-4 focus:ring-white/5 placeholder:text-white/20 font-medium transition-all duration-300"
                        />
                    </div>

                    <button
                        onClick={createGame}
                        disabled={loading}
                        className="w-full relative group overflow-hidden bg-white text-black font-black text-[13px] tracking-[0.1em] uppercase rounded-[16px] py-4 flex items-center justify-center gap-2 hover:bg-white/90 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                    >
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                    <span>{t('generating_deck')}</span>
                                </motion.div>
                            ) : (
                                <motion.div key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                                    <Plus size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-500" />
                                    <span>{t('create_room')}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </button>

                    <div className="flex items-center gap-4 py-2 opacity-60">
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/20" />
                        <span className="text-[9px] font-black uppercase text-white/50 tracking-widest whitespace-nowrap">
                            {t('or_join_one')}
                        </span>
                        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/20" />
                    </div>

                    <div className="flex gap-2.5">
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder={t('code')}
                            className="flex-1 w-[55%] bg-white/5 border border-white/[0.05] shadow-inner rounded-[16px] px-4 py-4 text-[13px] text-center text-white font-black tracking-[0.2em] focus:outline-none focus:bg-white/10 focus:border-white/20 focus:ring-4 focus:ring-white/5 placeholder:text-white/20 uppercase transition-all duration-300"
                        />
                        <button
                            onClick={joinGame}
                            disabled={loading || !code}
                            className="w-[45%] bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/10 text-white font-black text-[11px] tracking-widest uppercase rounded-[16px] py-4 active:scale-[0.96] transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 hover:shadow-[0_0_25px_rgba(255,255,255,0.1)]"
                        >
                            <span>{t('join')}</span> <ArrowRight size={14} strokeWidth={3} className="opacity-70" />
                        </button>
                    </div>
                </div>

                <div className="pt-6 text-center">
                    <p className="text-[8px] font-black tracking-[0.2em] uppercase text-white/30 drop-shadow-md">
                        {t('made_with')}
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Lobby;
