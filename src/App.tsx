import { useState } from 'react';
import Lobby from './components/Lobby';
import Game from './components/Game';
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'finished'>('lobby');
  const [gameId, setGameId] = useState<string | null>(null);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black overflow-hidden">
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
              <h1 className="title-strict">FIN DU JEU</h1>
              <button
                onClick={() => setGameState('lobby')}
                className="button-strict"
              >
                RETOUR AU MENU
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
