/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { motion } from 'framer-motion';
import { EditIcon, WardrobeIcon } from './virtualtryon/icons';

interface LandingScreenProps {
  onSelectApp: (app: 'photoEditor' | 'virtualTryOn') => void;
}

const LandingScreen: React.FC<LandingScreenProps> = ({ onSelectApp }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center text-center p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center gap-6"
      >
        <motion.h1 variants={itemVariants} className="font-serif text-5xl font-bold tracking-tight text-gray-100 sm:text-6xl md:text-7xl">
          AI-Powered Creativity Suite
        </motion.h1>
        <motion.p variants={itemVariants} className="max-w-2xl text-lg text-gray-400 md:text-xl">
          Choose your experience. Retouch photos with text prompts or create a personal model to try on any outfit.
        </motion.p>
      </motion.div>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl"
      >
        <motion.div variants={itemVariants}>
          <button
            onClick={() => onSelectApp('photoEditor')}
            className="w-full h-full p-8 bg-gray-900/50 border border-gray-700 rounded-2xl text-left flex flex-col items-start gap-4 hover:border-blue-500 hover:bg-gray-900 transition-all duration-300 group"
          >
            <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
              <EditIcon className="w-8 h-8 text-blue-400" />
            </div>
            <h2 className="font-serif text-3xl font-semibold text-gray-100">Photo Editor</h2>
            <p className="text-gray-400 text-base flex-grow">
              Retouch images, apply creative filters, and make professional adjustments using simple text prompts.
            </p>
            <span className="mt-4 text-blue-400 font-semibold flex items-center gap-2">
              Launch Editor
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </span>
          </button>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <button
            onClick={() => onSelectApp('virtualTryOn')}
            className="w-full h-full p-8 bg-gray-900/50 border border-gray-700 rounded-2xl text-left flex flex-col items-start gap-4 hover:border-purple-500 hover:bg-gray-900 transition-all duration-300 group"
          >
            <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
              <WardrobeIcon className="w-8 h-8 text-purple-400" />
            </div>
            <h2 className="font-serif text-3xl font-semibold text-gray-100">Virtual Try-On</h2>
            <p className="text-gray-400 text-base flex-grow">
              Generate a personal fashion model from your photo and virtually try on different articles of clothing.
            </p>
            <span className="mt-4 text-purple-400 font-semibold flex items-center gap-2">
              Start Styling
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </span>
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LandingScreen;
