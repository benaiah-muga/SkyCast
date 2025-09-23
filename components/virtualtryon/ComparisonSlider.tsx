/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

interface ComparisonSliderProps {
  before: string;
  after: string;
}

const ComparisonSlider: React.FC<ComparisonSliderProps> = ({ before, after }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(position);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.currentTarget as HTMLDivElement;
    target.setPointerCapture(e.pointerId);
    const onPointerMove = (moveEvent: PointerEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = moveEvent.clientX - rect.left;
        const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setSliderPosition(position);
    };
    const onPointerUp = () => {
        target.releasePointerCapture(e.pointerId);
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
    };
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  };


  return (
    <div
      ref={containerRef}
      className="relative w-full h-full select-none overflow-hidden rounded-xl"
      onPointerDown={handlePointerDown}
    >
      <img src={before} alt="Before" className="absolute w-full h-full object-cover" draggable={false} />
      <motion.div
        className="absolute w-full h-full overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        animate={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <img src={after} alt="After" className="absolute w-full h-full object-cover" draggable={false} />
      </motion.div>
      <motion.div
        className="absolute top-0 bottom-0 w-1 bg-white/50 cursor-ew-resize"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        drag="x"
        dragConstraints={containerRef}
        dragElastic={0}
        dragMomentum={false}
        onDrag={(_, info) => {
            if(containerRef.current) {
                const newPos = (info.point.x / containerRef.current.offsetWidth) * 100;
                setSliderPosition(newPos);
            }
        }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 border-2 border-white flex items-center justify-center backdrop-blur-sm shadow-lg">
          <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        </div>
      </motion.div>
    </div>
  );
};

export default ComparisonSlider;
