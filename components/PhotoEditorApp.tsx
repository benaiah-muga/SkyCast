/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import { generateEditedImage, generateFilteredImage, generateAdjustedImage, removeBackgroundImage } from '../services/geminiService';
import Header from './Header';
import Spinner from './Spinner';
import FilterPanel from './FilterPanel';
import AdjustmentPanel from './AdjustmentPanel';
import CropPanel from './CropPanel';
import { UndoIcon, RedoIcon, EyeIcon, HomeIcon } from './icons';
import StartScreen from './StartScreen';

// Helper to convert a data URL string to a File object
const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    if (arr.length < 2) throw new Error("Invalid data URL");
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch || !mimeMatch[1]) throw new Error("Could not parse MIME type from data URL");

    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
}

type Tab = 'retouch' | 'adjust' | 'filters' | 'crop';

interface PhotoEditorAppProps {
  onExit: () => void;
}

const PhotoEditorApp: React.FC<PhotoEditorAppProps> = ({ onExit }) => {
  const [history, setHistory] = useState<File[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editHotspot, setEditHotspot] = useState<{ x: number, y: number } | null>(null);
  const [displayHotspot, setDisplayHotspot] = useState<{ x: number, y: number } | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('retouch');
  
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>();
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const currentImage = history[historyIndex] ?? null;
  const originalImage = history[0] ?? null;

  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (currentImage) {
      const url = URL.createObjectURL(currentImage);
      setCurrentImageUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setCurrentImageUrl(null);
    }
  }, [currentImage]);
  
  useEffect(() => {
    if (originalImage) {
      const url = URL.createObjectURL(originalImage);
      setOriginalImageUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setOriginalImageUrl(null);
    }
  }, [originalImage]);


  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const addImageToHistory = useCallback((newImageFile: File) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newImageFile);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCrop(undefined);
    setCompletedCrop(undefined);
  }, [history, historyIndex]);

  const handleImageUpload = useCallback((file: File) => {
    setError(null);
    setHistory([file]);
    setHistoryIndex(0);
    setEditHotspot(null);
    setDisplayHotspot(null);
    setActiveTab('retouch');
    setCrop(undefined);
    setCompletedCrop(undefined);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!currentImage) return;
    if (!prompt.trim() || !editHotspot) return;

    setIsLoading(true);
    setError(null);
    
    try {
        const editedImageUrl = await generateEditedImage(currentImage, prompt, editHotspot);
        const newImageFile = dataURLtoFile(editedImageUrl, `edited-${Date.now()}.png`);
        addImageToHistory(newImageFile);
        setEditHotspot(null);
        setDisplayHotspot(null);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
        setIsLoading(false);
    }
  }, [currentImage, prompt, editHotspot, addImageToHistory]);
  
  const handleApplyFilter = useCallback(async (filterPrompt: string) => {
    if (!currentImage) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
        const filteredImageUrl = await generateFilteredImage(currentImage, filterPrompt);
        const newImageFile = dataURLtoFile(filteredImageUrl, `filtered-${Date.now()}.png`);
        addImageToHistory(newImageFile);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
        setIsLoading(false);
    }
  }, [currentImage, addImageToHistory]);
  
  const handleApplyAdjustment = useCallback(async (adjustmentPrompt: string) => {
    if (!currentImage) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
        let adjustedImageUrl: string;
        if (adjustmentPrompt === '__REMOVE_BACKGROUND__') {
            adjustedImageUrl = await removeBackgroundImage(currentImage);
        } else {
            adjustedImageUrl = await generateAdjustedImage(currentImage, adjustmentPrompt);
        }
        const newImageFile = dataURLtoFile(adjustedImageUrl, `adjusted-${Date.now()}.png`);
        addImageToHistory(newImageFile);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
        setIsLoading(false);
    }
  }, [currentImage, addImageToHistory]);

  const handleApplyCrop = useCallback(() => {
    if (!completedCrop || !imgRef.current) return;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        setError('Could not process the crop.');
        return;
    }

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      // FIX: Use `completedCrop` instead of `completed`
      completedCrop.height * scaleY,
      0, 0,
      completedCrop.width, completedCrop.height,
    );
    
    const croppedImageUrl = canvas.toDataURL('image/png');
    const newImageFile = dataURLtoFile(croppedImageUrl, `cropped-${Date.now()}.png`);
    addImageToHistory(newImageFile);

  }, [completedCrop, addImageToHistory]);

  const handleUndo = useCallback(() => canUndo && setHistoryIndex(historyIndex - 1), [canUndo, historyIndex]);
  const handleRedo = useCallback(() => canRedo && setHistoryIndex(historyIndex + 1), [canRedo, historyIndex]);
  const handleReset = useCallback(() => history.length > 0 && setHistoryIndex(0), [history]);
  const handleUploadNew = useCallback(() => { setHistory([]); setHistoryIndex(-1); }, []);

  const handleDownload = useCallback(() => {
      if (currentImage) {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(currentImage);
          link.download = `edited-${currentImage.name}`;
          link.click();
          URL.revokeObjectURL(link.href);
      }
  }, [currentImage]);
  
  const handleFileSelect = (files: FileList | null) => files?.[0] && handleImageUpload(files[0]);

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (activeTab !== 'retouch') return;
    
    const img = e.currentTarget;
    const rect = img.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    setDisplayHotspot({ x: offsetX, y: offsetY });

    const scaleX = img.naturalWidth / img.clientWidth;
    const scaleY = img.naturalHeight / img.clientHeight;
    setEditHotspot({ x: Math.round(offsetX * scaleX), y: Math.round(offsetY * scaleY) });
  };

  if (error) {
     return (
         <div className="text-center animate-fade-in bg-red-900/20 border border-red-500/30 p-8 rounded-lg max-w-2xl mx-auto flex flex-col items-center gap-4">
          <h2 className="text-2xl font-bold text-red-300">An Error Occurred</h2>
          <p className="text-md text-red-400">{error}</p>
          <button onClick={() => setError(null)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg text-md transition-colors">Try Again</button>
        </div>
      );
  }
  
  if (!currentImageUrl) {
    return <StartScreen onFileSelect={handleFileSelect} />;
  }

  const imageDisplay = (
    <div className="relative">
      {originalImageUrl && <img src={originalImageUrl} alt="Original" className="w-full h-auto object-contain max-h-[60vh] rounded-xl pointer-events-none" />}
      <img
          ref={imgRef}
          src={currentImageUrl}
          alt="Current"
          onClick={handleImageClick}
          className={`absolute top-0 left-0 w-full h-auto object-contain max-h-[60vh] rounded-xl transition-opacity duration-200 ease-in-out ${isComparing ? 'opacity-0' : 'opacity-100'} ${activeTab === 'retouch' ? 'cursor-crosshair' : ''}`}
      />
    </div>
  );
  
  const cropImageElement = (
    <img ref={imgRef} src={currentImageUrl} alt="Crop" className="w-full h-auto object-contain max-h-[60vh] rounded-xl" />
  );

  return (
    <div className="w-full flex flex-col items-center gap-6">
       <div className="w-full flex justify-start">
            <button 
                onClick={onExit}
                className="flex items-center justify-center text-center bg-gray-800 border border-gray-700 text-gray-200 font-semibold py-2 px-4 rounded-md transition-all duration-200 ease-in-out hover:bg-gray-700 hover:border-gray-600 active:scale-95 text-sm"
                aria-label="Back to home"
            >
                <HomeIcon className="w-4 h-4 mr-2" />
                Back to Home
            </button>
        </div>

      <div className="relative w-full max-w-4xl shadow-2xl rounded-xl overflow-hidden bg-black/20">
          {isLoading && (
              <div className="absolute inset-0 bg-black/70 z-30 flex flex-col items-center justify-center gap-4 animate-fade-in">
                  <Spinner />
                  <p className="text-gray-300">AI is working its magic...</p>
              </div>
          )}
          
          {activeTab === 'crop' ? (
            <ReactCrop crop={crop} onChange={setCrop} onComplete={setCompletedCrop} aspect={aspect} className="max-h-[60vh]">
              {cropImageElement}
            </ReactCrop>
          ) : imageDisplay }

          {displayHotspot && !isLoading && activeTab === 'retouch' && (
              <div 
                  className="absolute rounded-full w-6 h-6 bg-blue-500/50 border-2 border-white pointer-events-none -translate-x-1/2 -translate-y-1/2 z-10"
                  style={{ left: `${displayHotspot.x}px`, top: `${displayHotspot.y}px` }}
              >
                  <div className="absolute inset-0 rounded-full w-6 h-6 animate-ping bg-blue-400"></div>
              </div>
          )}
      </div>
      
      <div className="w-full max-w-4xl bg-gray-800/80 border border-gray-700/80 rounded-lg p-2 flex items-center justify-center gap-2 backdrop-blur-sm">
          {(['retouch', 'crop', 'adjust', 'filters'] as Tab[]).map(tab => (
               <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full capitalize font-semibold py-3 px-5 rounded-md transition-all duration-200 text-base ${
                      // FIX: Use `activeTab` instead of `activeApp`
                      activeTab === tab 
                      ? 'bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-lg shadow-cyan-500/40' 
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
              >
                  {tab}
              </button>
          ))}
      </div>
      
      <div className="w-full max-w-4xl">
          {activeTab === 'retouch' && (
              <div className="flex flex-col items-center gap-4">
                  <p className="text-md text-gray-400">
                      {editHotspot ? 'Great! Now describe your localized edit below.' : 'Click an area on the image to make a precise edit.'}
                  </p>
                  <form onSubmit={(e) => { e.preventDefault(); handleGenerate(); }} className="w-full flex items-center gap-2">
                      <input
                          type="text"
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          placeholder={editHotspot ? "e.g., 'change my shirt color to blue'" : "First click a point on the image"}
                          className="flex-grow bg-gray-800 border border-gray-700 text-gray-200 rounded-lg p-5 text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition w-full disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={isLoading || !editHotspot}
                      />
                      <button 
                          type="submit"
                          className="bg-gradient-to-br from-blue-600 to-blue-500 text-white font-bold py-5 px-8 text-lg rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-px active:scale-95 disabled:from-gray-700 disabled:to-gray-600 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
                          disabled={isLoading || !prompt.trim() || !editHotspot}
                      >
                          Generate
                      </button>
                  </form>
              </div>
          )}
          {activeTab === 'crop' && <CropPanel onApplyCrop={handleApplyCrop} onSetAspect={setAspect} isLoading={isLoading} isCropping={!!completedCrop?.width} />}
          {activeTab === 'adjust' && <AdjustmentPanel onApplyAdjustment={handleApplyAdjustment} isLoading={isLoading} />}
          {activeTab === 'filters' && <FilterPanel onApplyFilter={handleApplyFilter} isLoading={isLoading} />}
      </div>
      
      <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <button onClick={handleUndo} disabled={!canUndo} className="flex items-center justify-center bg-gray-700/60 text-gray-200 font-semibold py-3 px-5 rounded-md transition-colors hover:bg-gray-600/80 disabled:opacity-50 disabled:cursor-not-allowed">
              <UndoIcon className="w-5 h-5 mr-2" /> Undo
          </button>
          <button onClick={handleRedo} disabled={!canRedo} className="flex items-center justify-center bg-gray-700/60 text-gray-200 font-semibold py-3 px-5 rounded-md transition-colors hover:bg-gray-600/80 disabled:opacity-50 disabled:cursor-not-allowed">
              <RedoIcon className="w-5 h-5 mr-2" /> Redo
          </button>
          
          <div className="h-6 w-px bg-gray-600 mx-1 hidden sm:block"></div>

          {canUndo && (
            <button 
                onMouseDown={() => setIsComparing(true)} onMouseUp={() => setIsComparing(false)}
                onMouseLeave={() => setIsComparing(false)} onTouchStart={() => setIsComparing(true)}
                onTouchEnd={() => setIsComparing(false)}
                className="flex items-center justify-center bg-gray-700/60 text-gray-200 font-semibold py-3 px-5 rounded-md transition-colors hover:bg-gray-600/80"
                aria-label="Hold to compare"
            >
                <EyeIcon className="w-5 h-5 mr-2" /> Compare
            </button>
          )}

          <button onClick={handleReset} disabled={!canUndo} className="bg-gray-700/60 text-gray-200 font-semibold py-3 px-5 rounded-md transition-colors hover:bg-gray-600/80 disabled:opacity-50 disabled:cursor-not-allowed">
              Reset
          </button>
          <button onClick={handleUploadNew} className="bg-gray-700/60 text-gray-200 font-semibold py-3 px-5 rounded-md transition-colors hover:bg-gray-600/80">
              Upload New
          </button>

          <button onClick={handleDownload} className="flex-grow sm:flex-grow-0 ml-auto bg-gradient-to-br from-green-600 to-green-500 text-white font-bold py-3 px-5 rounded-md transition-transform hover:scale-105">
              Download Image
          </button>
      </div>
    </div>
  );
};

export default PhotoEditorApp;