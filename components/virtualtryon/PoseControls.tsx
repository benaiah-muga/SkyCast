/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

interface PoseControlsProps {
  poses: string[];
  currentPose: string;
  onChangePose: (newPose: string) => void;
}

const PoseControls: React.FC<PoseControlsProps> = ({ poses, currentPose, onChangePose }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const currentIndex = poses.indexOf(currentPose);

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % poses.length;
    onChangePose(poses[nextIndex]);
  };

  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + poses.length) % poses.length;
    onChangePose(poses[prevIndex]);
  };
  
  const handleSelectPose = (pose: string) => {
    onChangePose(pose);
    setIsMenuOpen(false);
  };

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md border border-white/20 rounded-full p-2 shadow-lg">
        <button onClick={handlePrev} className="p-2 rounded-full hover:bg-white/20 transition-colors">
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <div className="relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="px-4 py-2 text-sm font-semibold whitespace-nowrap"
          >
            {currentPose}
          </button>
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden"
              >
                <ul className="py-1">
                  {poses.map(pose => (
                    <li key={pose}>
                      <button
                        onClick={() => handleSelectPose(pose)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-purple-500/50 transition-colors ${pose === currentPose ? 'bg-purple-600/80' : ''}`}
                      >
                        {pose}
                      </button>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button onClick={handleNext} className="p-2 rounded-full hover:bg-white/20 transition-colors">
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default PoseControls;
