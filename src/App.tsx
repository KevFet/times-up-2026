import { useState } from 'react';
import Lobby from './components/Lobby';
import Game from './components/Game';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

function App() {
  const { t, i18n } = useTranslation();
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'finished'>('lobby');
  const [gameId, setGameId] = useState<string | null>(null);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black overflow-hidden relative">
      {/* Language Selector EN | FR | ES */}
      <div className="lang-selector-glass">
        <button
          onClick={() => changeLanguage('en')}
          className={`lang-btn-glass ${i18n.language === 'en' ? 'active' : ''}`}
        >
          EN
        </button>
        <div className="lang-divider" />
        <button
          onClick={() => changeLanguage('fr')}
          className={`lang-btn-glass ${i18n.language === 'fr' ? 'active' : ''}`}
        >
          FR
        </button>
        <div className="lang-divider" />
        <button
          onClick={() => changeLanguage('es')}
          className={`lang-btn-glass ${i18n.language === 'es' ? 'active' : ''}`}
        >
          ES
        </button>
      </div>

      <main className="w-full">
        <AnimatePresence mode="wait">
          {gameState === 'lobby' && (
            <motion.div
              key="lobby"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
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
              className="container-strict text-center"
            >
              <h1 className="title-strict">{t('finish')}</h1>
              <button
                onClick={() => setGameState('lobby')}
                className="button-strict mt-12"
              >
                {t('return_menu')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Persistent Footer */}
      <footer className="footer-strict">
        {t('footer')}
      </footer>
    </div>
  );
}

export default App;
