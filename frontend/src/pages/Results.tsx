import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchAttempt, type Attempt } from '../api/client';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  LayoutDashboard, 
  Loader2,
  HelpCircle,
  Sparkles
} from 'lucide-react';

export default function Results() {
  const { attemptId } = useParams<{ attemptId: string }>();

  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterWrongOnly, setFilterWrongOnly] = useState(false);

  useEffect(() => {
    async function loadAttempt() {
      if (!attemptId) return;
      try {
        setLoading(true);
        const data = await fetchAttempt(Number(attemptId));
        setAttempt(data);
      } catch (err) {
        console.error('Failed to load attempt:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAttempt();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-20 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <p className="text-sm font-semibold text-slate-500">Retrieving scored results...</p>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <p className="text-sm text-slate-500">Attempt record not found.</p>
        <Link to="/dashboard" className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  const accuracyPct = Math.round((attempt.score / attempt.total) * 100);
  const isPassed = accuracyPct >= 70;
  const wrongAnswers = attempt.answers.filter((a) => !a.is_correct);

  const displayedAnswers = filterWrongOnly ? wrongAnswers : attempt.answers;

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}m ${s}s`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Score Summary Card */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl overflow-hidden relative">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-purple-100/60 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-6 text-center sm:text-left">
            <div
              className={`w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-extrabold font-heading shadow-md ${
                isPassed
                  ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                  : 'bg-rose-500 text-white shadow-rose-500/20'
              }`}
            >
              {accuracyPct}%
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-2 justify-center sm:justify-start">
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    isPassed
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {isPassed ? 'Passed • Great Job!' : 'Review Recommended'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
                You scored {attempt.score} out of {attempt.total}
              </h1>
              <div className="flex items-center space-x-4 text-xs text-slate-500 justify-center sm:justify-start">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Time taken: {formatDuration(attempt.duration_sec)}</span>
                </span>
                <span>•</span>
                <span>{attempt.answers.length} Questions</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {wrongAnswers.length > 0 && (
              <button
                onClick={() => setFilterWrongOnly(!filterWrongOnly)}
                className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  filterWrongOnly
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                }`}
              >
                {filterWrongOnly ? 'Show All Questions' : `Review Wrong (${wrongAnswers.length})`}
              </button>
            )}

            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-1.5"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Questions Breakdown List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold font-heading text-slate-900 flex items-center space-x-2">
          <HelpCircle className="w-5 h-5 text-purple-600" />
          <span>Detailed Question Review & Explanations</span>
        </h3>

        <div className="space-y-4">
          {displayedAnswers.map((item, idx) => {
            const q = item.question;
            const chosenOption = q.options[item.chosen_index];
            const correctOption = q.correct_index !== undefined ? q.options[q.correct_index] : null;

            return (
              <div
                key={idx}
                className={`bg-white rounded-2xl p-6 border-2 transition-all space-y-4 shadow-xs ${
                  item.is_correct ? 'border-emerald-200/80' : 'border-rose-200/80'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center space-x-2.5">
                    {item.is_correct ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                    )}
                    <h4 className="text-base font-bold text-slate-900 leading-snug">
                      {q.question}
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 flex-shrink-0">
                    {q.topic}
                  </span>
                </div>

                {/* Choices breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div
                    className={`p-3 rounded-xl border ${
                      item.is_correct
                        ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900 font-semibold'
                        : 'bg-rose-50/50 border-rose-200 text-rose-900 font-semibold'
                    }`}
                  >
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Your Answer:</p>
                    <p>{chosenOption || 'No answer selected'}</p>
                  </div>

                  {!item.is_correct && correctOption && (
                    <div className="p-3 rounded-xl border bg-emerald-50/50 border-emerald-200 text-emerald-900 font-semibold">
                      <p className="text-[10px] text-emerald-700 uppercase font-bold mb-1">Correct Answer:</p>
                      <p>{correctOption}</p>
                    </div>
                  )}
                </div>

                {/* Grounded Explanation */}
                {q.explanation && (
                  <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100 text-xs text-purple-950 space-y-1">
                    <div className="flex items-center space-x-1 font-bold text-purple-800">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span>Grounded Notes Explanation</span>
                    </div>
                    <p className="leading-relaxed text-slate-700">{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
