import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  label,
}) => {
  const percentage = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;

  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
        <span>{label || `Question ${current} of ${total}`}</span>
        <span className="font-mono text-purple-600 font-bold">{percentage}%</span>
      </div>
      <div
        className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/60"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`Progress: Question ${current} of ${total}`}
      >
        <div
          className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-all duration-300 ease-out shadow-xs"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
