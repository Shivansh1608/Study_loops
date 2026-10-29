import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowRight } from 'lucide-react';

interface RecordItem {
  id?: string | number;
  title?: string;
  score?: number;
  created_at?: string;
  items_count?: number;
}

export function DashboardPreview() {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Attempt backend fetch as requested
    fetch("actions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "records.list", args: {} })
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRecords(data);
        } else if (data?.records && Array.isArray(data.records)) {
          setRecords(data.records);
        } else {
          // Provide fallback demo rows
          setRecords([
            { id: 1, title: 'Cellular Respiration & Krebs Cycle', score: 94, items_count: 15 },
            { id: 2, title: 'European Union Legal Framework', score: 76, items_count: 10 },
            { id: 3, title: 'Linear Algebra: Eigenvalues & Vectors', score: 45, items_count: 12 },
          ]);
        }
      })
      .catch(() => {
        // Fallback demo rows
        setRecords([
          { id: 1, title: 'Cellular Respiration & Krebs Cycle', score: 94, items_count: 15 },
          { id: 2, title: 'European Union Legal Framework', score: 76, items_count: 10 },
          { id: 3, title: 'Linear Algebra: Eigenvalues & Vectors', score: 45, items_count: 12 },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const getScoreBadge = (score?: number) => {
    if (score === undefined) return null;
    if (score >= 80) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#D1FAE5] text-[#22C55E] border border-emerald-200">
          {score}% Mastered
        </span>
      );
    } else if (score >= 50) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#F59E0B] border border-amber-200">
          {score}% In Progress
        </span>
      );
    } else {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FFE4E6] text-[#FF1A1A] border border-rose-200">
          {score}% Needs Review
        </span>
      );
    }
  };

  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-xl mx-auto mb-12">
        <h2 className="text-3xl font-extrabold text-[#1C1917] font-serif-title mb-2">
          Unified study cockpit
        </h2>
        <p className="text-sm text-[#78716C]">
          Every quiz attempt syncs automatically. Re-test weak questions with one tap.
        </p>
      </div>

      {/* Browser frame light with mac dots & quizforge.app address */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-[#F3E8D9] shadow-soft overflow-hidden">
        {/* Frame bar */}
        <div className="px-4 py-3 bg-[#FAFAF9] border-b border-[#F3E8D9] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
            <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
            <span className="w-3 h-3 rounded-full bg-[#22C55E]" />
          </div>
          <div className="px-5 py-1 rounded-md bg-white border border-[#E7E5E4] text-xs text-[#78716C] font-mono flex items-center gap-2">
            <span>https://quizforge.app/dashboard</span>
          </div>
          <div className="w-12" />
        </div>

        {/* Dashboard Content */}
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-[#1C1917]">Recent Quiz Attempts</h3>
            <Link
              to="/upload"
              className="text-xs font-semibold text-[#DC2626] hover:text-[#EF4444] inline-flex items-center gap-1"
            >
              <span>+ Create new</span>
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-[#78716C]">Loading saved records...</div>
          ) : records.length === 0 ? (
            /* Empty state illustration */
            <div className="text-center py-12 px-4 bg-stone-50/50 rounded-xl border border-dashed border-[#F3E8D9]">
              <div className="w-12 h-12 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[#1C1917] mb-1">No quizzes taken yet</h4>
              <p className="text-xs text-[#78716C] mb-4">Paste your first study notes in the demo above or upload a document.</p>
              <Link
                to="/upload"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-[#DC2626] to-[#EF4444] shadow-xs"
              >
                <span>Upload Notes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#F3E8D9]">
              {records.map((r, i) => (
                <div key={r.id || i} className="py-3.5 flex items-center justify-between gap-4 hover:bg-stone-50/60 px-3 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-600">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#1C1917]">{r.title || 'Untitled Quiz'}</h4>
                      <p className="text-[11px] text-[#78716C]">{r.items_count || 10} questions generated</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getScoreBadge(r.score)}
                    <Link
                      to="/quizzes"
                      className="text-xs font-medium text-[#78716C] hover:text-[#1C1917] p-1.5 rounded-md hover:bg-stone-100"
                    >
                      →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

