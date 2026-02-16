import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { SwipeCard } from './SwipeCard';
import { NeonTimer } from './NeonTimer';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Trophy, ChevronRight } from 'lucide-react';
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

        const channel = supabase.channel(`game:${gameId}`)
            .on('broadcast', { event: 'game_update' }, ({ payload }) => {
                if (payload.scores) setScores(payload.scores);
                if (payload.currentTeam) setCurrentTeam(payload.currentTeam);
                if (payload.phase) setPhase(payload.phase);
                if (payload.isTurnActive !== undefined) setIsTurnActive(payload.isTurnActive);
                if (payload.timeLeft !== undefined) setTimeLeft(payload.timeLeft);
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'game_cards' }, (payload) => {
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
            colors: ['#ff2d55', '#5856d6', '#34c759']
        });

        await supabase.from('game_cards').update({ status: 'guessed' }).eq('id', card.game_card_id);
        await supabase.from('games').update({ scores: newScores }).eq('id', gameId);

        channelRef.current.send({
            type: 'broadcast',
            event: 'game_update',
            payload: { scores: newScores }
        });

        if (deck.length > 1) {
            setCurrentIndex((prev) => (prev + 1) % deck.length);
        } else {
            if (phase < 3) {
                const nextPhase = phase + 1;
                setPhase(nextPhase);
                await supabase.from('game_cards').update({ status: 'deck' }).eq('game_id', gameId);
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
        <div className="flex-1 flex flex-col items-center justify-between gap-10">
            {/* Minimal Board */}
            <div className="w-full grid grid-cols-2 gap-4">
                <div className={`p-6 rounded-3xl border transition-all ${currentTeam === 1 ? 'bg-accent-primary/10 border-accent-primary' : 'bg-white/5 border-white/10'}`}>
                    <span className="block text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Team 01</span>
                    <span className="text-3xl font-black text-white">{scores.team1}</span>
                </div>
                <div className={`p-6 rounded-3xl border transition-all ${currentTeam === 2 ? 'bg-accent-primary/10 border-accent-primary' : 'bg-white/5 border-white/10'}`}>
                    <span className="block text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Team 02</span>
                    <span className="text-3xl font-black text-white">{scores.team2}</span>
                </div>
            </div>

            <div className="w-full flex-1 flex flex-col items-center justify-center relative">
                <AnimatePresence mode="wait">
                    {!isTurnActive && !showTurnEnd ? (
                        <motion.div
                            key="start"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center gap-8"
                        >
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-xs font-black text-accent-primary uppercase tracking-[0.5em]">{t('phase' + phase + '_title')}</span>
                                <h2 className="text-4xl font-black text-white text-center">Team {currentTeam}, ready?</h2>
                            </div>
                            <button
                                onClick={startTurn}
                                className="btn-primary"
                                style={{ width: 'auto', padding: '20px 60px', borderRadius: '100px' }}
                            >
                                START ROUND
                            </button>
                        </motion.div>
                    ) : isTurnActive ? (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-10">
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
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full bg-[#111418] border border-white/10 p-10 rounded-[32px] flex flex-col items-center text-center gap-8"
                        >
                            <div className="w-20 h-20 rounded-full bg-accent-primary/10 flex items-center justify-center border border-accent-primary/20">
                                <Trophy className="text-accent-primary" size={32} />
                            </div>
                            <div>
                                <h3 className="text-4xl font-black text-white mb-2">{t('time_up')}</h3>
                                <p className="text-white/40 font-medium">Next up: Team {currentTeam === 1 ? 2 : 1}</p>
                            </div>

                            <button
                                onClick={handleNextTurn}
                                className="btn-primary flex items-center justify-center gap-2"
                            >
                                NEXT TEAM <ChevronRight size={20} />
                            </button>
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Game;
