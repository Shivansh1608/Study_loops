import React from 'react';
import { Clock, Target } from 'lucide-react';
import { type Attempt } from '../api/client';

interface ResultSummaryProps {
  attempt: Attempt;
}

export const ResultSummary: React.FC<ResultSummaryProps> = ({ attempt }) => {
  const scorePct = attempt.total > 0 ? Math.round((attempt.score / attempt.total) * 100) : 0;
  const isPassed = scorePct >= 70;

  // Calculate per-topic accuracy
  const topicMap: Record<string, { total: number; correct: number }> = {};
  attempt.answers.forEach((ans) => {
    const topic = ans.question.topic || 'General';
    if (!topicMap[topic]) {
      topicMap[topic] = { total: 0, correct: 0 };
    }
    topicMap[topic].total += 1;
    if (ans.is_correct) {
      topicMap[topic].correct += 1;
    }
  });

  const topicAccuracies = Object.entries(topicMap).map(([topic, stats]) => ({
    topic,
    accuracyPct: Math.round((stats.correct / stats.total) * 100),
    correct: stats.correct,
    total: stats.total,
  }));

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}m ${s < 10 ? '0' : ''}${s}s`;
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl overflow-hidden relative space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-6 text-center sm:text-left">
          {/* Big Score Badge */}
          <div
            className={`w-24 h-24 rounded-2xl flex flex-col items-center justify-center font-extrabold shadow-md ${
              isPassed
                ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                : 'bg-rose-500 text-white shadow-rose-500/20'
            }`}
          >
            <span className="text-3xl font-heading">{scorePct}%</span>
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider opacity-90">
              {isPassed ? 'Passed' : 'Needs Review'}
            </span>
          </div>

          <div className="space-y-1">
            <span
              className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}
            >
              {isPassed ? 'Passed • Great Job!' : 'Review Recommended'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
              You scored {attempt.score} out of {attempt.total}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Completed on {new Date(attempt.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Quick stat cards */}
        <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
          <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-3.5 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Duration</p>
              <p className="text-sm font-bold text-slate-800 font-mono">
                {formatDuration(attempt.duration_sec)}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-3.5 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Accuracy</p>
              <p className="text-sm font-bold text-slate-800 font-mono">{scorePct}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Per-Topic Breakdown */}
      {topicAccuracies.length > 0 && (
        <div className="pt-6 border-t border-slate-100 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Topic Performance Breakdown
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {topicAccuracies.map((item) => (
              <div
                key={item.topic}
                className="bg-slate-50/70 border border-slate-200/60 rounded-xl p-3 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 truncate max-w-[180px]">
                    {item.topic}
                  </span>
                  <span className="font-mono font-bold text-slate-600">
                    {item.correct}/{item.total} ({item.accuracyPct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      item.accuracyPct >= 70 ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${item.accuracyPct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
