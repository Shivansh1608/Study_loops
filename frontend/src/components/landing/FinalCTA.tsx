import { useState } from 'react';
import { Shield, Zap, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export function FinalCTA() {
  const [topicInput, setTopicInput] = useState('');

  return (
    <section className="py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Card with gradient border red->amber, light bg */}
      <div className="relative p-1 rounded-3xl bg-gradient-to-r from-[#DC2626] via-[#EF4444] to-[#F59E0B] shadow-soft">
        <div className="bg-[#FFFDf8] rounded-[22px] p-8 sm:p-14 text-center">
          {/* Subtle Tag */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#F3E8D9] text-[#78716C] text-xs font-medium mb-6 shadow-xs">
            <span className="text-[#F59E0B]">✨</span>
            <span>New — Light UI • Soft colors</span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1C1917] font-serif-title mb-4 tracking-tight">
            Ready to forge your first quiz? ✨
          </h2>
          <p className="text-sm sm:text-base text-[#78716C] max-w-lg mx-auto mb-8">
            Free • No credit card • 30s setup • Works with any notes
          </p>

          {/* Input + Button Inline Soft Shadow */}
          <div className="max-w-md mx-auto mb-10">
            <div className="flex flex-col sm:flex-row items-center gap-2 p-1.5 bg-white rounded-2xl sm:rounded-full border border-[#F3E8D9] shadow-soft">
              <Link
                to="/register"
                className="w-full sm:w-auto px-6 py-3 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-[#DC2626] to-[#EF4444] shadow-glow-red hover:opacity-95 transition-opacity shrink-0 flex items-center justify-center gap-1.5"
              >
                <span>Start for free</span>
                <span>→</span>
              </Link>
              <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder="Paste a topic e.g. Photosynthesis"
                className="w-full px-4 py-2 text-xs sm:text-sm text-[#1C1917] bg-transparent focus:outline-none placeholder:text-stone-400"
              />
              <a
                href="#demo"
                className="w-full sm:w-auto px-4 py-2 rounded-full text-xs font-semibold text-[#1C1917] bg-stone-100 hover:bg-stone-200 transition-colors shrink-0"
              >
                Try sample
              </a>
            </div>
          </div>

          {/* Guarantees with icons in colored circles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto pt-6 border-t border-[#F3E8D9]">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/70 border border-[#F3E8D9]">
              <div className="w-8 h-8 rounded-full bg-[#FFE4E6] flex items-center justify-center text-[#DC2626]">
                <Zap className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-[#1C1917]">No signup for demo</div>
                <div className="text-[10px] text-[#78716C]">Generate Instantly</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/70 border border-[#F3E8D9]">
              <div className="w-8 h-8 rounded-full bg-[#DBEAFE] flex items-center justify-center text-sky-600">
                <Shield className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-[#1C1917]">Private & fast</div>
                <div className="text-[10px] text-[#78716C]">Your notes stay yours</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/70 border border-[#F3E8D9]">
              <div className="w-8 h-8 rounded-full bg-[#D1FAE5] flex items-center justify-center text-emerald-600">
                <Clock className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-[#1C1917]">SM-2 built-in</div>
                <div className="text-[10px] text-[#78716C]">Remember longer</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
