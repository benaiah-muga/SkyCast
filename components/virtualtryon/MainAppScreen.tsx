/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { OutfitLayer, Garment } from '../../types';
import WardrobePanel from './WardrobePanel';
import PoseControls from './PoseControls';
import Spinner from '../Spinner';
import { generatePoseVariation, generateVirtualTryOnImage } from '../../services/geminiService';

interface MainAppScreenProps {
  baseModelImage: string;
  onStartOver: () => void;
}

const POSES = [
    'Full frontal view',
    'Walking towards camera',
    'Side view, looking left',
    '3/4 view, smiling',
    'Hands on hips',
];

const MainAppScreen: React.FC<MainAppScreenProps> = ({ baseModelImage, onStartOver }) => {
  const [outfitHistory, setOutfitHistory] = useState<OutfitLayer[]>([]);
  const [currentPose, setCurrentPose] = useState(POSES[0]);
  const [isLoading, setIsLoading] = useState<{ active: boolean, message: string }>({ active: false, message: '' });
  const [error, setError] = useState<string | null>(null);

  const currentLayer = outfitHistory[outfitHistory.length - 1];
  const currentImage = currentLayer?.poseImages[currentPose] ?? baseModelImage;
  const baseImageForNewGarment = currentLayer?.poseImages[currentPose] ?? baseModelImage;

  const handleAddGarment = async (garment: Garment) => {
    setIsLoading({ active: true, message: 'Adding garment...' });
    setError(null);
    try {
      // The `garment.thumbnail` is a data URL of the garment image
      const newTryOnImage = await generateVirtualTryOnImage(baseImageForNewGarment, garment.thumbnail);
      const newLayer: OutfitLayer = {
        garment,
        poseImages: { [currentPose]: newTryOnImage },
      };
      setOutfitHistory(prev => [...prev, newLayer]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add garment.');
    } finally {
      setIsLoading({ active: false, message: '' });
    }
  };

  const handleRemoveLastGarment = () => {
    if (outfitHistory.length > 0) {
      setOutfitHistory(prev => prev.slice(0, -1));
    }
  };

  const handleChangePose = async (newPose: string) => {
    if (newPose === currentPose) return;
    
    // If we have no outfit, we can't change pose.
    if (!currentLayer) {
        setCurrentPose(newPose); // Just update the text, no API call
        return;
    }

    // If pose is already cached for the current layer, just switch to it.
    if (currentLayer.poseImages[newPose]) {
      setCurrentPose(newPose);
      return;
    }

    setIsLoading({ active: true, message: 'Changing pose...' });
    setError(null);
    try {
      const imageForNewPose = await generatePoseVariation(currentImage, newPose);
      
      // Update the current layer in history with the new cached pose image
      const updatedLayer = {
        ...currentLayer,
        poseImages: { ...currentLayer.poseImages, [newPose]: imageForNewPose },
      };
      setOutfitHistory(prev => [...prev.slice(0, -1), updatedLayer]);
      setCurrentPose(newPose);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change pose.');
    } finally {
      setIsLoading({ active: false, message: '' });
    }
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-4 relative overflow-hidden">
      <AnimatePresence>
          {isLoading.active && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 z-40 flex flex-col items-center justify-center gap-4"
            >
              <Spinner />
              <p className="text-gray-300">{isLoading.message}</p>
            </motion.div>
          )}
          {error && (
             <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 z-40 flex flex-col items-center justify-center gap-4 p-8 text-center"
            >
                <h3 className="font-bold text-xl text-red-300">An Error Occurred</h3>
                <p className="text-sm text-red-400">{error}</p>
                <button
                    onClick={() => setError(null)}
                    className="mt-4 px-6 py-2 font-bold text-white bg-red-600 rounded-full hover:bg-red-500 transition-colors"
                >
                    Close
                </button>
            </motion.div>
          )}
      </AnimatePresence>

      {/* Main Canvas */}
      <div className="flex-grow h-full flex flex-col items-center justify-center p-4 relative">
        <div className="w-full max-w-lg aspect-[3/4] relative group">
          <AnimatePresence>
             <motion.img
                key={currentImage}
                src={currentImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full object-contain rounded-lg"
                alt="Fashion model"
            />
          </AnimatePresence>
          <PoseControls
            poses={POSES}
            currentPose={currentPose}
            onChangePose={handleChangePose}
          />
        </div>
      </div>

      {/* Side Panel */}
      <WardrobePanel
        onAddGarment={handleAddGarment}
        onRemoveLastGarment={handleRemoveLastGarment}
        onStartOver={onStartOver}
        outfitHistory={outfitHistory}
        appliedGarmentIds={outfitHistory.map(l => l.garment.id)}
      />
    </div>
  );
};

export default MainAppScreen;
