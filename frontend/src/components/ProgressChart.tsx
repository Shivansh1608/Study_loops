import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar, 
  Cell 
} from 'recharts';
import { type ScoreOverTime, type TopicScore, type WeakTopic } from '../api/client';
import { TrendingUp, BarChart2, AlertTriangle, ArrowRight } from 'lucide-react';

interface ProgressChartProps {
  scoresOverTime: ScoreOverTime[];
  topicScores: TopicScore[];
  weakTopics: WeakTopic[];
  onPracticeWeakTopics?: () => void;
}

export function ProgressChart({
  scoresOverTime,
  topicScores,
  weakTopics,
  onPracticeWeakTopics,
}: ProgressChartProps) {
  // Colors for topic bars
  const getBarColor = (accuracy: number) => {
    if (accuracy >= 80) return '#10b981'; // green
    if (accuracy >= 60) return '#6366f1'; // indigo
    return '#f43f5e'; // rose
  };

  return (
    <div className="space-y-8">
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Trend Line / Area Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-800 font-heading">Score History Trend</h3>
            </div>
            <span className="text-xs text-slate-400">Score % vs Date</span>
          </div>

          <div className="h-64 w-full">
            {scoresOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scoresOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e1b4b',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                    }}
                    formatter={(value: any) => [`${value}%`, 'Accuracy']}
                  />
                  <Area
                    type="monotone"
                    dataKey="score_pct"
                    stroke="#7c3aed"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#scoreGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
                <p>No quiz attempts recorded yet.</p>
                <p className="text-xs mt-1">Take your first quiz to see your trend!</p>
              </div>
            )}
          </div>
        </div>

        {/* Topic Accuracy Bar Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <BarChart2 className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-800 font-heading">Accuracy by Topic</h3>
            </div>
            <span className="text-xs text-slate-400">Mastery %</span>
          </div>

          <div className="h-64 w-full">
            {topicScores.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topicScores} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="topic" 
                    tick={{ fontSize: 10, fill: '#64748b' }} 
                    angle={-20} 
                    textAnchor="end" 
                    interval={0}
                  />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e1b4b',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                    }}
                    formatter={(val: any) => [`${val}%`, 'Accuracy']}
                  />
                  <Bar dataKey="accuracy_pct" radius={[6, 6, 0, 0]}>
                    {topicScores.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(entry.accuracy_pct)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
                <p>No topic breakdown data yet.</p>
                <p className="text-xs mt-1">Quiz attempts will automatically build topic stats.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weak Topics Drill Section */}
      {weakTopics.length > 0 && (
        <div className="bg-gradient-to-r from-rose-50 via-orange-50 to-amber-50 rounded-2xl p-6 border border-rose-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-rose-700">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <h4 className="font-bold font-heading text-base">Recommended Practice Areas</h4>
              </div>
              <p className="text-xs text-slate-600 max-w-xl">
                Topics where your quiz accuracy is below 70%. Reinforcing these topics yields the highest score improvement.
              </p>
            </div>

            {onPracticeWeakTopics && (
              <button
                onClick={onPracticeWeakTopics}
                className="flex items-center space-x-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-500/20 transition-all cursor-pointer whitespace-nowrap"
              >
                <span>Practice Weak Topics</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {weakTopics.map((wt, i) => (
              <div
                key={i}
                className="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-rose-200 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-slate-800">{wt.topic}</p>
                  <p className="text-[11px] text-rose-600 font-semibold">{wt.missed_count} questions missed</p>
                </div>
                <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-rose-100 text-rose-700">
                  {wt.accuracy_pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
