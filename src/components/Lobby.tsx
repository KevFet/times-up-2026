import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

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
        const code = Math.random().toString(36).substring(2, 6).toUpperCase();
        const { data, error } = await supabase
            .from('games')
            .insert([{ code, status: 'setup', current_team: 1, scores: { team1: 0, team2: 0 } }])
            .select()
            .single();

        if (data) onGameCreated(data.id);
        setLoading(false);
    };

    const joinGame = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('games')
            .select('*')
            .eq('code', code.toUpperCase())
            .single();

        if (data) onJoinGame(data.id);
        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center gap-8 w-full max-w-sm">
            <h1 className="text-6xl font-black text-white tracking-tighter text-center">
                TIME'S <span className="text-accent-primary">UP</span>
                <br />
                <span className="text-2xl font-light text-white/40">2026 EDITION</span>
            </h1>

            <div className="flex flex-col gap-4 w-full">
                <button
                    onClick={createGame}
                    className="neon-button primary w-full py-4 text-xl rounded-2xl"
                    disabled={loading}
                >
                    {loading ? '...' : t('start_game')}
                </button>

                <div className="relative w-full mt-4">
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="GAME CODE"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white font-mono text-center text-2xl tracking-[0.5em] focus:outline-none focus:border-accent-primary/50"
                    />
                    <button
                        onClick={joinGame}
                        className="mt-4 text-accent-primary font-bold uppercase tracking-widest text-sm hover:opacity-80 w-full"
                        disabled={loading || !code}
                    >
                        JOIN EXISTING GAME
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Lobby;
