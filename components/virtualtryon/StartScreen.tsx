/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { generateModelImage } from '../../services/geminiService';
import ComparisonSlider from './ComparisonSlider';
import Spinner from '../Spinner';
import { UploadIcon, AlertTriangleIcon, HomeIcon } from './icons';

interface StartScreenProps {
  onModelGenerated: (imageUrl: string) => void;
  onExit: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onModelGenerated, onExit }) => {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>('/before-example.webp');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>('/after-example.webp');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setOriginalImage(file);
      const url = URL.createObjectURL(file);
      setOriginalImageUrl(url);
      setGeneratedImageUrl(null); // Clear previous generation
      setError(null);
      await generateModel(file);
    }
  };

  const generateModel = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const resultUrl = await generateModelImage(file);
      setGeneratedImageUrl(resultUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during model generation.');
      setGeneratedImageUrl(null); // Ensure no old image is shown on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseDifferentPhoto = () => {
    setOriginalImage(null);
    setOriginalImageUrl('/before-example.webp');
    setGeneratedImageUrl('/after-example.webp');
    setError(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col items-center p-4">
      <div className="w-full flex justify-start mb-6">
            <button 
                onClick={onExit}
                className="flex items-center justify-center text-center bg-gray-800 border border-gray-700 text-gray-200 font-semibold py-2 px-4 rounded-md transition-all duration-200 ease-in-out hover:bg-gray-700 hover:border-gray-600 active:scale-95 text-sm"
                aria-label="Back to home"
            >
                <HomeIcon className="w-4 h-4 mr-2" />
                Back to Home
            </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full">
        <div className="flex flex-col justify-center text-center lg:text-left items-center lg:items-start">
          <h1 className="font-serif text-5xl md:text-6xl font-bold">Create Your Model for Any Look</h1>
          <p className="mt-6 text-lg text-gray-400 max-w-md">
            Upload a single photo and our AI will generate a personal, full-body fashion model, ready for a virtual fitting.
          </p>
          <p className="mt-4 text-xs text-gray-500 max-w-md">
            Disclaimer: This tool is for creative and personal use only. Please use it responsibly and respect individual privacy.
          </p>
          {!originalImage && (
            <label className="mt-8 relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-purple-600 rounded-full cursor-pointer group hover:bg-purple-500 transition-colors">
              <UploadIcon className="w-6 h-6 mr-3" />
              Upload Photo
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>
          )}

          {generatedImageUrl && !isLoading && (
            <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="mt-8 flex flex-col sm:flex-row gap-4 w-full justify-center lg:justify-start">
                <button
                    onClick={handleUseDifferentPhoto}
                    className="px-8 py-4 text-lg font-bold text-white bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
                >
                    Use Different Photo
                </button>
                <button
                    onClick={() => onModelGenerated(generatedImageUrl)}
                    className="px-8 py-4 text-lg font-bold text-white bg-purple-600 rounded-full hover:bg-purple-500 transition-colors"
                >
                    Proceed to Styling →
                </button>
            </motion.div>
          )}

        </div>
        
        <div className="w-full max-w-sm mx-auto aspect-[3/4] rounded-2xl overflow-hidden bg-gray-900 flex items-center justify-center border border-gray-800">
          {isLoading ? (
            <div className="flex flex-col items-center gap-4 text-gray-400">
              <Spinner />
              <span>Generating your model...</span>
            </div>
          ) : error ? (
            <div className="p-8 text-center flex flex-col items-center gap-4 text-red-400">
                <AlertTriangleIcon className="w-12 h-12 text-red-500" />
                <h3 className="font-bold text-xl text-red-300">Generation Failed</h3>
                <p className="text-sm">{error}</p>
                <button
                    onClick={handleUseDifferentPhoto}
                    className="mt-4 px-6 py-2 font-bold text-white bg-red-600 rounded-full hover:bg-red-500 transition-colors"
                >
                    Try Again
                </button>
            </div>
          ) : (
            originalImageUrl && generatedImageUrl && <ComparisonSlider before={originalImageUrl} after={generatedImageUrl} />
          )}
        </div>
      </div>
    </div>
  );
};

export default StartScreen;