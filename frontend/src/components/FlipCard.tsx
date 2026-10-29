import { useState, useEffect } from 'react';
import { type Flashcard } from '../api/client';
import { RotateCw, Check } from 'lucide-react';

interface FlipCardProps {
  card: Flashcard;
  onRate?: (quality: number) => void;
  isReviewMode?: boolean;
}

export function FlipCard({ card, onRate, isReviewMode = false }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Toggle flip on Space key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      }
      // Numeric shortcuts for ratings in review mode
      if (isReviewMode && isFlipped && onRate) {
        if (e.key === '1') onRate(0); // Again
        if (e.key === '2') onRate(3); // Hard
        if (e.key === '3') onRate(4); // Good
        if (e.key === '4') onRate(5); // Easy
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isReviewMode, isFlipped, onRate]);

  // Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [card.id]);

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
      {/* 3D Card Container */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full h-80 perspective-1000 cursor-pointer select-none group"
      >
        <div
          className={`relative w-full h-full duration-500 transform-style-3d transition-transform shadow-soft rounded-2xl ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT */}
          <div className="absolute inset-0 w-full h-full backface-hidden bg-white border border-[#F3E8D9] rounded-2xl p-8 flex flex-col justify-between shadow-soft group-hover:border-amber-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#FEF3C7] text-amber-900 border border-[#FDE68A]">
                {card.topic || 'Concept'}
              </span>
              <span className="text-xs text-[#78716C] flex items-center space-x-1">
                <RotateCw className="w-3.5 h-3.5" />
                <span>Click or Space to flip</span>
              </span>
            </div>

            <div className="text-center my-auto px-4">
              <p className="text-xl sm:text-2xl font-bold font-serif-title text-[#1C1917] leading-snug">
                {card.front}
              </p>
            </div>

            <div className="flex justify-between items-center text-xs text-[#78716C] pt-2 border-t border-[#F3E8D9]">
              <span>Card ID: #{card.id}</span>
              <span className="font-medium text-[#DC2626]">Prompt / Question</span>
            </div>
          </div>

          {/* BACK - Light warm amber/emerald style instead of dark purple */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-[#FFFBEB] via-[#FFF7ED] to-[#D1FAE5]/30 text-[#1C1917] rounded-2xl p-8 flex flex-col justify-between shadow-soft border border-[#F3E8D9]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#D1FAE5] text-emerald-900 border border-emerald-200">
                Answer & Key Definition
              </span>
              <span className="text-xs text-emerald-700 flex items-center space-x-1">
                <Check className="w-3.5 h-3.5" />
                <span>Revealed</span>
              </span>
            </div>

            <div className="text-center my-auto px-4 overflow-y-auto max-h-44 scrollbar-thin">
              <p className="text-lg sm:text-xl font-medium text-[#1C1917] leading-relaxed">
                {card.back}
              </p>
            </div>

            <div className="flex justify-between items-center text-xs text-[#78716C] pt-2 border-t border-[#F3E8D9]">
              <span>Interval: {card.interval}d (Ease: {card.ease.toFixed(2)})</span>
              <span>Reps: {card.repetitions}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Review Rating Buttons (When in Review Mode & Answer Revealed) */}
      {isReviewMode && onRate && (
        <div className="mt-6 w-full animate-fadeIn">
          {isFlipped ? (
            <div className="flex flex-col items-center space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#78716C]">
                Rate your recall quality:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full">
                {/* Again: q=0 */}
                <button
                  onClick={() => onRate(0)}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#FFE4E6] hover:bg-rose-200 text-rose-800 border border-rose-200 font-semibold transition-all active:scale-95 cursor-pointer shadow-xs"
                >
                  <span className="text-sm">Again</span>
                  <span className="text-[11px] text-rose-600 font-normal">Reset (&lt;1d)</span>
                  <span className="text-[10px] text-rose-400 mt-1 font-mono">[Key 1]</span>
                </button>

                {/* Hard: q=3 */}
                <button
                  onClick={() => onRate(3)}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#FEF3C7] hover:bg-amber-200 text-amber-900 border border-amber-200 font-semibold transition-all active:scale-95 cursor-pointer shadow-xs"
                >
                  <span className="text-sm">Hard</span>
                  <span className="text-[11px] text-amber-700 font-normal">Difficult</span>
                  <span className="text-[10px] text-amber-500 mt-1 font-mono">[Key 2]</span>
                </button>

                {/* Good: q=4 */}
                <button
                  onClick={() => onRate(4)}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#DBEAFE] hover:bg-sky-200 text-sky-900 border border-sky-200 font-semibold transition-all active:scale-95 cursor-pointer shadow-xs"
                >
                  <span className="text-sm">Good</span>
                  <span className="text-[11px] text-sky-700 font-normal">Standard</span>
                  <span className="text-[10px] text-sky-500 mt-1 font-mono">[Key 3]</span>
                </button>

                {/* Easy: q=5 */}
                <button
                  onClick={() => onRate(5)}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#D1FAE5] hover:bg-emerald-200 text-emerald-900 border border-emerald-200 font-semibold transition-all active:scale-95 cursor-pointer shadow-xs"
                >
                  <span className="text-sm">Easy</span>
                  <span className="text-[11px] text-emerald-700 font-normal">Perfect</span>
                  <span className="text-[10px] text-emerald-500 mt-1 font-mono">[Key 4]</span>
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsFlipped(true)}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#DC2626] to-[#EF4444] text-white font-semibold rounded-full shadow-glow-red hover:opacity-95 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Reveal Answer (Space)</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
