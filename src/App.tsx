import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './i18n';
import Game from './components/Game';
import Setup from './components/Setup';
import Lobby from './components/Lobby';
import { RulesModal } from './components/RulesModal';
import { HelpCircle, Zap } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  const { i18n } = useTranslation();
  const [gameState, setGameState] = useState<'lobby' | 'setup' | 'playing' | 'finished'>('lobby');
  const [showRules, setShowRules] = useState(false);
  const [gameId, setGameId] = useState<string | null>(null);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  useEffect(() => {
    const requestFullScreen = () => {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => { });
      }
    };
    document.addEventListener('touchstart', requestFullScreen, { once: true });
  }, []);

  return (
    <div className="app-container">
      <div className="mesh-bg" />

      <header className="header">
        <div className="logo-container">
          <Zap className="logo-icon" strokeWidth={3} />
          <span className="logo-text">Time's Up</span>
        </div>

        <div className="header-actions">
          <button
            onClick={() => setShowRules(true)}
            className="icon-btn"
          >
            <HelpCircle size={20} />
          </button>

          <div className="lang-selector">
            {[
              { code: 'en', label: 'English', flag: '🇺🇸' },
              { code: 'fr', label: 'Français', flag: '🇫🇷' },
              { code: 'es_mx', label: 'Español', flag: '🇲🇽' }
            ].map((lng) => (
              <button
                key={lng.code}
                onClick={() => changeLanguage(lng.code)}
                className={`lang-btn ${i18n.language === lng.code ? 'active' : ''}`}
              >
                <span>{lng.flag}</span>
                <span className="hidden md:inline">{lng.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center py-10">
        <AnimatePresence mode="wait">
          {gameState === 'lobby' && (
            <motion.div
              key="lobby"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
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

          {gameState === 'finished' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-6"
            >
              <h2 className="text-5xl font-black text-white">GAME OVER</h2>
              <button
                onClick={() => setGameState('lobby')}
                className="btn-primary max-w-xs"
              >
                PLAY AGAIN
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
    </div>
  );
}

export default App;
