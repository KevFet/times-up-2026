import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SwipeCard } from './SwipeCard';
import { NeonTimer } from './NeonTimer';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ChevronRight, Zap } from 'lucide-react';
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
                .select('*, card:cards(*)')
                .eq('game_id', gameId)
                .eq('status', 'deck');

            if (gameCards) {
                const mapped = gameCards.map(gc => gc.card || gc.cards).filter(Boolean);
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

        // Update card status
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
            colors: ['#ff2d55', '#5856d6', '#34c759']
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

            // Reset cards to deck for next phase
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
        <div className="flex-1 flex flex-col items-center py-2 sm:py-6 overflow-hidden">
            <div className="w-full flex justify-between items-center mb-6 sm:mb-12">
                <div className="score-pill scale-90 sm:scale-100">
                    <span className="score-label">Team 1</span>
                    <span className="score-value">{scores.team1}</span>
                </div>

                <div className="flex flex-col items-center">
                    <div className="text-[10px] font-black tracking-[0.3em] uppercase opacity-30 mb-1">Phase</div>
                    <div className="flex gap-2">
                        {[1, 2, 3].map(p => (
                            <div
                                key={p}
                                className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${p === phase ? 'bg-accent-primary scale-150 shadow-[0_0_8px_var(--accent-primary)]' : 'bg-white/10'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                <div className="score-pill scale-90 sm:scale-100">
                    <span className="score-label">Team 2</span>
                    <span className="score-value">{scores.team2}</span>
                </div>
            </div>

            <div className="flex-1 w-full flex flex-col items-center justify-center relative min-h-0">
                <AnimatePresence mode="wait">
                    {!isTurnActive && !showTurnEnd ? (
                        <motion.div
                            key="ready"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="text-center space-y-8"
                        >
                            <div className="space-y-2">
                                <span className="text-xs font-black text-accent-primary uppercase tracking-[0.5em]">{t('phase' + phase + '_info')}</span>
                                <h2 className="text-5xl font-black tracking-tighter">Team {currentTeam}<br />READY?</h2>
                            </div>
                            <button onClick={startTurn} className="btn-premium px-12 mx-auto">
                                <Zap size={20} className="fill-current" />
                                START ARENA
                            </button>
                        </motion.div>
                    ) : isTurnActive ? (
                        <motion.div
                            key="active"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="w-full flex flex-col items-center gap-4 sm:gap-8 h-full"
                        >
                            <div className="scale-75 sm:scale-100 shrink-0">
                                <NeonTimer timeLeft={timeLeft} totalTime={30} />
                            </div>

                            <div
                                className="w-full max-w-[320px] sm:max-w-sm relative shrink-0"
                                style={{ flex: 1, minHeight: '300px', maxHeight: '400px' }}
                            >
                                <SwipeCard
                                    name={cards[currentCardIndex]?.[`name_${i18n.language}`] || cards[currentCardIndex]?.name_en || '??'}
                                    onSwipeRight={handleSwipeRight}
                                    onSwipeLeft={handleSwipeLeft}
                                    canSkip={true}
                                />
                            </div>
                        </motion.div>
                    ) : showTurnEnd ? (
                        <motion.div
                            key="end"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center space-y-8"
                        >
                            <div className="space-y-2">
                                <h3 className="text-6xl font-black tracking-tighter uppercase">TIME'S UP</h3>
                                <p className="text-text-secondary font-bold tracking-widest uppercase text-sm">Transferring Controls...</p>
                            </div>

                            <div className="p-8 bg-white/5 border border-white/10 rounded-[32px] backdrop-blur-xl">
                                <p className="text-white/40 text-xs font-black uppercase tracking-widest mb-2">Next Commander</p>
                                <p className="text-3xl font-black">Team {currentTeam === 1 ? 2 : 1}</p>
                            </div>

                            <button onClick={handleNextTurn} className="btn-premium px-12 mx-auto">
                                <span>Proceed</span>
                                <ChevronRight size={20} />
                            </button>
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Game;
