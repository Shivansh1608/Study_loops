import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  fetchProgressOverview, 
  fetchScoresOverTime, 
  fetchTopicScores, 
  fetchWeakTopics,
  fetchDocuments,
  type ProgressOverview,
  type ScoreOverTime,
  type TopicScore,
  type WeakTopic,
  type DocumentItem
} from '../api/client';
import { ProgressChart } from '../components/ProgressChart';
import { 
  Sparkles, 
  UploadCloud, 
  BookOpen, 
  Award, 
  Layers, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  FileText,
  PlayCircle
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<ProgressOverview | null>(null);
  const [scoresOverTime, setScoresOverTime] = useState<ScoreOverTime[]>([]);
  const [topicScores, setTopicScores] = useState<TopicScore[]>([]);
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [ov, sot, ts, wt, docs] = await Promise.all([
          fetchProgressOverview(),
          fetchScoresOverTime(),
          fetchTopicScores(),
          fetchWeakTopics(),
          fetchDocuments(),
        ]);
        setOverview(ov);
        setScoresOverTime(sot);
        setTopicScores(ts);
        setWeakTopics(wt);
        setDocuments(docs);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading your study metrics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-8 sm:p-10 shadow-xl">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-purple-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>AI-Powered Study Workspace</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading text-white">
              Welcome to NoteWise AI
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Transform your raw lecture notes and documents into active recall quizzes, spaced repetition flashcards, and revision summaries.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/upload"
              className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-lg shadow-purple-500/25 transition-all hover:scale-105 active:scale-95"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Notes</span>
            </Link>

            {overview && overview.cards_due_today > 0 && (
              <Link
                to="/review"
                className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm backdrop-blur-md transition-all hover:scale-105 active:scale-95"
              >
                <BookOpen className="w-4 h-4 text-amber-300" />
                <span>Review Due Cards ({overview.cards_due_today})</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Quizzes */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quizzes Taken</p>
            <p className="text-2xl font-extrabold font-heading text-slate-900 mt-0.5">
              {overview?.total_quizzes_taken || 0}
            </p>
          </div>
        </div>

        {/* Avg Score */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Accuracy</p>
            <p className="text-2xl font-extrabold font-heading text-slate-900 mt-0.5">
              {overview?.average_score_pct || 0}%
            </p>
          </div>
        </div>

        {/* Cards Due */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cards Due Today</p>
            <p className="text-2xl font-extrabold font-heading text-slate-900 mt-0.5">
              {overview?.cards_due_today || 0}
            </p>
          </div>
        </div>

        {/* Cards Mastered */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mastered Cards</p>
            <p className="text-2xl font-extrabold font-heading text-slate-900 mt-0.5">
              {overview?.cards_mastered || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Charts & Analytics */}
      <ProgressChart
        scoresOverTime={scoresOverTime}
        topicScores={topicScores}
        weakTopics={weakTopics}
        onPracticeWeakTopics={() => {
          if (documents.length > 0) {
            navigate(`/configure/${documents[0].id}`);
          } else {
            navigate('/upload');
          }
        }}
      />

      {/* Documents Quick Access Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold font-heading text-lg text-slate-800">Your Study Documents</h3>
          </div>
          <Link
            to="/upload"
            className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center space-x-1"
          >
            <span>Manage All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.slice(0, 6).map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-xl border border-slate-200/80 hover:border-purple-300 bg-slate-50/50 hover:bg-white transition-all space-y-3 group"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                      {doc.file_type}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 group-hover:text-purple-700 line-clamp-1">
                      {doc.title}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {doc.page_count} pages • {doc.chunk_count} chunk(s)
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-medium">
                  <Link
                    to={`/configure/${doc.id}`}
                    className="text-purple-600 hover:text-purple-700 font-semibold flex items-center space-x-1"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>Take Quiz</span>
                  </Link>

                  <Link
                    to={`/summary/${doc.id}`}
                    className="text-slate-500 hover:text-slate-800"
                  >
                    Summary
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl">
            <UploadCloud className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No documents uploaded yet</p>
            <p className="text-xs text-slate-400 mt-1">Upload lecture notes or a PDF to start generating quizzes!</p>
            <Link
              to="/upload"
              className="inline-block mt-4 px-4 py-2 bg-purple-600 text-white font-semibold text-xs rounded-xl shadow-xs"
            >
              Upload Your First Document
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
