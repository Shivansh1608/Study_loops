import React from 'react';
import { type Question } from '../api/client';
import { OptionButton } from './OptionButton';
import { ProgressBar } from './ProgressBar';
import { Timer } from './Timer';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

interface QuizCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedIndex?: number | null;
  onSelectOption: (optionIndex: number) => void;
  onNext: () => void;
  onPrev: () => void;
  canPrev: boolean;
  isLast: boolean;
  onSubmit: () => void;
  timeElapsedSec: number;
  timeRemainingSec?: number | null;
  isCountdown?: boolean;
}

export const QuizCard: React.FC<QuizCardProps> = ({
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
  timeRemainingSec,
  isCountdown = false,
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden transition-all">
      {/* Header with Progress & Timer */}
      <div className="bg-slate-50/90 p-5 sm:p-6 border-b border-slate-200/80 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-xl bg-purple-100 text-purple-700">
              Question {questionNumber} of {totalQuestions}
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-slate-200 text-slate-700 capitalize">
              {question.difficulty}
            </span>
            <span className="text-xs font-medium text-slate-500 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
              {question.topic}
            </span>
          </div>

          <Timer
            secondsElapsed={timeElapsedSec}
            secondsRemaining={timeRemainingSec}
            isCountdown={isCountdown}
          />
        </div>

        {/* Progress Bar */}
        <ProgressBar current={questionNumber} total={totalQuestions} />
      </div>

      {/* Question Body */}
      <div className="p-6 sm:p-8 space-y-6">
        <h3 className="text-lg sm:text-xl font-bold font-heading text-slate-900 leading-relaxed">
          {question.question}
        </h3>

        {/* Options */}
        <div className="space-y-3" role="radiogroup" aria-label="Question options">
          {question.options.map((optionText, idx) => (
            <OptionButton
              key={idx}
              index={idx}
              label={optionText}
              isSelected={selectedIndex === idx}
              onSelect={() => onSelectOption(idx)}
            />
          ))}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="bg-slate-50/90 p-5 sm:p-6 border-t border-slate-200/80 flex items-center justify-between">
        <button
          type="button"
          onClick={onPrev}
          disabled={!canPrev}
          className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            canPrev
              ? 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs'
              : 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border border-slate-200'
          }`}
          title="Previous question (or Left Arrow)"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <div className="text-[11px] text-slate-400 hidden sm:block">
          Use keys <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-700 font-mono">1-4</kbd> to answer, <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-700 font-mono">Enter</kbd> for next
        </div>

        {isLast ? (
          <button
            type="button"
            onClick={onSubmit}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/20 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Finish & Submit</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/20 cursor-pointer"
            title="Next question (or Enter / Right Arrow)"
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
