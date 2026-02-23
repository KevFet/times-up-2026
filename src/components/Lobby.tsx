import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';

interface LobbyProps {
    onGameCreated: (gameId: string) => void;
    onJoinGame: (gameId: string) => void;
}

const Lobby: React.FC<LobbyProps> = ({ onGameCreated, onJoinGame }) => {
    const { t } = useTranslation();
    const [code, setCode] = useState('');
    const [nickname, setNickname] = useState('');
    const [loading, setLoading] = useState(false);

    const createGame = async () => {
        if (!nickname) return;
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
        if (!code || !nickname) return;
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
        <div className="container-strict">
            {/* Header Section */}
            <div className="header-stack">
                <div className="flex flex-col items-center">
                    <h1 className="title-strict text-white leading-[0.8]">TIME'S UP</h1>
                    <h1 className="title-strict mx-glow -mt-2">MX</h1>
                </div>
                <p className="slogan-strict">{t('slogan')}</p>
            </div>

            {/* Inputs & Actions */}
            <div className="flex flex-col gap-[24px] mt-2">
                {/* Nickname Field */}
                <div className="field-group">
                    <label className="label-strict">{t('label_pseudo')}</label>
                    <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder={t('placeholder_pseudo')}
                        className="input-strict"
                    />
                </div>

                {/* Create Button */}
                <button
                    onClick={createGame}
                    disabled={loading || !nickname}
                    className="button-strict"
                >
                    {loading ? '...' : t('button_create')}
                </button>

                {/* Separator */}
                <div className="separator-container">
                    <div className="separator-line" />
                    <span className="separator-text">{t('separator')}</span>
                    <div className="separator-line" />
                </div>

                {/* Join Section */}
                <div className="field-group">
                    <label className="label-strict">{t('label_code')}</label>
                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="----"
                            className="input-strict flex-1 text-center tracking-[0.4em] font-black"
                        />
                        <button
                            onClick={joinGame}
                            disabled={loading || !code || !nickname}
                            className="button-strict w-[120px]"
                        >
                            {t('button_enter')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Lobby;
