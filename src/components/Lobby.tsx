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
        <div className="flex-1 flex flex-col justify-center items-center w-full min-h-screen px-6 py-12 relative overflow-hidden">
            {/* Cyberpunk Bokeh Background */}
            <div className="cyberpunk-bg" />

            {/* Thick Layered Glass Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[380px] p-8 md:p-10 rounded-[40px] glass-heavy relative z-10 flex flex-col items-center"
            >
                {/* Advanced Glass Effects */}
                <div className="glass-rim rounded-[40px]" />
                <div className="glass-texture rounded-[40px]" />

                {/* Header Badge */}
                <div className="mb-10 relative">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 border border-white/10 backdrop-blur-md shadow-[0_0_15px_rgba(255,51,51,0.3)]">
                        <Zap size={12} className="fill-[#FF3333] text-[#FF3333] drop-shadow-[0_0_5px_#FF3333]" />
                        <span className="text-[10px] font-black tracking-[0.2em] text-white uppercase opacity-90">
                            {t('edition', 'EDICIÓN MEXICANA')}
                        </span>
                    </div>
                </div>

                {/* Holographic Title Section */}
                <div className="text-center mb-4 relative">
                    <h1 className="text-[56px] md:text-[64px] font-black italic tracking-tighter text-white leading-[0.85] glitch-text uppercase">
                        TIME'S UP
                    </h1>
                    <h2 className="text-[64px] md:text-[72px] font-black italic tracking-tighter text-[#FF3333] leading-[0.85] mt-1 drop-shadow-[0_0_25px_rgba(255,51,51,0.8)]">
                        MX
                    </h2>
                </div>

                {/* Holographic Slogan */}
                <p className="text-[#00FFFF] text-[11px] font-black tracking-[0.1em] uppercase mb-14 drop-shadow-[0_0_10px_rgba(0,255,255,0.5)] opacity-80">
                    {t('subtitle', 'El juego que tus tías prohibirían.')}
                </p>

                {/* Form Section (Glass Layers) */}
                <div className="w-full space-y-10">
                    {/* Nickname Field */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black tracking-[0.3em] text-[#00FFFF] uppercase ml-1 block opacity-60">
                            {t('your_nickname', 'TU APODO')}
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={t('nickname_placeholder', 'Ej. El Bicho')}
                                className="w-full bg-white/5 border border-white/10 rounded-[16px] px-6 py-5 text-sm text-white focus:outline-none focus:border-[#00FFFF]/50 placeholder:text-white/20 font-bold transition-all backdrop-blur-md"
                            />
                            <div className="absolute inset-0 rounded-[16px] border border-[#00FFFF]/20 pointer-events-none opacity-0 focus-within:opacity-100 transition-opacity" />
                        </div>
                    </div>

                    {/* Main CTA (Glow Glass) */}
                    <button
                        onClick={createGame}
                        disabled={loading}
                        className="group relative w-full bg-white text-black font-black text-xs tracking-[0.2em] uppercase rounded-[16px] py-6 flex items-center justify-center gap-3 overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(255,255,255,0.2)] disabled:opacity-50"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                </motion.div>
                            ) : (
                                <motion.div key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 relative z-10">
                                    <Plus size={20} strokeWidth={4} />
                                    {t('create_room', 'CREAR SALA')}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </button>

                    {/* Laser Separator */}
                    <div className="flex items-center gap-6 py-2">
                        <div className="laser-beam flex-1" />
                        <span className="text-[9px] font-black uppercase text-white/40 tracking-[0.3em] whitespace-nowrap italic">
                            {t('or_join_one', 'O ÚNETE A UNA')}
                        </span>
                        <div className="laser-beam flex-1" />
                    </div>

                    {/* Join Section */}
                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder={t('code', 'CÓDIGO')}
                            className="flex-1 w-[60%] bg-black/40 border border-white/10 rounded-[16px] px-5 py-5 text-xs text-center text-white font-black tracking-[0.3em] focus:outline-none focus:border-[#FF3333]/50 placeholder:text-white/20 uppercase transition-all backdrop-blur-md"
                        />
                        <button
                            onClick={joinGame}
                            disabled={loading || !code}
                            className="w-[40%] bg-white/10 border border-white/20 hover:bg-white/20 text-white font-black text-[11px] tracking-[0.2em] uppercase rounded-[16px] py-5 flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                        >
                            <svg className="w-4 h-4 fill-[#00FFFF] drop-shadow-[0_0_5px_rgba(0,255,255,0.8)]" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                            {t('join', 'ENTRAR')}
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-16 text-center opacity-40 hover:opacity-100 transition-opacity">
                    <p className="text-[10px] font-black tracking-[0.4em] uppercase text-white drop-shadow-[0_0_8px_white]">
                        {t('made_with', 'HECHO CON PURA SAZÓN MEXA 🇲🇽')}
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Lobby;
