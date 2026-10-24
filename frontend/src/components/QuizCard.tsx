import { type Question } from '../api/client';
import { Clock, CheckCircle2, Circle } from 'lucide-react';

interface QuizCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedIndex?: number;
  onSelectOption: (optionIndex: number) => void;
  onNext: () => void;
  onPrev: () => void;
  canPrev: boolean;
  isLast: boolean;
  onSubmit: () => void;
  timeElapsedSec: number;
}

export function QuizCard({
  question,
  questionNumber,
  totalQuestions,
  selectedIndex,
  onSelectOption,
  onNext,
  onPrev,
  canPrev,
  isLast,
  onSubmit,
  timeElapsedSec,
}: QuizCardProps) {
  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPct = ((questionNumber) / totalQuestions) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
      {/* Header with Progress & Timer */}
      <div className="bg-slate-50/80 p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-100 text-purple-700">
            Question {questionNumber} of {totalQuestions}
          </span>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 capitalize">
            {question.difficulty}
          </span>
          <span className="text-xs font-medium text-slate-500 hidden sm:inline-block">
            {question.topic}
          </span>
        </div>

        <div className="flex items-center space-x-1.5 text-xs font-mono font-semibold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs">
          <Clock className="w-3.5 h-3.5 text-purple-600" />
          <span>{formatTime(timeElapsedSec)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-1.5">
        <div
          className="bg-gradient-to-r from-purple-600 to-indigo-600 h-1.5 transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Question Body */}
      <div className="p-6 sm:p-8 space-y-6">
        <h3 className="text-lg sm:text-xl font-bold font-heading text-slate-900 leading-snug">
          {question.question}
        </h3>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((opt, idx) => {
            const isSelected = selectedIndex === idx;
            const letters = ['A', 'B', 'C', 'D'];
            return (
              <button
                key={idx}
                onClick={() => onSelectOption(idx)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start space-x-3.5 cursor-pointer ${
                  isSelected
                    ? 'border-purple-600 bg-purple-50/70 text-purple-900 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50 text-slate-700'
                }`}
              >
                <div
                  className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 transition-colors ${
                    isSelected
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {letters[idx]}
                </div>
                <span className="text-sm sm:text-base font-medium flex-1 leading-relaxed">
                  {opt}
                </span>
                {isSelected ? (
                  <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300 flex-shrink-0 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="bg-slate-50/90 p-4 sm:p-6 border-t border-slate-200 flex items-center justify-between">
        <button
          onClick={onPrev}
          disabled={!canPrev}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            canPrev
              ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              : 'opacity-40 cursor-not-allowed text-slate-400'
          }`}
        >
          Previous
        </button>

        {isLast ? (
          <button
            onClick={onSubmit}
            disabled={selectedIndex === undefined}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer ${
              selectedIndex !== undefined
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-500/20 hover:opacity-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            Submit Quiz
          </button>
        ) : (
          <button
            onClick={onNext}
            disabled={selectedIndex === undefined}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer ${
              selectedIndex !== undefined
                ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            Next Question
          </button>
        )}
      </div>
    </div>
  );
}
