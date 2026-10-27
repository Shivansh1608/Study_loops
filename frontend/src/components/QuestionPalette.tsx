import React from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';

interface QuestionPaletteProps {
  totalQuestions: number;
  currentIndex: number;
  answers: Record<number, number | string>;
  markedForReview: Set<number>;
  questionIds: number[];
  onSelectQuestion: (index: number) => void;
  onToggleMarkReview: (index: number) => void;
}

export const QuestionPalette: React.FC<QuestionPaletteProps> = ({
  totalQuestions,
  currentIndex,
  answers,
  markedForReview,
  questionIds,
  onSelectQuestion,
  onToggleMarkReview,
}) => {
  const answeredCount = Object.keys(answers).length;
  const reviewCount = markedForReview.size;
  const isCurrentMarked = markedForReview.has(currentIndex);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Question Palette
        </h4>
        <button
          type="button"
          onClick={() => onToggleMarkReview(currentIndex)}
          className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            isCurrentMarked
              ? 'bg-amber-100 text-amber-800 border border-amber-300'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
          }`}
          title="Mark/unmark current question for review before submitting"
        >
          {isCurrentMarked ? (
            <>
              <BookmarkCheck className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              <span>Marked</span>
            </>
          ) : (
            <>
              <Bookmark className="w-3.5 h-3.5 text-slate-500" />
              <span>Mark for Review</span>
            </>
          )}
        </button>
      </div>

      {/* Grid of question buttons */}
      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-5 gap-2 max-h-56 overflow-y-auto pr-1">
        {Array.from({ length: totalQuestions }, (_, i) => {
          const qId = questionIds[i];
          const isAnswered = qId !== undefined && answers[qId] !== undefined;
          const isCurrent = i === currentIndex;
          const isMarked = markedForReview.has(i);

          let bgClasses = 'bg-slate-100 text-slate-700 hover:bg-slate-200';
          if (isAnswered) {
            bgClasses = 'bg-purple-600 text-white hover:bg-purple-700 shadow-xs';
          }
          if (isMarked) {
            bgClasses = 'bg-amber-500 text-white hover:bg-amber-600';
          }

          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelectQuestion(i)}
              className={`relative h-10 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${bgClasses} ${
                isCurrent
                  ? 'ring-2 ring-purple-600 ring-offset-2 ring-offset-white font-extrabold scale-105'
                  : ''
              }`}
              title={`Question ${i + 1}${isAnswered ? ' (Answered)' : ''}${
                isMarked ? ' (Review)' : ''
              }`}
            >
              <span>{i + 1}</span>
              {isMarked && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-white" />
              )}
            </button>
          );
        })}
      </div>

      {/* Palette Legend */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-500">
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
          <span>Answered ({answeredCount})</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Review ({reviewCount})</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
          <span>Left ({totalQuestions - answeredCount})</span>
        </div>
      </div>
    </div>
  );
};
