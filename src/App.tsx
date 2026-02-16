import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Lobby from './components/Lobby';
import Game from './components/Game';
import { RulesModal } from './components/RulesModal';
import { AnimatePresence, motion } from 'framer-motion';
import { HelpCircle, Zap } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'es_mx', label: 'Español', flag: '🇲🇽' }
];

function App() {
  const { i18n } = useTranslation();
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'finished'>('lobby');
  const [showRules, setShowRules] = useState(false);
  const [gameId, setGameId] = useState<string | null>(null);

  useEffect(() => {
    // Force fullscreen on mobile for better UX
    const requestFullscreen = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => { });
      }
    };
    document.addEventListener('click', requestFullscreen, { once: true });
  }, []);

  return (
    <div className="app-container">
      <div className="mesh-bg" />

      <header className="header shrink-0">
        <div className="logo-container">
          <Zap className="logo-icon" strokeWidth={3} />
          <span className="logo-text">Time's Up</span>
        </div>

        <div className="header-actions">
          <button
            onClick={() => setShowRules(true)}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
          >
            <HelpCircle size={18} />
          </button>

          <div className="lang-selector">
            {LANGUAGES.map((lng) => (
              <button
                key={lng.code}
                onClick={() => i18n.changeLanguage(lng.code)}
                className={`lang-btn ${i18n.language === lng.code ? 'active' : ''}`}
              >
                <span>{lng.flag}</span>
                <span className="hidden sm:inline ml-2">{lng.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          {gameState === 'lobby' && (
            <motion.div
              key="lobby"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="h-full flex flex-col"
            >
              <Lobby
                onGameCreated={(id) => {
                  setGameId(id);
                  setGameState('playing');
                }}
                onJoinGame={(id) => {
                  setGameId(id);
                  setGameState('playing');
                }}
              />
            </motion.div>
          )}

          {gameState === 'playing' && gameId && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="h-full flex flex-col"
            >
              <Game
                gameId={gameId}
                onFinish={() => setGameState('finished')}
              />
            </motion.div>
          )}

          {gameState === 'finished' && (
            <motion.div
              key="finished"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-6"
            >
              <div className="w-24 h-24 rounded-full bg-accent-success/20 flex items-center justify-center">
                <Zap size={48} className="text-accent-success fill-accent-success" />
              </div>
              <h1 className="text-5xl font-black tracking-tighter">ARENA EMPTY</h1>
              <p className="text-text-secondary">The cards have been vanquished.</p>
              <button
                onClick={() => setGameState('lobby')}
                className="btn-premium px-12"
              >
                Return to Base
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
