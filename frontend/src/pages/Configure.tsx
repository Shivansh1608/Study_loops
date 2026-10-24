import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchDocument, createQuiz, type DocumentDetail } from '../api/client';
import {
  Sparkles,
  HelpCircle,
  Clock,
  Sliders,
  ArrowLeft,
  Loader2,
  BrainCircuit,
  FileText,
  ListChecks,
  Target,
  ToggleLeft,
  Shuffle,
  CheckCircle2,
  Timer,
} from 'lucide-react';

type Difficulty = 'easy' | 'medium' | 'hard';
type QuestionType = 'mcq' | 'true_false' | 'mixed';

const TIME_LIMITS: { label: string; value: number | null }[] = [
  { label: 'No Limit', value: null },
  { label: '30s', value: 30 },
  { label: '60s', value: 60 },
  { label: '90s', value: 90 },
  { label: '2 min', value: 120 },
];

export default function Configure() {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();

  const [document, setDocument] = useState<DocumentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [questionType, setQuestionType] = useState<QuestionType>('mcq');
  const [topicFocus, setTopicFocus] = useState('');
  const [timeLimitSec, setTimeLimitSec] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!documentId) return;
      try {
        setLoading(true);
        const doc = await fetchDocument(Number(documentId));
        setDocument(doc);
      } catch {
        setError('Failed to load document details.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [documentId]);

  const handleStartQuiz = async () => {
    if (!documentId) return;
    try {
      setGenerating(true);
      setError(null);
      const quiz = await createQuiz(
        Number(documentId),
        numQuestions,
        difficulty,
        questionType,
        topicFocus.trim() || null,
        timeLimitSec
      );
      navigate(`/quiz/${quiz.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to generate quiz. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const estimatedMinutes = Math.ceil(numQuestions * (timeLimitSec ? timeLimitSec / 60 : 1.5));

  const difficultyOptions = [
    {
      id: 'easy' as Difficulty,
      name: 'Easy Recall',
      desc: 'Direct definitions, key terms, and explicit facts.',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      dot: 'bg-emerald-500',
    },
    {
      id: 'medium' as Difficulty,
      name: 'Conceptual',
      desc: 'Deeper understanding, mechanism explanation, and application.',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      dot: 'bg-indigo-500',
    },
    {
      id: 'hard' as Difficulty,
      name: 'Analytical',
      desc: 'Multi-step reasoning, subtle nuances, evaluating false statements.',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      dot: 'bg-purple-500',
    },
  ];

  const questionTypeOptions = [
    {
      id: 'mcq' as QuestionType,
      icon: <ListChecks className="w-5 h-5" />,
      name: 'Multiple Choice',
      desc: '4 options — one correct answer per question.',
    },
    {
      id: 'true_false' as QuestionType,
      icon: <ToggleLeft className="w-5 h-5" />,
      name: 'True / False',
      desc: 'Statement-based questions with True or False answers.',
    },
    {
      id: 'mixed' as QuestionType,
      icon: <Shuffle className="w-5 h-5" />,
      name: 'Mixed',
      desc: 'Blend of MCQ and True/False for variety.',
    },
  ];

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-16 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <p className="text-sm font-medium text-slate-500">Loading document configuration...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate('/upload')}
        className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Documents</span>
      </button>

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold">
          <BrainCircuit className="w-3.5 h-3.5" />
          <span>AI Quiz Generator</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
          Configure Your Quiz
        </h1>
        {document && (
          <div className="flex items-center space-x-2 text-xs text-slate-500 pt-1">
            <FileText className="w-4 h-4 text-purple-600" />
            <span className="font-semibold text-slate-700">{document.title}</span>
            <span>•</span>
            <span>{document.chunks.length} text chunk(s)</span>
          </div>
        )}
      </div>

      {/* Config form */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-8">

        {/* ── 1. Number of Questions ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
              <Sliders className="w-4 h-4 text-purple-600" />
              <span>Number of Questions</span>
            </label>
            <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-purple-100 text-purple-800">
              {numQuestions} Qs
            </span>
          </div>

          {/* Quick-pick buttons */}
          <div className="grid grid-cols-5 gap-2">
            {[3, 5, 10, 15, 20].map((cnt) => (
              <button
                key={cnt}
                type="button"
                onClick={() => setNumQuestions(cnt)}
                className={`py-2.5 rounded-xl text-sm font-bold border-2 transition-all cursor-pointer ${
                  numQuestions === cnt
                    ? 'border-purple-600 bg-purple-50 text-purple-700 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                }`}
              >
                {cnt}
              </button>
            ))}
          </div>

          {/* Slider */}
          <div className="space-y-1">
            <input
              type="range"
              min={1}
              max={50}
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer accent-purple-600 bg-slate-200"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium px-0.5">
              <span>1</span>
              <span>Custom: {numQuestions}</span>
              <span>50</span>
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* ── 2. Question Type ── */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
            <Target className="w-4 h-4 text-purple-600" />
            <span>Question Type</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {questionTypeOptions.map((opt) => {
              const selected = questionType === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => setQuestionType(opt.id)}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    selected
                      ? 'border-purple-600 bg-purple-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className={`mb-2 ${selected ? 'text-purple-600' : 'text-slate-400'}`}>
                    {opt.icon}
                  </div>
                  <p className="text-sm font-bold text-slate-900">{opt.name}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{opt.desc}</p>
                  {selected && (
                    <div className="mt-2 flex items-center space-x-1 text-purple-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold">Selected</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* ── 3. Difficulty ── */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
            <HelpCircle className="w-4 h-4 text-purple-600" />
            <span>Difficulty Level</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {difficultyOptions.map((opt) => {
              const isSelected = difficulty === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => setDifficulty(opt.id)}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-purple-600 bg-purple-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${opt.dot}`} />
                    <span className="text-sm font-bold text-slate-900">{opt.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${opt.badgeColor}`}>
                      {opt.id}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{opt.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* ── 4. Topic Focus ── */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
            <Target className="w-4 h-4 text-purple-600" />
            <span>Topic Focus <span className="text-slate-400 font-normal text-xs ml-1">(optional)</span></span>
          </label>
          <p className="text-xs text-slate-500">
            Narrow questions to a specific concept or keyword from your notes (e.g. "Photosynthesis", "Newton's Laws").
          </p>
          <input
            type="text"
            value={topicFocus}
            onChange={(e) => setTopicFocus(e.target.value)}
            placeholder="e.g. Krebs cycle, Supply and Demand, World War II..."
            maxLength={200}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:outline-none text-sm text-slate-800 placeholder-slate-400 transition-colors"
          />
        </div>

        <hr className="border-slate-100" />

        {/* ── 5. Time Limit per Question ── */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
            <Timer className="w-4 h-4 text-purple-600" />
            <span>Time Limit per Question</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {TIME_LIMITS.map((tl) => (
              <button
                key={String(tl.value)}
                type="button"
                onClick={() => setTimeLimitSec(tl.value)}
                className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all cursor-pointer ${
                  timeLimitSec === tl.value
                    ? 'border-purple-600 bg-purple-50 text-purple-700 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                }`}
              >
                {tl.label}
              </button>
            ))}
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Estimated time */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs text-slate-600 font-medium">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-purple-600" />
            <span>Estimated completion time:</span>
          </div>
          <span className="font-bold text-slate-800">~{estimatedMinutes} min</span>
        </div>

        {/* Summary pill */}
        <div className="flex flex-wrap gap-2 text-[11px]">
          <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 font-semibold">{numQuestions} Questions</span>
          <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 font-semibold capitalize">{difficulty}</span>
          <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold capitalize">{questionType.replace('_', '/')}</span>
          {topicFocus && <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold">📌 {topicFocus}</span>}
          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold">
            {timeLimitSec ? `${timeLimitSec}s / Q` : 'No timer'}
          </span>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleStartQuiz}
          disabled={generating}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-extrabold text-sm shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Generating {questionType === 'true_false' ? 'True/False' : questionType === 'mixed' ? 'Mixed' : 'MCQ'} Quiz...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate Quiz &amp; Begin</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
