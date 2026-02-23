import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { Plus, Zap } from 'lucide-react';

interface LobbyProps {
    onGameCreated: (gameId: string) => void;
    onJoinGame: (gameId: string) => void;
}

const Lobby: React.FC<LobbyProps> = ({ onGameCreated, onJoinGame }) => {
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
        <div className="flex-1 flex flex-col justify-center items-center w-full px-6 py-12 bg-black">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[280px] space-y-10"
            >
                <div className="text-center space-y-3">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A1111] border border-[#331818]"
                    >
                        <Zap size={10} className="fill-[#FF3B30] text-[#FF3B30]" />
                        <span className="text-[9px] font-black tracking-widest text-[#FF3B30] uppercase">EDICIÓN MEXICANA</span>
                    </motion.div>

                    <div className="flex flex-col items-center leading-none">
                        <h1 className="text-4xl sm:text-5xl font-black italic tracking-tighter text-white drop-shadow-md">
                            SIN LÍMITES
                        </h1>
                        <h2 className="text-4xl sm:text-5xl font-black italic tracking-tighter text-[#FF3B30]">
                            MX
                        </h2>
                    </div>
                    <p className="text-white/40 text-[11px] font-bold tracking-wide pt-2">
                        El juego que tus tías prohibirían.
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black tracking-widest text-white/50 uppercase ml-1 block">
                            TU APODO
                        </label>
                        <input
                            type="text"
                            placeholder="Ej. El Bicho"
                            className="w-full bg-[#1A1A1C] border-none rounded-[14px] px-4 py-3.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 placeholder:text-white/20 font-medium"
                        />
                    </div>

                    <button
                        onClick={createGame}
                        disabled={loading}
                        className="w-full bg-white text-black font-black text-xs tracking-widest uppercase rounded-[14px] py-3.5 flex items-center justify-center gap-2 hover:bg-white/90 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {loading ? '...' : <><Plus size={16} strokeWidth={3} /> CREAR SALA</>}
                    </button>

                    <div className="flex items-center gap-3 py-1">
                        <div className="h-[1px] flex-1 bg-white/10" />
                        <span className="text-[8px] font-black uppercase text-white/30 tracking-widest whitespace-nowrap">
                            O ÚNETE A UNA
                        </span>
                        <div className="h-[1px] flex-1 bg-white/10" />
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="CÓDIGO"
                            className="flex-1 w-full min-w-0 bg-[#1A1A1C] border-none rounded-[14px] px-2 py-3.5 text-xs text-center text-white font-black tracking-[0.2em] focus:outline-none placeholder:text-white/20 uppercase"
                        />
                        <button
                            onClick={joinGame}
                            disabled={loading || !code}
                            className="bg-[#2C2C2E] hover:bg-[#3A3A3C] text-white font-black text-[11px] tracking-widest uppercase rounded-[14px] px-5 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-1.5"
                        >
                            <svg className="w-3 h-3 fill-white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg> ENTRAR
                        </button>
                    </div>
                </div>

                <div className="pt-12 text-center">
                    <p className="text-[8px] font-black tracking-widest uppercase text-white/20">
                        HECHO CON PURA SAZÓN MEXA 🇲🇽
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Lobby;
