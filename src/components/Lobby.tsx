import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Zap, Search } from 'lucide-react';

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
        <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full px-6 py-12">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12"
            >
                <div className="text-center space-y-4">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-accent-primary/10 border border-accent-primary/20"
                    >
                        <Zap size={12} className="text-accent-primary fill-accent-primary" />
                        <span className="text-[10px] font-black tracking-[0.2em] text-accent-primary uppercase">Edition 2026</span>
                    </motion.div>

                    <h1 className="text-7xl font-black tracking-tighter leading-tight">
                        TIME'S <br />
                        <span className="text-accent-primary">UP</span>
                    </h1>
                    <p className="text-text-secondary text-sm font-medium max-w-[280px] mx-auto leading-relaxed">
                        The ultimate high-stakes guessing game, redesigned for the future.
                    </p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={createGame}
                        disabled={loading}
                        className="btn-premium w-full group relative overflow-hidden"
                    >
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div
                                    key="loading"
                                    className="flex items-center gap-3"
                                >
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="w-5 h-5 border-2 border-black/10 border-t-black rounded-full"
                                    />
                                    <span className="text-xs">GENERATING ARENA DECK...</span>
                                </motion.div>
                            ) : (
                                <motion.div key="text" className="flex items-center gap-3">
                                    <Plus size={22} strokeWidth={3} />
                                    <span>Launch Game</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </button>

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-white/10 group-focus-within:text-white/40 transition-colors">
                            <Search size={20} />
                        </div>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="Enter Arena Code"
                            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-[24px] pl-16 pr-24 py-6 text-white font-mono text-xl tracking-[0.2em] focus:outline-none focus:border-white/20 transition-all placeholder:text-white/5"
                        />
                        <button
                            onClick={joinGame}
                            disabled={loading || !code}
                            className={`absolute right-4 top-1/2 -translate-y-1/2 font-black text-xs tracking-[0.2em] px-5 py-3 rounded-xl transition-all ${code ? 'bg-white text-black opacity-100 scale-100' : 'bg-white/5 text-white/10 opacity-0 scale-90'
                                }`}
                        >
                            JOIN
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-8 pt-8 opacity-40">
                    <div className="text-center space-y-1">
                        <div className="text-xl font-black">120+</div>
                        <div className="text-[9px] font-bold uppercase tracking-widest">Stars</div>
                    </div>
                    <div className="text-center space-y-1">
                        <div className="text-xl font-black text-accent-primary">3</div>
                        <div className="text-[9px] font-bold uppercase tracking-widest">Rounds</div>
                    </div>
                    <div className="text-center space-y-1">
                        <div className="text-xl font-black text-accent-secondary">24/7</div>
                        <div className="text-[9px] font-bold uppercase tracking-widest">Sync</div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Lobby;
