import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SwipeCard } from './SwipeCard';
import { NeonTimer } from './NeonTimer';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { supabase } from '../lib/supabase';

interface GameProps {
    gameId: string;
    onFinish: () => void;
}

const Game: React.FC<GameProps> = ({ gameId, onFinish }) => {
    const { t, i18n } = useTranslation();
    const [phase, setPhase] = useState(1);
    const [currentTeam, setCurrentTeam] = useState(1);
    const [scores, setScores] = useState({ team1: 0, team2: 0 });
    const [cards, setCards] = useState<any[]>([]);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isTurnActive, setIsTurnActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30);
    const [showTurnEnd, setShowTurnEnd] = useState(false);

    useEffect(() => {
        const fetchGameData = async () => {
            const { data: game } = await supabase
                .from('games')
                .select('*')
                .eq('id', gameId)
                .single();

            if (game) {
                setScores(game.scores);
                setCurrentTeam(game.current_team);
                setPhase(game.phase || 1);
            }

            const { data: gameCards } = await supabase
                .from('game_cards')
                .select('*, cards(*)')
                .eq('game_id', gameId)
                .eq('status', 'deck');

            if (gameCards) {
                const mapped = gameCards.map(gc => gc.cards).filter(Boolean);
                setCards(mapped.sort(() => 0.5 - Math.random()));
            }
        };

        fetchGameData();

        const subscription = supabase
            .channel(`game-${gameId}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${gameId}` }, (payload) => {
                setScores(payload.new.scores);
                setCurrentTeam(payload.new.current_team);
                setPhase(payload.new.phase || 1);
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [gameId]);

    useEffect(() => {
        let timer: any;
        if (isTurnActive && timeLeft > 0) {
            timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (timeLeft === 0 && isTurnActive) {
            setIsTurnActive(false);
            setShowTurnEnd(true);
        }
        return () => clearInterval(timer);
    }, [isTurnActive, timeLeft]);

    const startTurn = () => {
        setTimeLeft(30);
        setIsTurnActive(true);
        setShowTurnEnd(false);
    };

    const handleSwipeRight = async () => {
        const card = cards[currentCardIndex];
        const newTeam1Score = currentTeam === 1 ? scores.team1 + 1 : scores.team1;
        const newTeam2Score = currentTeam === 2 ? scores.team2 + 1 : scores.team2;

        const newScores = { team1: newTeam1Score, team2: newTeam2Score };
        setScores(newScores);

        await supabase.from('games').update({ scores: newScores }).eq('id', gameId);

        await supabase
            .from('game_cards')
            .update({ status: 'guessed' })
            .eq('game_id', gameId)
            .eq('card_id', card.id);

        if (currentCardIndex + 1 >= cards.length) {
            handlePhaseEnd();
        } else {
            setCurrentCardIndex(prev => prev + 1);
        }

        confetti({
            particleCount: 40,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#ff0000', '#ffffff']
        });
    };

    const handleSwipeLeft = () => {
        const newCards = [...cards];
        const skippedCard = newCards.splice(currentCardIndex, 1)[0];
        newCards.push(skippedCard);
        setCards(newCards);
    };

    const handlePhaseEnd = async () => {
        if (phase >= 3) {
            onFinish();
        } else {
            const nextPhase = phase + 1;
            setPhase(nextPhase);
            await supabase.from('games').update({ phase: nextPhase }).eq('id', gameId);

            await supabase
                .from('game_cards')
                .update({ status: 'deck' })
                .eq('game_id', gameId);

            const { data: resetCards } = await supabase
                .from('game_cards')
                .select('*, cards(*)')
                .eq('game_id', gameId)
                .eq('status', 'deck');

            if (resetCards) {
                setCards(resetCards.map(gc => gc.cards).sort(() => 0.5 - Math.random()));
                setCurrentCardIndex(0);
                setIsTurnActive(false);
                setShowTurnEnd(true);
            }
        }
    };

    const handleNextTurn = async () => {
        const nextTeam = currentTeam === 1 ? 2 : 1;
        setCurrentTeam(nextTeam);
        await supabase.from('games').update({ current_team: nextTeam }).eq('id', gameId);
        setShowTurnEnd(false);
        setTimeLeft(30);
    };

    return (
        <div className="container-strict">
            <div className="flex justify-between items-center w-full">
                <div className="flex flex-col items-center">
                    <span className="text-[10px] uppercase opacity-40">{t('team')} 1</span>
                    <span className="text-2xl font-black">{scores.team1}</span>
                </div>

                <div className="flex flex-col items-center">
                    <span className="text-[10px] uppercase opacity-40">{t('phase')} {phase}</span>
                    <div className="flex gap-1 mt-1">
                        {[1, 2, 3].map(p => (
                            <div key={p} className={`w-1.5 h-1.5 rounded-full ${p <= phase ? 'bg-[#ff0000]' : 'bg-[#222222]'}`} />
                        ))}
                    </div>
                </div>

                <div className="flex flex-col items-center">
                    <span className="text-[10px] uppercase opacity-40">{t('team')} 2</span>
                    <span className="text-2xl font-black">{scores.team2}</span>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
                <AnimatePresence mode="wait">
                    {!isTurnActive && !showTurnEnd ? (
                        <motion.div
                            key="ready"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center flex flex-col gap-6 w-full"
                        >
                            <h2 className="title-strict">{t('team')} {currentTeam}</h2>
                            <button onClick={startTurn} className="button-strict">
                                {t('start_game')}
                            </button>
                        </motion.div>
                    ) : isTurnActive ? (
                        <motion.div
                            key="active"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="w-full flex flex-col items-center gap-8"
                        >
                            <NeonTimer timeLeft={timeLeft} totalTime={30} />

                            <div className="w-full relative h-[300px]">
                                <SwipeCard
                                    name={cards[currentCardIndex]?.[`name_${i18n.language}`] || cards[currentCardIndex]?.name_es || cards[currentCardIndex]?.name_en || '??'}
                                    onSwipeRight={handleSwipeRight}
                                    onSwipeLeft={handleSwipeLeft}
                                    canSkip={true}
                                />
                            </div>
                        </motion.div>
                    ) : showTurnEnd ? (
                        <motion.div
                            key="end"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center flex flex-col gap-6 w-full"
                        >
                            <h2 className="title-strict">{t('change')}</h2>
                            <div className="bg-[#121212] border border-[#222222] p-6 rounded-[12px]">
                                <p className="text-[#444444] text-[10px] font-black uppercase tracking-widest mb-1">{t('next_turn')}</p>
                                <p className="text-2xl font-black">{t('team')} {currentTeam === 1 ? 2 : 1}</p>
                            </div>
                            <button onClick={handleNextTurn} className="button-strict">
                                {t('continue')}
                            </button>
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Game;
