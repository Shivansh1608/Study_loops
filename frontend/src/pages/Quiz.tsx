import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchQuiz, submitQuizAttempt, type Quiz as QuizType } from '../api/client';
import { QuizCard } from '../components/QuizCard';
import { QuestionPalette } from '../components/QuestionPalette';
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export default function Quiz() {
  const params = useParams<{ id?: string; quizId?: string }>();
  const currentQuizId = params.id || params.quizId;
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<QuizType | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quiz state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [questionTimeLeft, setQuestionTimeLeft] = useState<number | null>(null);

  // Submit confirmation dialog state
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const storageKey = useMemo(
    () => (currentQuizId ? `quiz_progress_${currentQuizId}` : null),
    [currentQuizId]
  );

  // 1. Load Quiz and restore local saved progress
  useEffect(() => {
    async function loadQuiz() {
      if (!currentQuizId) return;
      try {
        setLoading(true);
        const data = await fetchQuiz(Number(currentQuizId));
        setQuiz(data);

        // Check local storage for existing progress
        if (storageKey) {
          try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
              const parsed = JSON.parse(saved);
              if (parsed.selectedAnswers) setSelectedAnswers(parsed.selectedAnswers);
              if (parsed.markedForReview) setMarkedForReview(new Set(parsed.markedForReview));
              if (typeof parsed.currentIndex === 'number' && parsed.currentIndex < data.questions.length) {
                setCurrentIndex(parsed.currentIndex);
              }
              if (typeof parsed.timeElapsed === 'number') {
                setTimeElapsed(parsed.timeElapsed);
              }
            }
          } catch (e) {
            console.error('Failed to restore quiz progress from local storage', e);
          }
        }

        if (data.time_limit_sec) {
          setQuestionTimeLeft(data.time_limit_sec);
        }
      } catch (err: any) {
        setError(err?.response?.data?.detail || 'Failed to load quiz.');
      } finally {
        setLoading(false);
      }
    }
    loadQuiz();
  }, [currentQuizId, storageKey]);

  // 2. Persist progress to LocalStorage
  useEffect(() => {
    if (!storageKey || !quiz) return;
    try {
      const stateToSave = {
        selectedAnswers,
        markedForReview: Array.from(markedForReview),
        currentIndex,
        timeElapsed,
      };
      localStorage.setItem(storageKey, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Failed to save quiz progress to local storage', e);
    }
  }, [storageKey, quiz, selectedAnswers, markedForReview, currentIndex, timeElapsed]);

  // 3. Global elapsed timer
  useEffect(() => {
    const timer = setInterval(() => setTimeElapsed((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // 4. Submit handler
  const handleSubmit = useCallback(async () => {
    if (!quiz || submitting) return;
    try {
      setSubmitting(true);
      setError(null);

      const answersPayload = Object.entries(selectedAnswers).map(([qId, chosenIdx]) => ({
        question_id: Number(qId),
        chosen_index: chosenIdx,
        time_spent_sec: 0,
      }));

      const attempt = await submitQuizAttempt(quiz.id, answersPayload, timeElapsed);

      // Clear local storage after successful submission
      if (storageKey) {
        localStorage.removeItem(storageKey);
      }

      navigate(`/attempts/${attempt.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to submit quiz attempt.');
      setSubmitting(false);
      setShowConfirmModal(false);
    }
  }, [quiz, submitting, selectedAnswers, timeElapsed, storageKey, navigate]);

  // 5. Navigation next / prev
  const handleNext = useCallback(() => {
    if (!quiz) return;
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      if (quiz.time_limit_sec) setQuestionTimeLeft(quiz.time_limit_sec);
    } else {
      setShowConfirmModal(true);
    }
  }, [quiz, currentIndex]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      if (quiz?.time_limit_sec) setQuestionTimeLeft(quiz.time_limit_sec);
    }
  }, [currentIndex, quiz]);

  // 6. Per-question countdown timer with auto-submit / auto-advance
  useEffect(() => {
    if (questionTimeLeft === null || !quiz?.time_limit_sec) return;

    if (questionTimeLeft <= 0) {
      if (currentIndex < quiz.questions.length - 1) {
        handleNext();
      } else {
        handleSubmit();
      }
      return;
    }

    const t = setTimeout(() => {
      setQuestionTimeLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(t);
  }, [questionTimeLeft, quiz, currentIndex, handleNext, handleSubmit]);

  // Reset countdown whenever active question index changes
  useEffect(() => {
    if (quiz?.time_limit_sec) {
      setQuestionTimeLeft(quiz.time_limit_sec);
    }
  }, [currentIndex, quiz]);

  // 7. Option selection
  const handleSelectOption = useCallback(
    (chosenIdx: number) => {
      if (!quiz) return;
      const currentQ = quiz.questions[currentIndex];
      setSelectedAnswers((prev) => ({
        ...prev,
        [currentQ.id]: chosenIdx,
      }));
    },
    [quiz, currentIndex]
  );

  // 8. Mark for review toggle
  const handleToggleMarkReview = useCallback((idx: number) => {
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  }, []);

  // 9. Keyboard shortcut listener: 1-4, Enter, ArrowLeft, ArrowRight
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't intercept if user is in an input or modal is open
      if (showConfirmModal || submitting) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (['1', '2', '3', '4'].includes(e.key)) {
        const optionIndex = parseInt(e.key, 10) - 1;
        if (quiz && quiz.questions[currentIndex]?.options[optionIndex] !== undefined) {
          handleSelectOption(optionIndex);
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quiz, currentIndex, handleSelectOption, handleNext, handlePrev, showConfirmModal, submitting]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-24 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
        <p className="text-sm font-semibold text-slate-500">Preparing quiz questions...</p>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 px-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold font-heading text-slate-900">Quiz Unavailable</h2>
        <p className="text-xs text-slate-500">{error || 'Unable to load quiz details.'}</p>
        <button
          onClick={() => navigate('/quizzes')}
          className="px-5 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold cursor-pointer"
        >
          View My Quizzes
        </button>
      </div>
    );
  }

  const currentQ = quiz.questions[currentIndex];
  const questionIds = quiz.questions.map((q) => q.id);
  const total = quiz.questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const unansweredCount = total - answeredCount;
  const reviewCount = markedForReview.size;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Title bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full">
            Active Assessment
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-900 mt-1">
            {quiz.title || `Quiz #${quiz.id}`}
          </h1>
        </div>

        <button
          onClick={() => setShowConfirmModal(true)}
          className="self-start sm:self-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          Submit Quiz ({answeredCount}/{total} done)
        </button>
      </div>

      {/* Main taking layout with question card + side palette */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Question Card (columns 1-3) */}
        <div className="lg:col-span-3">
          <QuizCard
            question={currentQ}
            questionNumber={currentIndex + 1}
            totalQuestions={total}
            selectedIndex={selectedAnswers[currentQ.id]}
            onSelectOption={handleSelectOption}
            onNext={handleNext}
            onPrev={handlePrev}
            canPrev={currentIndex > 0}
            isLast={currentIndex === total - 1}
            onSubmit={() => setShowConfirmModal(true)}
            timeElapsedSec={timeElapsed}
            timeRemainingSec={questionTimeLeft}
            isCountdown={quiz.time_limit_sec !== null && quiz.time_limit_sec !== undefined}
          />
        </div>

        {/* Sidebar Question Palette (column 4) */}
        <div className="lg:col-span-1 space-y-4">
          <QuestionPalette
            totalQuestions={total}
            currentIndex={currentIndex}
            answers={selectedAnswers}
            markedForReview={markedForReview}
            questionIds={questionIds}
            onSelectQuestion={(idx) => {
              setCurrentIndex(idx);
              if (quiz.time_limit_sec) setQuestionTimeLeft(quiz.time_limit_sec);
            }}
            onToggleMarkReview={handleToggleMarkReview}
          />
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold font-heading text-slate-900">
                Ready to Submit Your Quiz?
              </h2>
              <p className="text-xs text-slate-500">
                Review your completion status before finalizing your attempt.
              </p>
            </div>

            {/* Status breakdown pills */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3">
                <p className="text-lg font-bold text-emerald-700 font-mono">{answeredCount}</p>
                <p className="text-[10px] font-semibold text-emerald-600 uppercase">Answered</p>
              </div>

              <div className={`rounded-2xl p-3 border ${unansweredCount > 0 ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                <p className="text-lg font-bold font-mono">{unansweredCount}</p>
                <p className="text-[10px] font-semibold uppercase">Unanswered</p>
              </div>

              <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3">
                <p className="text-lg font-bold text-amber-700 font-mono">{reviewCount}</p>
                <p className="text-[10px] font-semibold text-amber-600 uppercase">Review</p>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="flex items-center space-x-2 text-xs text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>You still have {unansweredCount} unanswered question{unansweredCount > 1 ? 's' : ''}!</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Back to Questions
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Grading...</span>
                  </>
                ) : (
                  <span>Submit Now</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
