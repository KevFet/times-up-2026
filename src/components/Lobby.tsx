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
        <div className="flex-1 flex flex-col justify-center items-center w-full min-h-screen px-6 py-12 relative bg-[#000000] overflow-hidden" style={{ backgroundColor: '#000000' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                className="w-full max-w-[320px] space-y-12 relative z-10 flex flex-col items-center"
            >
                {/* Brand / Header */}
                <div className="flex flex-col items-center text-center space-y-4">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1A1A1C] border border-[#2B2B2B]"
                    >
                        <Zap size={10} className="fill-[#FF4D4D] text-[#FF4D4D]" />
                        <span className="text-[9px] font-black tracking-widest text-[#FF4D4D] uppercase">
                            {t('edition', 'EDICIÓN MEXICANA')}
                        </span>
                    </motion.div>

                    <div className="flex flex-col items-center leading-none mt-2">
                        <h1 className="text-[48px] font-black italic tracking-tighter text-[#FFFFFF]">
                            TIME'S UP
                        </h1>
                        <h2 className="text-[54px] font-black italic tracking-tighter text-[#FF4D4D] -mt-3" style={{ textShadow: '0 0 15px rgba(255, 77, 77, 0.5)' }}>
                            MX
                        </h2>
                    </div>
                    <p className="text-[#A0A0A0] text-xs font-bold pt-2">
                        {t('subtitle', 'El juego que tus tías prohibirían.')}
                    </p>
                </div>

                {/* Specific exact UI from the image matching (No huge glass box wrapping it) */}
                <div className="w-full space-y-6">
                    <div className="space-y-2">
                        <label className="text-[8px] font-black tracking-widest text-[#A0A0A0] uppercase ml-1 block">
                            {t('your_nickname', 'TU APODO')}
                        </label>
                        <input
                            type="text"
                            placeholder={t('nickname_placeholder', 'Ej. El Bicho')}
                            className="w-full bg-[#1A1A1C] border border-[#2B2B2B] rounded-[14px] px-5 py-4 text-sm text-[#FFFFFF] focus:outline-none focus:border-white/50 placeholder:text-[#555555] font-semibold transition-colors"
                        />
                    </div>

                    <button
                        onClick={createGame}
                        disabled={loading}
                        className="w-full bg-[#FFFFFF] text-[#000000] font-black text-xs tracking-widest uppercase rounded-[14px] py-4 flex items-center justify-center gap-2 hover:bg-[#E0E0E0] active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
                                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                </motion.div>
                            ) : (
                                <motion.div key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                                    <Plus size={16} strokeWidth={3} />
                                    {t('create_room', 'CREAR SALA')}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </button>

                    <div className="flex items-center gap-4 py-2 opacity-80">
                        <div className="h-[1px] flex-1 bg-[#2B2B2B]" />
                        <span className="text-[8px] font-black uppercase text-[#666666] tracking-widest whitespace-nowrap">
                            {t('or_join_one', 'O ÚNETE A UNA')}
                        </span>
                        <div className="h-[1px] flex-1 bg-[#2B2B2B]" />
                    </div>

                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder={t('code', 'CÓDIGO')}
                            className="flex-1 w-[60%] bg-[#1A1A1C] border border-[#2B2B2B] rounded-[14px] px-4 py-4 text-xs text-center text-[#FFFFFF] font-black tracking-widest focus:outline-none focus:border-white/50 placeholder:text-[#555555] uppercase transition-colors"
                        />
                        <button
                            onClick={joinGame}
                            disabled={loading || !code}
                            className="w-[40%] bg-[#28282A] hover:bg-[#323235] text-[#FFFFFF] font-black text-[10px] tracking-widest uppercase rounded-[14px] py-4 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-1.5"
                        >
                            <svg className="w-3 h-3 fill-white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg> {t('join', 'ENTRAR')}
                        </button>
                    </div>
                </div>

                <div className="pt-10 text-center">
                    <p className="text-[8px] font-black tracking-widest uppercase text-[#444444]">
                        {t('made_with', 'HECHO CON PURA SAZÓN MEXA 🇲🇽')}
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Lobby;
