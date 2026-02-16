import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { SwipeCard } from './SwipeCard';
import { NeonTimer } from './NeonTimer';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Trophy, Users, MoveRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface GameProps {
    gameId: string;
    onFinish: () => void;
}

const Game: React.FC<GameProps> = ({ gameId, onFinish }) => {
    const { t, i18n } = useTranslation();
    const [phase, setPhase] = useState(1);
    const [deck, setDeck] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [scores, setScores] = useState({ team1: 0, team2: 0 });
    const [currentTeam, setCurrentTeam] = useState(1);
    const [timeLeft, setTimeLeft] = useState(30);
    const [isTurnActive, setIsTurnActive] = useState(false);
    const [showTurnEnd, setShowTurnEnd] = useState(false);

    const timerRef = useRef<any>(null);
    const channelRef = useRef<any>(null);

    useEffect(() => {
        // 1. Fetch Initial State
        const init = async () => {
            const { data: gameData } = await supabase.from('games').select('*').eq('id', gameId).single();
            if (gameData) {
                setScores(gameData.scores);
                setCurrentTeam(gameData.current_team);
            }

            const { data: cardData } = await supabase
                .from('game_cards')
                .select('*, cards(*)')
                .eq('game_id', gameId)
                .eq('status', 'deck');

            if (cardData) {
                setDeck(cardData.map(gc => ({ ...gc.cards, game_card_id: gc.id })));
            }
        };
        init();

        // 2. Setup Realtime
        const channel = supabase.channel(`game:${gameId}`)
            .on('broadcast', { event: 'game_update' }, ({ payload }) => {
                if (payload.scores) setScores(payload.scores);
                if (payload.currentTeam) setCurrentTeam(payload.currentTeam);
                if (payload.phase) setPhase(payload.phase);
                if (payload.isTurnActive !== undefined) setIsTurnActive(payload.isTurnActive);
                if (payload.timeLeft !== undefined) setTimeLeft(payload.timeLeft);
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'game_cards' }, (payload) => {
                // Update deck locally when a card is guessed
                if (payload.new.status === 'guessed') {
                    setDeck(prev => prev.filter(c => c.game_card_id !== payload.new.id));
                }
            })
            .subscribe();

        channelRef.current = channel;

        return () => {
            supabase.removeChannel(channel);
        };
    }, [gameId]);

    useEffect(() => {
        if (isTurnActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    const next = prev - 1;
                    // Broadcast timer to others (throttled or just for sync)
                    if (next % 2 === 0) {
                        channelRef.current.send({
                            type: 'broadcast',
                            event: 'game_update',
                            payload: { timeLeft: next }
                        });
                    }
                    return next;
                });
            }, 1000);
        } else if (timeLeft === 0 && isTurnActive) {
            endTurn();
        }
        return () => clearInterval(timerRef.current);
    }, [isTurnActive, timeLeft]);

    const startTurn = () => {
        setIsTurnActive(true);
        setTimeLeft(30);
        channelRef.current.send({
            type: 'broadcast',
            event: 'game_update',
            payload: { isTurnActive: true, timeLeft: 30 }
        });
    };

    const endTurn = () => {
        setIsTurnActive(false);
        setShowTurnEnd(true);
        clearInterval(timerRef.current);

        channelRef.current.send({
            type: 'broadcast',
            event: 'game_update',
            payload: { isTurnActive: false, showTurnEnd: true }
        });
    };

    const handleNextTurn = async () => {
        const nextTeam = currentTeam === 1 ? 2 : 1;
        setCurrentTeam(nextTeam);
        setShowTurnEnd(false);
        setTimeLeft(30);

        // Sync to DB
        await supabase.from('games').update({ current_team: nextTeam }).eq('id', gameId);

        channelRef.current.send({
            type: 'broadcast',
            event: 'game_update',
            payload: { currentTeam: nextTeam, showTurnEnd: false, timeLeft: 30 }
        });
    };

    const handleSuccess = async () => {
        const card = deck[currentIndex];
        const newScores = {
            ...scores,
            [`team${currentTeam}`]: scores[`team${currentTeam}` as 'team1' | 'team2'] + 1
        };

        setScores(newScores);

        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#00f2ff', '#7000ff', '#00ff88']
        });

        // Update DB
        await supabase.from('game_cards').update({ status: 'guessed' }).eq('id', card.game_card_id);
        await supabase.from('games').update({ scores: newScores }).eq('id', gameId);

        // Broadcast
        channelRef.current.send({
            type: 'broadcast',
            event: 'game_update',
            payload: { scores: newScores }
        });

        if (deck.length > 1) {
            setCurrentIndex((prev) => (prev + 1) % deck.length);
        } else {
            // Phase Complete!
            if (phase < 3) {
                const nextPhase = phase + 1;
                setPhase(nextPhase);

                // Reset all cards for next phase
                await supabase.from('game_cards').update({ status: 'deck' }).eq('game_id', gameId);

                // Fetch fresh deck
                const { data } = await supabase.from('game_cards').select('*, cards(*)').eq('game_id', gameId);
                if (data) setDeck(data.map(gc => ({ ...gc.cards, game_card_id: gc.id })));

                setCurrentIndex(0);
                setIsTurnActive(false);
                setShowTurnEnd(true);

                channelRef.current.send({
                    type: 'broadcast',
                    event: 'game_update',
                    payload: { phase: nextPhase, isTurnActive: false, showTurnEnd: true }
                });
            } else {
                onFinish();
            }
        }
    };

    const handleSkip = () => {
        if (phase > 1) {
            setCurrentIndex((prev) => (prev + 1) % deck.length);
        }
    };

    const currentCard = deck[currentIndex];

    return (
        <div className="w-full max-w-lg h-full flex flex-col justify-between py-12 px-4 gap-8">
            <div className="bento-grid">
                <div className="glass-panel bento-item bento-item-large border-accent-primary/20">
                    <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1">{t('phase' + phase + '_title')}</span>
                    <div className="flex items-center gap-3">
                        <Users className="text-accent-primary" size={20} />
                        <span className="text-xl font-black text-white">
                            {t('team')} {currentTeam}
                        </span>
                    </div>
                </div>

                <div className={`glass-panel bento-item ${currentTeam === 1 ? 'border-accent-primary' : 'border-white/5'}`}>
                    <span className="text-[10px] text-white/40 uppercase font-bold">{t('team')} 1</span>
                    <span className="text-2xl font-black text-white">{scores.team1}</span>
                </div>

                <div className={`glass-panel bento-item ${currentTeam === 2 ? 'border-accent-primary' : 'border-white/5'}`}>
                    <span className="text-[10px] text-white/40 uppercase font-bold">{t('team')} 2</span>
                    <span className="text-2xl font-black text-white">{scores.team2}</span>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center relative">
                <AnimatePresence mode="wait">
                    {!isTurnActive && !showTurnEnd ? (
                        <motion.div
                            key="start"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex flex-col items-center gap-6"
                        >
                            <div className="w-24 h-24 rounded-full bg-accent-primary/10 flex items-center justify-center border border-accent-primary/30">
                                <Trophy className="text-accent-primary" size={40} />
                            </div>
                            <button
                                onClick={startTurn}
                                className="neon-button primary px-12 py-4 text-xl rounded-2xl"
                            >
                                READY?
                            </button>
                        </motion.div>
                    ) : isTurnActive ? (
                        <div className="w-full flex flex-col items-center gap-12">
                            <NeonTimer timeLeft={timeLeft} totalTime={30} />

                            <div className="card-swipe-container">
                                <AnimatePresence mode="popLayout">
                                    {currentCard && (
                                        <SwipeCard
                                            key={currentCard.id}
                                            name={currentCard[`name_${i18n.language}`] || currentCard.name_en}
                                            onSwipeRight={handleSuccess}
                                            onSwipeLeft={handleSkip}
                                            canSkip={phase > 1}
                                        />
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    ) : showTurnEnd ? (
                        <motion.div
                            key="end"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-panel p-8 flex flex-col items-center gap-6 w-full text-center"
                        >
                            <h3 className="text-3xl font-black text-white">{t('time_up')}</h3>
                            <p className="text-white/60">{t('next_turn')}</p>

                            <button
                                onClick={handleNextTurn}
                                className="neon-button w-full flex items-center justify-center gap-2"
                            >
                                CONTINUE <MoveRight size={18} />
                            </button>
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Game;
