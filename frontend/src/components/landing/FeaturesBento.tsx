import { useState } from 'react';
import { Layers, HelpCircle, FileText, TrendingUp } from 'lucide-react';

export function FeaturesBento() {
  const [flipped, setFlipped] = useState(false);

  return (
    <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1C1917] font-serif-title mb-3">
          Engineered for rapid retention
        </h2>
        <p className="text-[#78716C] text-base">
          Four synchronized recall modalities extracted from your materials automatically.
        </p>
      </div>

      {/* Bento Grid 2x2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: MCQs (Rose Tint) */}
        <div className="relative bg-white rounded-2xl border border-[#F3E8D9] shadow-soft p-8 overflow-hidden bg-dot-pattern">
          <div className="w-10 h-10 rounded-full bg-[#FFE4E6] flex items-center justify-center text-rose-600 mb-6">
            <HelpCircle className="w-5 h-5" />
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
              Easy
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
              Medium
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800">
              Hard
            </span>
          </div>

          <h3 className="text-xl font-bold text-[#1C1917] mb-2">
            Multi-Tier MCQ Generation
          </h3>
          <p className="text-sm text-[#78716C] leading-relaxed mb-6">
            Intelligent distractors that test deep conceptual understanding, causal reasoning, and fact recall without trivial giveaways.
          </p>

          {/* Interactive Micro Mock */}
          <div className="bg-[#FFE4E6]/30 border border-[#FFE4E6] rounded-xl p-3.5 space-y-2">
            <div className="text-xs font-semibold text-[#1C1917]">
              Which organelle powers oxidative phosphorylation?
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#F3E8D9] text-xs">
              <span className="text-emerald-700 font-medium">Inner Mitochondrial Membrane</span>
              <span className="w-4 h-4 rounded-full bg-[#22C55E] text-white flex items-center justify-center text-[10px]">✓</span>
            </div>
          </div>
        </div>

        {/* Card 2: Flashcards (Amber Tint, 3D flip micro) */}
        <div 
          className="relative bg-white rounded-2xl border border-[#F3E8D9] shadow-soft p-8 overflow-hidden bg-dot-pattern cursor-pointer group"
          onClick={() => setFlipped(!flipped)}
        >
          <div className="w-10 h-10 rounded-full bg-[#FEF3C7] flex items-center justify-center text-amber-600 mb-6">
            <Layers className="w-5 h-5" />
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FEF3C7] text-amber-800">
              SuperMemo-2 Spaced Repetition
            </span>
          </div>

          <h3 className="text-xl font-bold text-[#1C1917] mb-2">
            Smart Flashcard Decks
          </h3>
          <p className="text-sm text-[#78716C] leading-relaxed mb-6">
            Automatically calculates forgetting curves (EFactor, intervals, repetitions) so you only review right before you forget.
          </p>

          {/* 3D Flip micro on hover rotateY 5deg / click flip */}
          <div className="perspective-1000">
            <div
              className={`relative h-24 rounded-xl transition-transform duration-500 transform-style-3d border border-[#FEF3C7] bg-[#FEF3C7]/40 p-4 flex flex-col justify-center items-center text-center group-hover:[transform:rotateY(5deg)] ${
                flipped ? 'rotate-y-180' : ''
              }`}
            >
              {!flipped ? (
                <div>
                  <div className="text-[10px] uppercase font-bold text-amber-800/70 mb-1">FRONT (Click to flip)</div>
                  <div className="text-xs font-semibold text-[#1C1917]">What is the primary function of RuBisCO?</div>
                </div>
              ) : (
                <div className="rotate-y-180">
                  <div className="text-[10px] uppercase font-bold text-emerald-800/70 mb-1">BACK</div>
                  <div className="text-xs font-semibold text-emerald-900">Fixing atmospheric CO2 into 3-PGA in the Calvin cycle</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card 3: Summary (Sky Tint) */}
        <div className="relative bg-white rounded-2xl border border-[#F3E8D9] shadow-soft p-8 overflow-hidden bg-dot-pattern">
          <div className="w-10 h-10 rounded-full bg-[#DBEAFE] flex items-center justify-center text-sky-600 mb-6">
            <FileText className="w-5 h-5" />
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#DBEAFE] text-sky-800">
              High-Yield Synthesis
            </span>
          </div>

          <h3 className="text-xl font-bold text-[#1C1917] mb-2">
            Executive Revision Summaries
          </h3>
          <p className="text-sm text-[#78716C] leading-relaxed mb-6">
            Condenses 50-page slides or dense textbook sections into structured key takeaways, definitions, and exam cheat-sheets.
          </p>

          {/* Bullet checks */}
          <div className="space-y-2 text-xs text-[#1C1917]">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-[#DBEAFE] text-sky-700 flex items-center justify-center text-[10px]">✓</span>
              <span>Categorized key formulas and definitions</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-[#DBEAFE] text-sky-700 flex items-center justify-center text-[10px]">✓</span>
              <span>Timeline of critical historical dates and figures</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-[#DBEAFE] text-sky-700 flex items-center justify-center text-[10px]">✓</span>
              <span>Frequent exam pitfall warnings</span>
            </div>
          </div>
        </div>

        {/* Card 4: Progress (Mint Tint) */}
        <div className="relative bg-white rounded-2xl border border-[#F3E8D9] shadow-soft p-8 overflow-hidden bg-dot-pattern">
          <div className="w-10 h-10 rounded-full bg-[#D1FAE5] flex items-center justify-center text-emerald-600 mb-6">
            <TrendingUp className="w-5 h-5" />
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#D1FAE5] text-emerald-800">
              Mastery Tracking
            </span>
          </div>

          <h3 className="text-xl font-bold text-[#1C1917] mb-2">
            Weak Spot Diagnostics
          </h3>
          <p className="text-sm text-[#78716C] leading-relaxed mb-6">
            Visual breakdown of accuracy across difficulty bands. Targets specifically what you missed until you reach 100% mastery.
          </p>

          {/* Mini Bar Chart Growing */}
          <div className="bg-[#D1FAE5]/30 border border-[#D1FAE5] rounded-xl p-4">
            <div className="flex items-end justify-between h-14 gap-2 pt-2">
              <div className="w-full flex flex-col items-center gap-1">
                <div className="w-full bg-[#EF4444] rounded-t-sm" style={{ height: '35%' }} />
                <span className="text-[9px] text-[#78716C]">Mon</span>
              </div>
              <div className="w-full flex flex-col items-center gap-1">
                <div className="w-full bg-[#EF4444] rounded-t-sm" style={{ height: '52%' }} />
                <span className="text-[9px] text-[#78716C]">Tue</span>
              </div>
              <div className="w-full flex flex-col items-center gap-1">
                <div className="w-full bg-[#EF4444] rounded-t-sm" style={{ height: '68%' }} />
                <span className="text-[9px] text-[#78716C]">Wed</span>
              </div>
              <div className="w-full flex flex-col items-center gap-1">
                <div className="w-full bg-[#EF4444] rounded-t-sm" style={{ height: '84%' }} />
                <span className="text-[9px] text-[#78716C]">Thu</span>
              </div>
              <div className="w-full flex flex-col items-center gap-1">
                <div className="w-full bg-[#DC2626] rounded-t-sm shadow-xs" style={{ height: '96%' }} />
                <span className="text-[9px] font-bold text-[#1C1917]">Today</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
