import React from 'react';

interface OptionButtonProps {
  index: number;
  label: string;
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export const OptionButton: React.FC<OptionButtonProps> = ({
  index,
  label,
  isSelected,
  onSelect,
  disabled = false,
}) => {
  const keyNumber = index + 1;
  const letter = LETTERS[index] || `${keyNumber}`;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
      disabled={disabled}
      onClick={onSelect}
      className={`group w-full text-left p-4 rounded-2xl border-2 transition-all flex items-start space-x-3.5 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 ${
        isSelected
          ? 'border-purple-600 bg-purple-50/80 text-purple-950 shadow-md shadow-purple-600/10'
          : 'border-slate-200 hover:border-purple-300 bg-white hover:bg-slate-50/80 text-slate-700'
      } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
    >
      {/* Letter badge / selection indicator */}
      <div
        className={`flex-shrink-0 w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold font-mono transition-all duration-200 mt-0.5 ${
          isSelected
            ? 'bg-purple-600 text-white shadow-xs'
            : 'bg-slate-100 group-hover:bg-purple-100 text-slate-600 group-hover:text-purple-700'
        }`}
      >
        {letter}
      </div>

      <div className="flex-1 flex items-baseline justify-between gap-2">
        <span className="text-sm sm:text-base font-medium leading-relaxed">
          {label}
        </span>
        <span
          className={`text-[10px] font-mono px-1.5 py-0.5 rounded border transition-opacity ${
            isSelected
              ? 'border-purple-300 bg-purple-100/60 text-purple-700'
              : 'border-slate-200 text-slate-400 group-hover:text-slate-600'
          }`}
          title={`Press ${keyNumber} to select`}
        >
          Key {keyNumber}
        </span>
      </div>
    </button>
  );
};
