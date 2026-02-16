import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Users } from 'lucide-react';

interface LobbyProps {
    onGameCreated: (gameId: string) => void;
    onJoinGame: (gameId: string) => void;
}

const Lobby: React.FC<LobbyProps> = ({ onGameCreated, onJoinGame }) => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);

    const createGame = async () => {
        setLoading(true);
        const code = Math.random().toString(36).substring(2, 6).toUpperCase();
        const { data } = await supabase
            .from('games')
            .insert([{
                code,
                status: 'setup',
                current_team: 1,
                scores: { team1: 0, team2: 0 }
            }])
            .select()
            .single();

        if (data) onGameCreated(data.id);
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
        <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-12">
            <div className="text-center">
                <span className="text-xs font-black text-accent-primary uppercase tracking-[0.6em] mb-4 block">Welcome to</span>
                <h1 className="text-7xl font-black text-white tracking-tighter">
                    TIME'S <span className="text-accent-primary">UP</span>
                </h1>
                <p className="text-white/20 font-black uppercase tracking-[0.3em] text-sm mt-2">2026 EDITION</p>
            </div>

            <div className="w-full space-y-4">
                <button
                    onClick={createGame}
                    disabled={loading}
                    className="btn-primary w-full flex items-center justify-center gap-3 py-6 text-xl"
                >
                    <Plus size={24} strokeWidth={3} />
                    {loading ? 'CREATING...' : 'NEW GAME'}
                </button>

                <div className="relative group">
                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-white/20 group-focus-within:text-accent-primary transition-colors">
                        <Users size={20} />
                    </div>
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder="ENTER GAME CODE"
                        className="w-full bg-white/5 border border-white/10 rounded-[24px] pl-16 pr-24 py-6 text-white font-mono text-xl tracking-[0.2em] focus:outline-none focus:border-accent-primary/50 transition-all"
                    />
                    <button
                        onClick={joinGame}
                        disabled={loading || !code}
                        className={`absolute right-4 top-1/2 -translate-y-1/2 font-black text-sm tracking-widest px-6 py-3 rounded-xl transition-all ${code ? 'text-accent-primary opacity-100' : 'text-white/10 opacity-0'
                            }`}
                    >
                        JOIN
                    </button>
                </div>
            </div>

            <div className="flex gap-12 text-white/10">
                <div className="flex flex-col items-center gap-1">
                    <span className="text-2xl font-black text-white/20">120+</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Celebrities</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <span className="text-2xl font-black text-white/20">3</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Phases</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <span className="text-2xl font-black text-white/20">∞</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Fun</span>
                </div>
            </div>
        </div>
    );
};

export default Lobby;
