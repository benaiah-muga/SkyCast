/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LandingScreen from './components/LandingScreen';
import PhotoEditorApp from './components/PhotoEditorApp';
import VirtualTryOnApp from './components/VirtualTryOnApp';
import Header from './components/Header';

type ActiveApp = 'landing' | 'photoEditor' | 'virtualTryOn';

const App: React.FC = () => {
  const [activeApp, setActiveApp] = useState<ActiveApp>('landing');

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5,
  };

  return (
    <div className="min-h-screen text-gray-100 flex flex-col bg-gray-950">
      <Header />
      <main className="flex-grow w-full max-w-[1600px] mx-auto p-4 md:p-8 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {activeApp === 'landing' && (
            <motion.div
              key="landing"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <LandingScreen onSelectApp={setActiveApp} />
            </motion.div>
          )}
          {activeApp === 'photoEditor' && (
            <motion.div
              key="photoEditor"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="w-full"
            >
              <PhotoEditorApp onExit={() => setActiveApp('landing')} />
            </motion.div>
          )}
          {activeApp === 'virtualTryOn' && (
            <motion.div
              key="virtualTryOn"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="w-full h-full flex-grow flex"
            >
              <VirtualTryOnApp onExit={() => setActiveApp('landing')} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;
