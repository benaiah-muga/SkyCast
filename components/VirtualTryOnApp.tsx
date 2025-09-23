/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StartScreen from './virtualtryon/StartScreen';
import MainAppScreen from './virtualtryon/MainAppScreen';

interface VirtualTryOnAppProps {
  onExit: () => void;
}

const VirtualTryOnApp: React.FC<VirtualTryOnAppProps> = ({ onExit }) => {
  const [screen, setScreen] = useState<'start' | 'main'>('start');
  const [modelImage, setModelImage] = useState<string | null>(null);

  const handleModelGenerated = (generatedImageUrl: string) => {
    setModelImage(generatedImageUrl);
    setScreen('main');
  };
  
  const handleStartOver = () => {
      setModelImage(null);
      setScreen('start');
  }

  const screenVariants = {
    initial: { opacity: 0, scale: 0.95 },
    in: { opacity: 1, scale: 1 },
    out: { opacity: 0, scale: 0.95 },
  };

  return (
    <div className="w-full h-full flex flex-col">
       <AnimatePresence mode="wait">
        {screen === 'start' && (
          <motion.div
            key="start"
            initial="initial"
            animate="in"
            exit="out"
            variants={screenVariants}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="w-full"
          >
            <StartScreen onModelGenerated={handleModelGenerated} onExit={onExit} />
          </motion.div>
        )}
        {screen === 'main' && modelImage && (
           <motion.div
            key="main"
            initial="initial"
            animate="in"
            exit="out"
            variants={screenVariants}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="w-full h-full flex-grow flex"
          >
            <MainAppScreen baseModelImage={modelImage} onStartOver={handleStartOver} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VirtualTryOnApp;
