import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchQuizzes, deleteQuiz, type QuizListItem } from '../api/client';
import {
  Play,
  RotateCcw,
  Trash2,
  Sparkles,
  Calendar,
  Loader2,
  AlertCircle,
  FileQuestion,
} from 'lucide-react';

export default function MyQuizzes() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<QuizListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchQuizzes();
      setQuizzes(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load your quizzes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  const handleDelete = async (quizId: number) => {
    if (!window.confirm('Are you sure you want to delete this quiz and its attempt history?')) {
      return;
    }
    try {
      setDeletingId(quizId);
      await deleteQuiz(quizId);
      setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to delete quiz.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-24 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
        <p className="text-sm font-semibold text-slate-500">Loading your quizzes...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full">
            Study Library
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 mt-1">
            My Quizzes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Take, review, and track performance across all generated assessments.
          </p>
        </div>

        <Link
          to="/upload"
          className="self-start sm:self-auto inline-flex items-center space-x-2 px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-purple-600/20 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Create New Quiz</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Empty State */}
      {quizzes.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-5 shadow-xs max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto">
            <FileQuestion className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold font-heading text-slate-900">
              No Quizzes Generated Yet
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload your lecture notes or PDF to automatically generate interactive quizzes, active recall flashcards, and revision guides.
            </p>
          </div>
          <Link
            to="/upload"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Upload Document to Start</span>
          </Link>
        </div>
      ) : (
        /* Quizzes Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizzes.map((quiz) => {
            const hasAttempts = quiz.attempts_count > 0;
            const isDeleting = deletingId === quiz.id;

            return (
              <div
                key={quiz.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-purple-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5"
              >
                {/* Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 capitalize">
                        {quiz.difficulty}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                        {quiz.question_type.toUpperCase()}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDelete(quiz.id)}
                      disabled={isDeleting}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-40"
                      title="Delete quiz"
                    >
                      {isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold font-heading text-slate-900 line-clamp-2">
                    {quiz.title || `Quiz #${quiz.id}`}
                  </h3>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-center">
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase">Questions</p>
                    <p className="text-sm font-bold text-slate-800 font-mono">
                      {quiz.num_questions}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase">Attempts</p>
                    <p className="text-sm font-bold text-slate-800 font-mono">
                      {quiz.attempts_count}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase">Best Score</p>
                    <p
                      className={`text-sm font-bold font-mono ${
                        hasAttempts
                          ? (quiz.best_score_pct || 0) >= 70
                            ? 'text-emerald-600'
                            : 'text-amber-600'
                          : 'text-slate-400'
                      }`}
                    >
                      {hasAttempts && quiz.best_score_pct !== null
                        ? `${quiz.best_score_pct}%`
                        : '—'}
                    </p>
                  </div>
                </div>

                {/* Footer and Actions */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(quiz.created_at).toLocaleDateString()}</span>
                  </div>

                  <button
                    onClick={() => navigate(`/quizzes/${quiz.id}/take`)}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    {hasAttempts ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Retake</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Take Quiz</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
