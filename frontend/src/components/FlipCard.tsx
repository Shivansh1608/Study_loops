import { useState, useEffect } from 'react';
import { type Flashcard } from '../api/client';
import { RotateCw, Sparkles } from 'lucide-react';

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
          className={`relative w-full h-full duration-500 transform-style-3d transition-transform shadow-xl rounded-2xl ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT */}
          <div className="absolute inset-0 w-full h-full backface-hidden bg-white border-2 border-slate-200/90 rounded-2xl p-8 flex flex-col justify-between shadow-lg group-hover:border-purple-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                {card.topic || 'Concept'}
              </span>
              <span className="text-xs text-slate-400 flex items-center space-x-1">
                <RotateCw className="w-3.5 h-3.5" />
                <span>Click or Space to flip</span>
              </span>
            </div>

            <div className="text-center my-auto px-4">
              <p className="text-xl sm:text-2xl font-bold font-heading text-slate-800 leading-snug">
                {card.front}
              </p>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-100">
              <span>Card ID: #{card.id}</span>
              <span className="font-medium text-purple-600">Prompt / Question</span>
            </div>
          </div>

          {/* BACK */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white rounded-2xl p-8 flex flex-col justify-between shadow-2xl border-2 border-purple-500/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/10 text-purple-200 border border-white/20">
                Answer & Key Definition
              </span>
              <span className="text-xs text-purple-300 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Revealed</span>
              </span>
            </div>

            <div className="text-center my-auto px-4 overflow-y-auto max-h-44 scrollbar-thin">
              <p className="text-lg sm:text-xl font-medium text-purple-50 leading-relaxed">
                {card.back}
              </p>
            </div>

            <div className="flex justify-between items-center text-xs text-purple-300 pt-2 border-t border-white/10">
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
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Rate your recall quality:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full">
                {/* Again: q=0 */}
                <button
                  onClick={() => onRate(0)}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold transition-all active:scale-95 cursor-pointer shadow-xs"
                >
                  <span className="text-sm">Again</span>
                  <span className="text-[11px] text-rose-500 font-normal">Reset (&lt;1d)</span>
                  <span className="text-[10px] text-rose-400 mt-1 font-mono">[Key 1]</span>
                </button>

                {/* Hard: q=3 */}
                <button
                  onClick={() => onRate(3)}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-semibold transition-all active:scale-95 cursor-pointer shadow-xs"
                >
                  <span className="text-sm">Hard</span>
                  <span className="text-[11px] text-amber-500 font-normal">Difficult</span>
                  <span className="text-[10px] text-amber-400 mt-1 font-mono">[Key 2]</span>
                </button>

                {/* Good: q=4 */}
                <button
                  onClick={() => onRate(4)}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold transition-all active:scale-95 cursor-pointer shadow-xs"
                >
                  <span className="text-sm">Good</span>
                  <span className="text-[11px] text-blue-500 font-normal">Standard</span>
                  <span className="text-[10px] text-blue-400 mt-1 font-mono">[Key 3]</span>
                </button>

                {/* Easy: q=5 */}
                <button
                  onClick={() => onRate(5)}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold transition-all active:scale-95 cursor-pointer shadow-xs"
                >
                  <span className="text-sm">Easy</span>
                  <span className="text-[11px] text-emerald-500 font-normal">Perfect</span>
                  <span className="text-[10px] text-emerald-400 mt-1 font-mono">[Key 4]</span>
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsFlipped(true)}
              className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl shadow-md shadow-purple-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Reveal Answer (Space)</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
