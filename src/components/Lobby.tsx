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
        <div className="flex-1 flex flex-col justify-center items-center w-full min-h-screen px-6 py-12 relative bg-[#000000]" style={{ backgroundColor: '#000000' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[340px] flex flex-col items-center"
            >
                {/* Header Badge */}
                <div className="mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1A1A1A] border border-[#2A2A2A]">
                        <Zap size={10} className="fill-[#FF4D4D] text-[#FF4D4D]" />
                        <span className="text-[9px] font-black tracking-[0.15em] text-[#FF4D4D] uppercase">
                            {t('edition', 'EDICIÓN MEXICANA')}
                        </span>
                    </div>
                </div>

                {/* Title Section */}
                <div className="text-center mb-2">
                    <h1 className="text-[52px] font-black italic tracking-tighter text-[#FFFFFF] leading-[0.9]">
                        TIME'S UP
                    </h1>
                    <h2 className="text-[58px] font-black italic tracking-tighter text-[#FF4D4D] leading-[0.9]" style={{ textShadow: '0 0 20px rgba(255, 77, 77, 0.4)' }}>
                        MX
                    </h2>
                </div>

                {/* Slogan */}
                <p className="text-[#A0A0A0] text-xs font-bold tracking-tight mb-16">
                    {t('subtitle', 'El juego que tus tías prohibirían.')}
                </p>

                {/* Form Section */}
                <div className="w-full space-y-8">
                    {/* Nickname Field */}
                    <div className="space-y-2">
                        <label className="text-[9px] font-black tracking-widest text-[#666666] uppercase ml-1 block">
                            {t('your_nickname', 'TU APODO')}
                        </label>
                        <input
                            type="text"
                            placeholder={t('nickname_placeholder', 'Ej. El Bicho')}
                            className="w-full bg-[#121212] border border-[#2A2A2A] rounded-[12px] px-5 py-4 text-sm text-[#FFFFFF] focus:outline-none focus:border-[#444444] placeholder:text-[#333333] font-bold transition-all"
                        />
                    </div>

                    {/* Main CTA */}
                    <button
                        onClick={createGame}
                        disabled={loading}
                        className="w-full bg-[#FFFFFF] text-[#000000] font-black text-xs tracking-[0.1em] uppercase rounded-[12px] py-5 flex items-center justify-center gap-2 hover:bg-[#F2F2F2] active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                </motion.div>
                            ) : (
                                <motion.div key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                                    <Plus size={18} strokeWidth={3} />
                                    {t('create_room', 'CREAR SALA')}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-4 py-2">
                        <div className="h-[1px] flex-1 bg-[#1A1A1A]" />
                        <span className="text-[8px] font-black uppercase text-[#444444] tracking-[0.2em] whitespace-nowrap">
                            {t('or_join_one', 'O ÚNETE A UNA')}
                        </span>
                        <div className="h-[1px] flex-1 bg-[#1A1A1A]" />
                    </div>

                    {/* Join Section */}
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder={t('code', 'CÓDIGO')}
                            className="flex-1 w-[60%] bg-[#121212] border border-[#2A2A2A] rounded-[12px] px-4 py-4 text-xs text-center text-[#FFFFFF] font-black tracking-[0.2em] focus:outline-none focus:border-[#444444] placeholder:text-[#333333] uppercase transition-all"
                        />
                        <button
                            onClick={joinGame}
                            disabled={loading || !code}
                            className="w-[40%] bg-[#2A2A2A] hover:bg-[#333333] text-[#FFFFFF] font-black text-[10px] tracking-[0.15em] uppercase rounded-[12px] py-4 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            <svg className="w-3 h-3 fill-white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                            {t('join', 'ENTRAR')}
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-20">
                    <p className="text-[8px] font-black tracking-[0.25em] uppercase text-[#333333]">
                        {t('made_with', 'HECHO CON PURA SAZÓN MEXA 🇲🇽')}
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Lobby;
