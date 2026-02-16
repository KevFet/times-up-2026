import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './i18n';
import Game from './components/Game';
import Setup from './components/Setup';
import Lobby from './components/Lobby';
import { RulesModal } from './components/RulesModal';
import { HelpCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  const { t, i18n } = useTranslation();
  const [gameState, setGameState] = useState<'lobby' | 'setup' | 'playing' | 'finished'>('lobby');
  const [showRules, setShowRules] = useState(false);
  const [gameId, setGameId] = useState<string | null>(null);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  useEffect(() => {
    // Attempt to make full screen
    const requestFullScreen = () => {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => { });
      }
    };

    document.addEventListener('touchstart', requestFullScreen, { once: true });
  }, []);

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex flex-col items-center justify-center p-4">
      <div className="mesh-gradient-bg" />

      {/* HUD / Header */}
      <div className="fixed top-6 left-0 right-0 px-6 flex justify-between items-center z-50">
        <div className="flex gap-2">
          {['fr', 'en', 'es_mx'].map((lng) => (
            <button
              key={lng}
              onClick={() => changeLanguage(lng)}
              className={`lang-btn ${i18n.language === lng ? 'active' : ''}`}
            >
              {lng.toUpperCase()}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowRules(true)}
          className="glass-panel p-2 flex items-center justify-center text-white/80 hover:text-white transition-colors"
        >
          <HelpCircle size={24} />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'lobby' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full flex justify-center"
          >
            <Lobby
              onGameCreated={(id) => {
                setGameId(id);
                setGameState('setup');
              }}
              onJoinGame={(id) => {
                setGameId(id);
                setGameState('playing');
              }}
            />
          </motion.div>
        )}

        {gameState === 'setup' && gameId && (
          <Setup
            gameId={gameId}
            onComplete={() => setGameState('playing')}
          />
        )}

        {gameState === 'playing' && gameId && (
          <Game
            gameId={gameId}
            onFinish={() => setGameState('finished')}
          />
        )}
      </AnimatePresence>

      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
    </div>
  );
}

export default App;
