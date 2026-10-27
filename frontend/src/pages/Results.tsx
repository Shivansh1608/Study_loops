import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  fetchAttempt,
  fetchQuiz,
  retryWrongQuiz,
  type Attempt,
  type Quiz,
} from '../api/client';
import { ResultSummary } from '../components/ResultSummary';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  Loader2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export default function Results() {
  const params = useParams<{ id?: string; attemptId?: string }>();
  const attemptId = params.id || params.attemptId;
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [filter, setFilter] = useState<'all' | 'wrong' | 'correct'>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAttemptAndQuiz() {
      if (!attemptId) return;
      try {
        setLoading(true);
        const attData = await fetchAttempt(Number(attemptId));
        setAttempt(attData);

        if (attData.quiz_id) {
          const qData = await fetchQuiz(attData.quiz_id);
          setQuiz(qData);
        }
      } catch (err: any) {
        setError(err?.response?.data?.detail || 'Failed to load attempt results.');
      } finally {
        setLoading(false);
      }
    }
    loadAttemptAndQuiz();
  }, [attemptId]);

  const handleRetryWrong = async () => {
    if (!attempt?.quiz_id) return;
    try {
      setRetrying(true);
      setError(null);
      const newQuiz = await retryWrongQuiz(attempt.quiz_id);
      navigate(`/quizzes/${newQuiz.id}/take`);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to create retry quiz.');
      setRetrying(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-24 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
        <p className="text-sm font-semibold text-slate-500">Retrieving scored results...</p>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4 px-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold font-heading text-slate-900">Attempt Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'Could not find attempt record.'}</p>
        <Link
          to="/quizzes"
          className="inline-block px-5 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold"
        >
          Go to My Quizzes
        </Link>
      </div>
    );
  }

  const wrongCount = attempt.answers.filter((a) => !a.is_correct).length;
  const correctCount = attempt.answers.filter((a) => a.is_correct).length;

  const filteredAnswers = attempt.answers.filter((a) => {
    if (filter === 'wrong') return !a.is_correct;
    if (filter === 'correct') return a.is_correct;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Top breadcrumb & navigation */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
        <Link
          to="/quizzes"
          className="inline-flex items-center space-x-1.5 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>My Quizzes</span>
        </Link>
        <span className="font-mono text-[11px] text-slate-400">
          Attempt #{attempt.id}
        </span>
      </div>

      {/* Result Summary (Score badge, stats, per-topic breakdown) */}
      <ResultSummary attempt={attempt} />

      {/* Action Buttons Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {wrongCount > 0 ? (
            <button
              onClick={handleRetryWrong}
              disabled={retrying}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              {retrying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RotateCcw className="w-4 h-4" />
              )}
              <span>Retry Wrong Answers ({wrongCount})</span>
            </button>
          ) : (
            <div className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Perfect Score! All Correct</span>
            </div>
          )}

          <button
            onClick={() => navigate(`/quizzes/${attempt.quiz_id}/take`)}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-purple-600" />
            <span>Retake Entire Quiz</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {quiz?.document_id && (
            <button
              onClick={() => navigate(`/documents/${quiz.document_id}/quiz/new`)}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate New Quiz</span>
            </button>
          )}

          <button
            onClick={() => navigate('/upload')}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            Back to Document
          </button>
        </div>
      </div>

      {/* Review Section */}
      <div className="space-y-4">
        {/* Filter pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-lg font-bold font-heading text-slate-900">
            Question Review ({filteredAnswers.length})
          </h3>

          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All ({attempt.total})
            </button>
            <button
              onClick={() => setFilter('wrong')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === 'wrong'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Wrong ({wrongCount})
            </button>
            <button
              onClick={() => setFilter('correct')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === 'correct'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Correct ({correctCount})
            </button>
          </div>
        </div>

        {/* Question cards list */}
        <div className="space-y-4">
          {filteredAnswers.map((item, idx) => {
            const q = item.question;
            const isCorrect = item.is_correct;
            const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

            return (
              <div
                key={item.question_id || idx}
                className={`bg-white rounded-3xl p-6 sm:p-7 border transition-all ${
                  isCorrect ? 'border-slate-200/80 shadow-xs' : 'border-rose-200 shadow-sm'
                }`}
              >
                {/* Question metadata badge */}
                <div className="flex items-center justify-between mb-3 text-xs">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        isCorrect
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-500 capitalize">{q.topic}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 capitalize">
                      {q.difficulty}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                      isCorrect
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Correct</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Incorrect</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Question Prompt */}
                <h4 className="text-base sm:text-lg font-bold font-heading text-slate-900 mb-4 leading-relaxed">
                  {q.question}
                </h4>

                {/* Options Review */}
                <div className="space-y-2 mb-4">
                  {q.options.map((optText, optIdx) => {
                    const isUserPick = item.chosen_index === optIdx;
                    const isActualCorrect = q.correct_index === optIdx;

                    let optionStyle = 'border-slate-200 bg-white text-slate-600';
                    if (isActualCorrect) {
                      optionStyle = 'border-emerald-500 bg-emerald-50/80 text-emerald-950 font-semibold';
                    } else if (isUserPick && !isCorrect) {
                      optionStyle = 'border-rose-400 bg-rose-50 text-rose-950 line-through';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-3.5 rounded-xl border-2 text-xs sm:text-sm flex items-center justify-between ${optionStyle}`}
                      >
                        <div className="flex items-center space-x-3">
                          <span
                            className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${
                              isActualCorrect
                                ? 'bg-emerald-600 text-white'
                                : isUserPick
                                ? 'bg-rose-500 text-white'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {letters[optIdx] || optIdx + 1}
                          </span>
                          <span>{optText}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          {isUserPick && (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-200/80 text-slate-700">
                              Your Answer
                            </span>
                          )}
                          {isActualCorrect && (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-800">
                              Correct Key
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Grounded Explanation */}
                {q.explanation && (
                  <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 text-xs sm:text-sm text-purple-900 space-y-1">
                    <p className="font-bold text-purple-950 flex items-center space-x-1.5">
                      <HelpCircle className="w-4 h-4 text-purple-600" />
                      <span>Explanation from Lecture Notes:</span>
                    </p>
                    <p className="leading-relaxed text-purple-900/90 pl-5">{q.explanation}</p>
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
