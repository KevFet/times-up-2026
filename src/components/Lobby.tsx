import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

interface LobbyProps {
    onGameCreated: (gameId: string, category: string) => void;
    onJoinGame: (gameId: string) => void;
}

const CATEGORIES = [
    { id: 'celebrity', name_en: 'Pop Culture', emoji: '🎭' },
    { id: 'fictional', name_en: 'Movies & TV', emoji: '🎬' },
    { id: 'friends', name_en: 'Friends', emoji: '☕️' },
    { id: 'tech', name_en: 'AI & Tech', emoji: '🤖' },
    { id: 'animals', name_en: 'Animals', emoji: '🐾' },
    { id: 'mexico', name_en: 'Mexico', emoji: '🌮' },
    { id: 'places', name_en: 'Places', emoji: '📍' },
    { id: 'music', name_en: 'Music', emoji: '🎸' },
    { id: 'food', name_en: 'Foodies', emoji: '🍕' },
    { id: 'heroes', name_en: 'Heroes', emoji: '🦸‍♂️' },
    { id: 'space', name_en: 'Space', emoji: '🚀' },
];

const Lobby: React.FC<LobbyProps> = ({ onGameCreated, onJoinGame }) => {
    const [code, setCode] = useState('');

    const createGame = async (categoryId: string) => {
        const code = Math.random().toString(36).substring(2, 6).toUpperCase();
        const { data } = await supabase
            .from('games')
            .insert([{
                code,
                status: 'setup',
                current_team: 1,
                scores: { team1: 0, team2: 0 },
                settings: { category: categoryId }
            }])
            .select()
            .single();

        if (data) onGameCreated(data.id, categoryId);
    };

    const joinGame = async () => {
        const { data } = await supabase
            .from('games')
            .select('*')
            .eq('code', code.toUpperCase())
            .single();

        if (data) onJoinGame(data.id);
    };

    return (
        <div className="w-full">
            <div className="flex flex-col items-center mb-12">
                <div className="relative w-full max-w-sm mb-8">
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="ENTER GAME CODE"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-mono text-center text-xl tracking-[0.3em] focus:outline-none focus:border-accent-primary/50 transition-all shadow-inner"
                    />
                    {code && (
                        <button
                            onClick={joinGame}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-accent-primary font-bold hover:scale-110 transition-transform"
                        >
                            JOIN
                        </button>
                    )}
                </div>

                <div className="w-full border-t border-white/5 mb-8"></div>
                <h3 className="text-white/40 text-xs font-black uppercase tracking-[0.3em] mb-6">Create New Game</h3>
            </div>

            <div className="category-grid">
                {CATEGORIES.map((cat, idx) => (
                    <motion.div
                        key={cat.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ y: -8 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => createGame(cat.id)}
                        className="category-card"
                    >
                        <span className="category-emoji">{cat.emoji}</span>
                        <span className="category-name">{cat.name_en}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Lobby;
