import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchQuiz, submitQuizAttempt, type Quiz as QuizType } from '../api/client';
import { QuizCard } from '../components/QuizCard';
import { Loader2, AlertCircle, Timer } from 'lucide-react';

export default function Quiz() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<QuizType | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [questionTimeLeft, setQuestionTimeLeft] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadQuiz() {
      if (!quizId) return;
      try {
        setLoading(true);
        const data = await fetchQuiz(Number(quizId));
        setQuiz(data);
        // Initialise per-question timer if configured
        if (data.time_limit_sec) setQuestionTimeLeft(data.time_limit_sec);
      } catch (err: any) {
        setError(err?.response?.data?.detail || 'Failed to load quiz.');
      } finally {
        setLoading(false);
      }
    }
    loadQuiz();
  }, [quizId]);

  // Global elapsed timer
  useEffect(() => {
    const timer = setInterval(() => setTimeElapsed((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleNext = useCallback(() => {
    if (quiz && currentIndex < quiz.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      if (quiz.time_limit_sec) setQuestionTimeLeft(quiz.time_limit_sec);
    }
  }, [quiz, currentIndex]);

  // Per-question countdown
  useEffect(() => {
    if (questionTimeLeft === null) return;
    if (questionTimeLeft <= 0) {
      // Auto-advance on timeout
      handleNext();
      return;
    }
    const t = setTimeout(() => setQuestionTimeLeft((prev) => (prev !== null ? prev - 1 : null)), 1000);
    return () => clearTimeout(t);
  }, [questionTimeLeft, handleNext]);

  // Reset per-question timer on question change
  useEffect(() => {
    if (quiz?.time_limit_sec) setQuestionTimeLeft(quiz.time_limit_sec);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const handleSelectOption = (chosenIdx: number) => {
    if (!quiz) return;
    const currentQ = quiz.questions[currentIndex];
    setSelectedAnswers((prev) => ({ ...prev, [currentQ.id]: chosenIdx }));
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      if (quiz?.time_limit_sec) setQuestionTimeLeft(quiz.time_limit_sec);
    }
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    try {
      setSubmitting(true);
      setError(null);
      const answersPayload = Object.entries(selectedAnswers).map(([qId, chosenIdx]) => ({
        question_id: Number(qId),
        chosen_index: chosenIdx,
      }));
      const attempt = await submitQuizAttempt(quiz.id, answersPayload, timeElapsed);
      navigate(`/results/${attempt.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to submit quiz attempt.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-20 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <p className="text-sm font-semibold text-slate-500">Preparing your interactive quiz...</p>
      </div>
    );
  }

  if (error || !quiz || quiz.questions.length === 0) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800">Quiz Unavailable</h3>
        <p className="text-xs text-slate-500">{error || 'No questions found for this quiz.'}</p>
        <button
          onClick={() => navigate('/upload')}
          className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold"
        >
          Return to Documents
        </button>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentIndex];
  const timeLimitSec = quiz.time_limit_sec;

  // Compute countdown bar width
  const countdownPct = timeLimitSec && questionTimeLeft !== null
    ? (questionTimeLeft / timeLimitSec) * 100
    : null;
  const countdownColor =
    questionTimeLeft !== null && questionTimeLeft <= 10
      ? 'bg-rose-500'
      : questionTimeLeft !== null && questionTimeLeft <= 20
      ? 'bg-amber-400'
      : 'bg-purple-500';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Submitting Overlay */}
      {submitting && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-purple-400" />
          <p className="text-base font-bold">Scoring your answers server-side...</p>
        </div>
      )}

      {/* Per-question countdown bar */}
      {timeLimitSec && questionTimeLeft !== null && (
        <div className="bg-white rounded-xl border border-slate-200 p-3 flex items-center space-x-3 shadow-xs">
          <Timer className={`w-4 h-4 flex-shrink-0 ${questionTimeLeft <= 10 ? 'text-rose-500' : 'text-purple-600'}`} />
          <div className="flex-1 h-2.5 rounded-full bg-slate-200 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${countdownColor}`}
              style={{ width: `${countdownPct}%` }}
            />
          </div>
          <span className={`text-xs font-extrabold w-8 text-right ${questionTimeLeft <= 10 ? 'text-rose-600' : 'text-slate-700'}`}>
            {questionTimeLeft}s
          </span>
        </div>
      )}

      {/* Quiz type badge */}
      <div className="flex items-center space-x-2">
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 capitalize">
          {quiz.question_type?.replace('_', '/') ?? 'MCQ'}
        </span>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 capitalize">
          {quiz.difficulty}
        </span>
        <span className="text-xs text-slate-400">
          {currentIndex + 1} / {quiz.questions.length}
        </span>
      </div>

      {/* Quiz Card */}
      <QuizCard
        question={currentQuestion}
        questionNumber={currentIndex + 1}
        totalQuestions={quiz.questions.length}
        selectedIndex={selectedAnswers[currentQuestion.id]}
        onSelectOption={handleSelectOption}
        onNext={handleNext}
        onPrev={handlePrev}
        canPrev={currentIndex > 0}
        isLast={currentIndex === quiz.questions.length - 1}
        onSubmit={handleSubmit}
        timeElapsedSec={timeElapsed}
      />
    </div>
  );
}
