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
        <div className="flex-1 flex flex-col justify-center items-center w-full h-screen bg-black relative overflow-hidden selection:bg-red-600/30 font-['Kanit']">
            {/* Background Discrete Auras */}
            <div className="absolute top-1/2 -left-[10%] w-[40%] h-[40%] bg-red-600/10 blur-[120px] rounded-full" />
            <div className="absolute top-1/2 -right-[10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md px-6 flex flex-col items-center gap-y-12 relative z-10"
            >
                {/* Title Section (Holographic) */}
                <div className="text-center flex flex-col items-center leading-none">
                    <motion.h1
                        className="text-6xl md:text-7xl font-black italic tracking-tighter text-white"
                    >
                        TIME'S UP
                    </motion.h1>
                    <motion.h2
                        className="text-7xl md:text-8xl font-black italic tracking-tighter text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)] -mt-2"
                    >
                        MX
                    </motion.h2>
                </div>

                {/* Main Action Block */}
                <div className="w-full flex flex-col gap-y-12">
                    {/* Nickname Section */}
                    <div className="flex flex-col gap-y-4">
                        <label className="text-[10px] font-black tracking-[0.4em] text-white/30 uppercase ml-4">
                            {t('your_nickname', 'TU APODO')}
                        </label>
                        <input
                            type="text"
                            placeholder={t('nickname_placeholder', 'Ej. El Bicho')}
                            className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-8 text-lg text-white font-bold placeholder:text-white/10 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all backdrop-blur-xl"
                        />
                    </div>

                    {/* Create Room Button (Pure Solid White) */}
                    <button
                        onClick={createGame}
                        disabled={loading}
                        className="w-full h-16 bg-white text-black font-black text-sm tracking-[0.25em] uppercase rounded-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-3 border-black/20 border-t-black rounded-full animate-spin" />
                        ) : (
                            <>
                                <Plus size={24} strokeWidth={4} />
                                {t('create_room', 'CREAR SALA')}
                            </>
                        )}
                    </button>

                    {/* Join Section */}
                    <div className="flex flex-col gap-y-8">
                        {/* Divider */}
                        <div className="flex items-center gap-x-6 px-4">
                            <div className="h-[1px] flex-1 bg-white/10" />
                            <span className="text-[10px] font-black uppercase text-white/20 tracking-[0.4em]">
                                {t('or_join_one', 'O ÚNETE A UNA')}
                            </span>
                            <div className="h-[1px] flex-1 bg-white/10" />
                        </div>

                        <div className="flex gap-x-4">
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                placeholder={t('code', 'CÓDIGO')}
                                className="flex-[3] h-16 bg-white/5 border border-white/10 rounded-2xl px-6 text-xl text-center text-white font-black tracking-[0.4em] placeholder:text-white/10 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all backdrop-blur-xl"
                            />
                            <button
                                onClick={joinGame}
                                disabled={loading || !code}
                                className="flex-[2] h-16 bg-white/10 border border-white/10 hover:bg-white/20 text-white font-black text-xs tracking-widest uppercase rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                <svg className="w-4 h-4 fill-red-600 drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                                {t('join', 'ENTRAR')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-4">
                    <p className="text-[9px] font-black tracking-[0.5em] text-white/20 uppercase transition-opacity">
                        {t('made_with', 'HECHO CON PURA SAZÓN MEXA 🇲🇽')}
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Lobby;
