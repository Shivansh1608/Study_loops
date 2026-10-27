import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchDocument, createQuiz, type DocumentDetail } from '../api/client';
import {
  Sparkles,
  Sliders,
  ArrowLeft,
  Loader2,
  FileText,
  ListChecks,
  Target,
  ToggleLeft,
  Shuffle,
  Timer as TimerIcon,
  HelpCircle,
} from 'lucide-react';

type Difficulty = 'easy' | 'medium' | 'hard' | 'mixed';
type QuestionType = 'mcq' | 'true_false' | 'mixed';

const TIME_LIMITS: { label: string; value: number }[] = [
  { label: '30s', value: 30 },
  { label: '60s', value: 60 },
  { label: '90s', value: 90 },
  { label: '2 min', value: 120 },
];

export default function Configure() {
  const params = useParams<{ id?: string; documentId?: string }>();
  const docId = params.id || params.documentId;
  const navigate = useNavigate();

  const [document, setDocument] = useState<DocumentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  // Configuration form state
  const [numQuestions, setNumQuestions] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [questionType, setQuestionType] = useState<QuestionType>('mcq');
  const [topicFocus, setTopicFocus] = useState('');
  const [isTimerEnabled, setIsTimerEnabled] = useState(false);
  const [timeLimitSec, setTimeLimitSec] = useState<number>(60);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!docId) return;
      try {
        setLoading(true);
        const doc = await fetchDocument(Number(docId));
        setDocument(doc);
      } catch {
        setError('Failed to load document details.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [docId]);

  // Loading progress text cycling during AI generation
  useEffect(() => {
    if (!generating) {
      setLoadingStep(0);
      return;
    }
    const steps = [
      'Scanning notes & segmenting core concepts...',
      'Synthesizing questions & active recall prompts...',
      'Formulating plausible distractors & answer keys...',
      'Verifying strict schema & educational explanations...',
    ];
    const timer = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % steps.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [generating]);

  const handleStartQuiz = async () => {
    if (!docId) return;
    try {
      setGenerating(true);
      setError(null);
      const quiz = await createQuiz(
        Number(docId),
        numQuestions,
        difficulty,
        questionType,
        topicFocus.trim() || null,
        isTimerEnabled ? timeLimitSec : null
      );
      navigate(`/quizzes/${quiz.id}/take`);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to generate quiz. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const difficultyOptions = [
    {
      id: 'easy' as Difficulty,
      name: 'Easy Recall',
      desc: 'Direct definitions, key terms, dates, and explicit facts.',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      dot: 'bg-emerald-500',
    },
    {
      id: 'medium' as Difficulty,
      name: 'Medium Applied',
      desc: 'Understanding, conceptual synthesis, and principle application.',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      dot: 'bg-indigo-500',
    },
    {
      id: 'hard' as Difficulty,
      name: 'Hard Analytical',
      desc: 'Multi-step reasoning, scenario problems, false statement analysis.',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      dot: 'bg-purple-500',
    },
    {
      id: 'mixed' as Difficulty,
      name: 'Mixed Levels',
      desc: 'Balanced distribution: ~30% easy, 50% medium, and 20% hard.',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      dot: 'bg-amber-500',
    },
  ];

  const questionTypeOptions = [
    {
      id: 'mcq' as QuestionType,
      icon: <ListChecks className="w-5 h-5" />,
      name: 'Multiple Choice',
      desc: '4 options — exactly one correct answer with plausible distractors.',
    },
    {
      id: 'true_false' as QuestionType,
      icon: <ToggleLeft className="w-5 h-5" />,
      name: 'True / False',
      desc: 'Fact-checked statements based solely on your lecture notes.',
    },
    {
      id: 'mixed' as QuestionType,
      icon: <Shuffle className="w-5 h-5" />,
      name: 'Mixed Types',
      desc: 'Blend of standard multiple-choice and true/false questions.',
    },
  ];

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-20 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-9 h-9 animate-spin text-purple-600" />
        <p className="text-sm font-semibold text-slate-500">Loading document configuration...</p>
      </div>
    );
  }

  const generationStepMessages = [
    'Scanning notes & segmenting core concepts...',
    'Synthesizing questions & active recall prompts...',
    'Formulating plausible distractors & answer keys...',
    'Verifying strict schema & educational explanations...',
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/upload')}
        className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Documents</span>
      </button>

      {/* Header card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm relative overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700">
                Quiz Generator
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">Custom Assessment</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
              Configure Your Quiz
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Generating from:{' '}
              <span className="font-semibold text-slate-700 inline-flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-purple-600 inline" />
                {document?.title || 'Lecture Document'}
              </span>{' '}
              ({document?.page_count || 1} page{(document?.page_count || 1) > 1 ? 's' : ''})
            </p>
          </div>
        </div>
      </div>

      {/* Skeleton loading modal when generating */}
      {generating && (
        <div className="bg-white rounded-3xl p-8 border border-purple-200 shadow-xl space-y-6 animate-pulse">
          <div className="flex items-center space-x-3 text-purple-700 font-bold">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
            <h2 className="text-lg font-heading">
              {generationStepMessages[loadingStep]}
            </h2>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-purple-100/70 rounded-full w-3/4" />
            <div className="h-4 bg-purple-100/50 rounded-full w-5/6" />
            <div className="h-4 bg-purple-100/30 rounded-full w-2/3" />
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="h-12 bg-slate-100 rounded-xl" />
            <div className="h-12 bg-slate-100 rounded-xl" />
          </div>
          <p className="text-xs text-slate-400 text-center font-medium">
            AI is analyzing your notes. This usually takes 5–20 seconds.
          </p>
        </div>
      )}

      {/* Main configuration controls */}
      <div className={`bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-8 ${generating ? 'hidden' : 'block'}`}>
        {/* 1. Number of questions slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-purple-600" />
              <span>Number of Questions</span>
            </label>
            <span className="font-mono text-base font-extrabold text-purple-700 px-3 py-1 bg-purple-50 border border-purple-200 rounded-xl">
              {numQuestions} Questions
            </span>
          </div>
          <input
            type="range"
            min={5}
            max={30}
            step={1}
            value={numQuestions}
            onChange={(e) => setNumQuestions(Number(e.target.value))}
            className="w-full accent-purple-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>5 (Quick test)</span>
            <span>15 (Standard)</span>
            <span>30 (Full exam)</span>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* 2. Difficulty selector */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Target className="w-4 h-4 text-purple-600" />
            <span>Target Difficulty</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {difficultyOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setDifficulty(opt.id)}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  difficulty === opt.id
                    ? 'border-purple-600 bg-purple-50/60 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 text-sm">{opt.name}</span>
                  <span className={`w-2 h-2 rounded-full ${opt.dot}`} />
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* 3. Question type selector */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <ListChecks className="w-4 h-4 text-purple-600" />
            <span>Question Format</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {questionTypeOptions.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setQuestionType(type.id)}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  questionType === type.id
                    ? 'border-purple-600 bg-purple-50/60 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1.5 text-purple-600">
                  {type.icon}
                  <span className="font-bold text-slate-900 text-sm">{type.name}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{type.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* 4. Timer toggle & configuration */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <TimerIcon className="w-4 h-4 text-purple-600" />
                <span>Countdown Timer</span>
              </label>
              <p className="text-xs text-slate-500">
                Enforce a per-question time limit with auto-advance on zero.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsTimerEnabled(!isTimerEnabled)}
              className={`w-12 h-6 rounded-full transition-colors cursor-pointer relative ${
                isTimerEnabled ? 'bg-purple-600' : 'bg-slate-200'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform absolute top-0.5 ${
                  isTimerEnabled ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {isTimerEnabled && (
            <div className="flex flex-wrap gap-2 pt-1">
              {TIME_LIMITS.map((tl) => (
                <button
                  key={tl.value}
                  type="button"
                  onClick={() => setTimeLimitSec(tl.value)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer ${
                    timeLimitSec === tl.value
                      ? 'border-purple-600 bg-purple-50 text-purple-700 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                  }`}
                >
                  {tl.label} per question
                </button>
              ))}
            </div>
          )}
        </div>

        <hr className="border-slate-100" />

        {/* 5. Optional Topic Focus */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <HelpCircle className="w-4 h-4 text-purple-600" />
            <span>Topic Focus (Optional)</span>
          </label>
          <input
            type="text"
            value={topicFocus}
            onChange={(e) => setTopicFocus(e.target.value)}
            placeholder="e.g. Cellular Respiration, Chapter 4, Keynesian Economics..."
            maxLength={200}
            className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-purple-600 focus:outline-none text-sm text-slate-800 placeholder-slate-400 transition-colors"
          />
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Generate button */}
        <button
          onClick={handleStartQuiz}
          disabled={generating}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-purple-600/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-5 h-5" />
          <span>Generate Quiz &amp; Begin</span>
        </button>
      </div>
    </div>
  );
}
