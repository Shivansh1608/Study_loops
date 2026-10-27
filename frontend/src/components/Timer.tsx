import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface TimerProps {
  secondsRemaining?: number | null;
  secondsElapsed?: number;
  isCountdown?: boolean;
}

export const Timer: React.FC<TimerProps> = ({
  secondsRemaining,
  secondsElapsed = 0,
  isCountdown = false,
}) => {
  const time = isCountdown ? secondsRemaining ?? 0 : secondsElapsed;
  const isUrgent = isCountdown && (secondsRemaining ?? 0) <= 10 && (secondsRemaining ?? 0) > 0;
  const isCritical = isCountdown && (secondsRemaining ?? 0) <= 0;

  const mins = Math.floor(Math.max(0, time) / 60);
  const secs = Math.max(0, time) % 60;
  const formatted = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

  return (
    <div
      className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-colors ${
        isCritical
          ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
          : isUrgent
          ? 'bg-rose-50 text-rose-700 border-rose-300 animate-bounce'
          : 'bg-white text-slate-700 border-slate-200 shadow-xs'
      }`}
      role="timer"
      aria-live="polite"
      aria-label={isCountdown ? `${formatted} remaining` : `${formatted} elapsed`}
    >
      {isUrgent || isCritical ? (
        <AlertTriangle className="w-3.5 h-3.5 text-current" />
      ) : (
        <Clock className="w-3.5 h-3.5 text-purple-600" />
      )}
      <span>{formatted}</span>
      {isCountdown && <span className="text-[10px] font-sans font-normal opacity-75">left</span>}
    </div>
  );
};
