/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { OutfitLayer, Garment } from '../../types';
import { UploadIcon, TrashIcon, RestartIcon } from './icons';
import { DEFAULT_GARMENTS } from './defaultGarments';

interface WardrobePanelProps {
  onAddGarment: (garment: Garment) => void;
  onRemoveLastGarment: () => void;
  onStartOver: () => void;
  outfitHistory: OutfitLayer[];
  appliedGarmentIds: string[];
}

const WardrobePanel: React.FC<WardrobePanelProps> = ({
  onAddGarment, onRemoveLastGarment, onStartOver, outfitHistory, appliedGarmentIds
}) => {
    
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newGarment: Garment = {
          id: `custom-${Date.now()}`,
          name: file.name.split('.')[0],
          thumbnail: e.target?.result as string,
        };
        onAddGarment(newGarment);
      };
      reader.readAsDataURL(file);
    }
  };
    
  return (
    <div className="w-full md:w-96 bg-gray-900 border-l border-gray-800 flex flex-col p-4 md:p-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-2xl font-bold">My Outfit</h2>
        <button onClick={onStartOver} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
            <RestartIcon className="w-4 h-4" />
            Start Over
        </button>
      </div>

      {/* Outfit Stack */}
      <div className="flex-grow">
        <ul className="space-y-2">
            <li className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg">
                <div className="w-12 h-12 bg-gray-700 rounded-md flex-shrink-0"></div>
                <span className="font-semibold">Base Model</span>
            </li>
            {outfitHistory.map((layer, index) => (
                <li key={layer.garment.id} className="flex items-center gap-4 p-3 bg-gray-800 rounded-lg">
                    <img src={layer.garment.thumbnail} alt={layer.garment.name} className="w-12 h-12 object-contain rounded-md flex-shrink-0" />
                    <span className="font-semibold flex-grow">{layer.garment.name}</span>
                    {index === outfitHistory.length - 1 && (
                        <button onClick={onRemoveLastGarment} className="p-2 text-gray-400 hover:text-red-400 rounded-full hover:bg-red-500/10 transition-colors">
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    )}
                </li>
            ))}
        </ul>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-800">
         <h3 className="font-serif text-2xl font-bold mb-4">Wardrobe</h3>
         <div className="grid grid-cols-3 gap-3">
            {DEFAULT_GARMENTS.map(garment => {
                const isApplied = appliedGarmentIds.includes(garment.id);
                return (
                    <button 
                        key={garment.id} 
                        onClick={() => onAddGarment(garment)}
                        disabled={isApplied}
                        className="aspect-square bg-gray-800 p-2 rounded-lg border-2 border-transparent hover:border-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-transparent group relative"
                    >
                        <img src={garment.thumbnail} alt={garment.name} className="w-full h-full object-contain" />
                        {isApplied && <div className="absolute inset-0 bg-black/60 rounded-md flex items-center justify-center text-xs font-bold">APPLIED</div>}
                    </button>
                )
            })}
             <label className="aspect-square bg-gray-800 p-2 rounded-lg border-2 border-dashed border-gray-700 hover:border-purple-500 hover:bg-gray-700/50 transition-colors cursor-pointer flex flex-col items-center justify-center text-gray-400 text-xs text-center">
                 <UploadIcon className="w-6 h-6 mb-1" />
                 Upload
                 <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
             </label>
         </div>
      </div>
    </div>
  );
};

export default WardrobePanel;
