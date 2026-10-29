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
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#DC2626] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-[#78716C]">Loading your study metrics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner - QuizForge Light/Warm Hero Theme */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FFFBEB] via-[#FFF7ED] to-[#FFE4E6]/40 border border-[#F3E8D9] p-8 sm:p-10 shadow-soft">
        {/* Soft background glow blobs */}
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-[#EF4444]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-[#F59E0B]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/90 border border-[#FEF3C7] text-amber-900 text-xs font-semibold shadow-xs">
              <span className="text-[#F59E0B]">✦</span>
              <span>AI-Powered Study Workspace</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-serif-title text-[#1C1917]">
              Welcome to QuizForge
            </h1>
            <p className="text-[#78716C] text-sm leading-relaxed">
              Transform your raw lecture notes and documents into active recall quizzes, spaced repetition flashcards, and revision summaries.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/upload"
              className="flex items-center space-x-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#DC2626] to-[#EF4444] text-white font-semibold text-sm shadow-glow-red hover:opacity-95 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Notes</span>
            </Link>

            {overview && overview.cards_due_today > 0 && (
              <Link
                to="/review"
                className="flex items-center space-x-2 px-5 py-3 rounded-full bg-white hover:bg-stone-50 text-[#1C1917] border border-[#F3E8D9] font-semibold text-sm shadow-xs transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <BookOpen className="w-4 h-4 text-[#F59E0B]" />
                <span>Review Due Cards ({overview.cards_due_today})</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Quizzes */}
        <div className="bg-white rounded-2xl p-5 border border-[#F3E8D9] shadow-soft flex items-center space-x-4">
          <div className="p-3 bg-[#FFE4E6] rounded-xl text-rose-600">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider">Quizzes Taken</p>
            <p className="text-2xl font-extrabold text-[#1C1917] mt-0.5">
              {overview?.total_quizzes_taken || 0}
            </p>
          </div>
        </div>

        {/* Avg Score */}
        <div className="bg-white rounded-2xl p-5 border border-[#F3E8D9] shadow-soft flex items-center space-x-4">
          <div className="p-3 bg-[#D1FAE5] rounded-xl text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider">Avg Accuracy</p>
            <p className="text-2xl font-extrabold text-[#1C1917] mt-0.5">
              {overview?.average_score_pct || 0}%
            </p>
          </div>
        </div>

        {/* Cards Due */}
        <div className="bg-white rounded-2xl p-5 border border-[#F3E8D9] shadow-soft flex items-center space-x-4">
          <div className="p-3 bg-[#FEF3C7] rounded-xl text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider">Cards Due Today</p>
            <p className="text-2xl font-extrabold text-[#1C1917] mt-0.5">
              {overview?.cards_due_today || 0}
            </p>
          </div>
        </div>

        {/* Cards Mastered */}
        <div className="bg-white rounded-2xl p-5 border border-[#F3E8D9] shadow-soft flex items-center space-x-4">
          <div className="p-3 bg-[#DBEAFE] rounded-xl text-sky-600">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider">Mastered Cards</p>
            <p className="text-2xl font-extrabold text-[#1C1917] mt-0.5">
              {overview?.cards_mastered || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Charts & Weak Topics */}
      <ProgressChart
        scoresOverTime={scoresOverTime}
        topicScores={topicScores}
        weakTopics={weakTopics}
        onPracticeWeakTopics={() => navigate('/upload')}
      />

      {/* Recent Notes Documents Table */}
      <div className="bg-white rounded-2xl border border-[#F3E8D9] shadow-soft p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#1C1917]">Your Uploaded Notes</h3>
            <p className="text-xs text-[#78716C]">Documents synthesized into questions and flashcard decks</p>
          </div>
          <Link
            to="/upload"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#DC2626] hover:text-[#EF4444] transition-colors"
          >
            <span>+ Add new material</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-[#F3E8D9] rounded-2xl bg-stone-50/50">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-[#DC2626] flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-[#1C1917]">No notes documents uploaded yet</h4>
            <p className="text-xs text-[#78716C] max-w-sm mx-auto mt-1 mb-4">
              Upload your lecture slides (PDF/DOCX) or paste raw text to forge active-recall study sets.
            </p>
            <Link
              to="/upload"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#DC2626] to-[#EF4444] text-white font-semibold text-xs shadow-glow-red hover:opacity-95"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload First Document</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#F3E8D9] text-[#78716C] uppercase font-bold text-[10px] tracking-wider">
                  <th className="pb-3 px-2">Document Title</th>
                  <th className="pb-3 px-2">File Type</th>
                  <th className="pb-3 px-2">Words</th>
                  <th className="pb-3 px-2">Quizzes Forged</th>
                  <th className="pb-3 px-2">Uploaded</th>
                  <th className="pb-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3E8D9]">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3.5 px-2 font-semibold text-[#1C1917] flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-stone-400 shrink-0" />
                      <span className="truncate max-w-xs">{doc.title}</span>
                    </td>
                    <td className="py-3.5 px-2">
                      <span className="px-2 py-0.5 rounded-full bg-stone-100 text-[#78716C] font-mono text-[10px] uppercase">
                        {doc.file_type || 'TEXT'}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-[#78716C]">
                      {doc.chunk_count ? `${doc.chunk_count} chunks` : '—'}
                    </td>
                    <td className="py-3.5 px-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#FFE4E6] text-rose-800 font-semibold text-[10px]">
                        {doc.page_count ? `${doc.page_count} pages` : '1 set'}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-[#78716C]">
                      {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'Recent'}
                    </td>
                    <td className="py-3.5 px-2 text-right">
                      <Link
                        to={`/quizzes?doc_id=${doc.id}`}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-full bg-white border border-[#F3E8D9] hover:border-rose-300 text-[#1C1917] hover:text-[#DC2626] font-semibold text-[11px] shadow-xs transition-colors"
                      >
                        <PlayCircle className="w-3.5 h-3.5 text-[#DC2626]" />
                        <span>Practice</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
