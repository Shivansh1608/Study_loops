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
  const getBarColor = (accuracy: number) => {
    if (accuracy >= 80) return '#22C55E'; // green
    if (accuracy >= 60) return '#F59E0B'; // amber
    return '#DC2626'; // red
  };

  return (
    <div className="space-y-8">
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Trend Line / Area Chart */}
        <div className="bg-white rounded-2xl p-6 border border-[#F3E8D9] shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-[#FFE4E6] rounded-xl text-[#DC2626]">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-[#1C1917]">Score History Trend</h3>
            </div>
            <span className="text-xs text-[#78716C]">Score % vs Date</span>
          </div>

          <div className="h-64 w-full">
            {scoresOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scoresOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3E8D9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#78716C' }} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#78716C' }} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1C1917',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    }}
                    formatter={(val: any) => [`${val}%`, 'Score']}
                  />
                  <Area
                    type="monotone"
                    dataKey="score_pct"
                    stroke="#DC2626"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#scoreGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#78716C]">
                Take your first quiz to chart performance history
              </div>
            )}
          </div>
        </div>

        {/* Topic Breakdown Bar Chart */}
        <div className="bg-white rounded-2xl p-6 border border-[#F3E8D9] shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-[#D1FAE5] rounded-xl text-emerald-600">
                <BarChart2 className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-[#1C1917]">Accuracy by Topic</h3>
            </div>
            <span className="text-xs text-[#78716C]">Mastery %</span>
          </div>

          <div className="h-64 w-full">
            {topicScores.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topicScores} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3E8D9" />
                  <XAxis
                    dataKey="topic"
                    tick={{ fontSize: 10, fill: '#78716C' }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    tickLine={false}
                  />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#78716C' }} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1C1917',
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
              <div className="h-full flex items-center justify-center text-xs text-[#78716C]">
                No topic scores tracked yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weak Topics Diagnostic Banner */}
      {weakTopics && weakTopics.length > 0 && (
        <div className="p-5 rounded-2xl bg-[#FFE4E6]/50 border border-[#FECDD3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#FFE4E6] text-[#DC2626] rounded-xl shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-950">Recommended Practice Areas</h4>
              <p className="text-xs text-rose-800 mt-0.5">
                Targeting topics under 70% accuracy: {weakTopics.map(w => w.topic).join(', ')}
              </p>
            </div>
          </div>
          {onPracticeWeakTopics && (
            <button
              onClick={onPracticeWeakTopics}
              className="px-4 py-2 bg-gradient-to-r from-[#DC2626] to-[#EF4444] text-white rounded-full text-xs font-semibold shadow-glow-red hover:opacity-95 flex items-center space-x-1 shrink-0 cursor-pointer"
            >
              <span>Practice Weak Spots</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
