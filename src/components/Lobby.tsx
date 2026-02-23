import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Zap } from 'lucide-react';
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
        <div className="flex-1 flex flex-col justify-center items-center w-full min-h-screen px-6 py-12 relative overflow-hidden font-['Kanit'] selection:bg-[#FF0000]/30">
            {/* 2026 Ambient Background Light Fields */}
            <div className="fixed inset-0 bg-[#020305] z-[-2]" />
            <div className="fixed inset-0 z-[-1]">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#FF0000]/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#00FFFF]/10 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[420px] flex flex-col items-center gap-12 relative z-10"
            >
                {/* Floating Glass Header Section */}
                <div className="flex flex-col items-center text-center gap-6">
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-3xl shadow-[0_0_20px_rgba(255,0,0,0.15)]"
                    >
                        <Zap size={14} className="text-[#FF0000] drop-shadow-[0_0_8px_#FF0000] fill-[#FF0000]" />
                        <span className="text-[11px] font-black tracking-[0.25em] text-white/80 uppercase">
                            {t('edition', 'EDICIÓN MEXICANA')}
                        </span>
                    </motion.div>

                    <div className="flex flex-col items-center leading-[0.85] py-4">
                        <motion.h1
                            initial={{ x: -30, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-[64px] md:text-[72px] font-black italic tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                        >
                            TIME'S UP
                        </motion.h1>
                        <motion.h2
                            initial={{ x: 30, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="text-[76px] md:text-[88px] font-black italic tracking-tighter text-[#FF0000] drop-shadow-[0_0_40px_rgba(255,0,0,0.7)]"
                        >
                            MX
                        </motion.h2>
                    </div>
                    <p className="text-white/40 text-sm font-bold tracking-wide italic">
                        {t('subtitle', 'El juego que tus tías prohibirían.')}
                    </p>
                </div>

                {/* Glass Bento Form Section */}
                <div className="w-full flex flex-col gap-10">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black tracking-[0.4em] text-white/30 uppercase ml-2 block">
                            {t('your_nickname', 'TU APODO')}
                        </label>
                        <div className="group relative">
                            <input
                                type="text"
                                placeholder={t('nickname_placeholder', 'Ej. El Bicho')}
                                className="w-full bg-white/5 border border-white/10 rounded-[20px] px-8 py-6 text-base text-white focus:outline-none focus:ring-1 focus:ring-white/30 placeholder:text-white/10 font-bold transition-all backdrop-blur-[40px]"
                            />
                            <div className="absolute inset-0 rounded-[20px] bg-white/[0.02] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
                        </div>
                    </div>

                    {/* Main CTA: Radiant Frost Glass */}
                    <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={createGame}
                        disabled={loading}
                        className="group relative w-full bg-white text-black font-black text-xs tracking-[0.25em] uppercase rounded-[20px] py-7 flex items-center justify-center gap-4 overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.15)] transition-all disabled:opacity-50"
                    >
                        {/* Light sweep animation */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FF0000]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <div className="w-6 h-6 border-3 border-black/10 border-t-black rounded-full animate-spin" />
                                </motion.div>
                            ) : (
                                <motion.div key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 relative z-10">
                                    <Plus size={22} strokeWidth={4} />
                                    {t('create_room', 'CREAR SALA')}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.button>

                    {/* Laser Aura Separator */}
                    <div className="flex items-center gap-8 py-2">
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#FF0000]/40 to-transparent shadow-[0_0_10px_#FF0000]" />
                        <span className="text-[10px] font-black uppercase text-white/30 tracking-[0.4em] whitespace-nowrap italic">
                            {t('or_join_one', 'O ÚNETE A UNA')}
                        </span>
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#FF0000]/40 to-transparent shadow-[0_0_10px_#FF0000]" />
                    </div>

                    <div className="flex flex-col md:flex-row gap-5">
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder={t('code', 'CÓDIGO')}
                            className="flex-1 bg-white/5 border border-white/10 rounded-[20px] px-6 py-6 text-sm text-center text-white font-black tracking-[0.5em] focus:outline-none focus:ring-1 focus:ring-white/30 placeholder:text-white/10 uppercase transition-all backdrop-blur-[40px]"
                        />
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={joinGame}
                            disabled={loading || !code}
                            className="md:w-auto px-10 py-6 bg-black/40 border border-white/10 rounded-[20px] text-white font-black text-[12px] tracking-[0.2em] uppercase flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,0,0,0.1)] hover:bg-black/60 transition-all disabled:opacity-50"
                        >
                            <svg className="w-4 h-4 fill-[#FF0000] drop-shadow-[0_0_8px_#FF0000]" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                            {t('join', 'ENTRAR')}
                        </motion.button>
                    </div>
                </div>

                {/* Footer Signature */}
                <div className="mt-12 text-center group cursor-default">
                    <p className="text-[10px] font-black tracking-[0.5em] uppercase text-white/20 group-hover:text-white/40 transition-colors drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                        {t('made_with', 'HECHO CON PURA SAZÓN MEXA 🇲🇽')}
                    </p>
                </div>
            </motion.div>

            {/* Space Dust / Digital Particles Overlay (Hidden on Mobile) */}
            <div className="hidden lg:block absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-ping" />
                <div className="absolute top-3/4 left-2/3 w-1 h-1 bg-white rounded-full animate-ping [animation-delay:1s]" />
                <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full animate-ping [animation-delay:2s]" />
            </div>
        </div>
    );
};

export default Lobby;
