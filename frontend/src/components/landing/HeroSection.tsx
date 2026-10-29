import { motion } from 'framer-motion';
import { Check, Clock } from 'lucide-react';
import { ThreeHeroScene } from './ThreeHeroScene';

export function HeroSection() {
  return (
    <section className="relative pt-12 pb-20 md:pt-16 md:pb-28 overflow-hidden">
      {/* Three.js Background Orbs */}
      <ThreeHeroScene />

      {/* Soft Blurred Color Blobs (Red 200px + Amber 150px low opacity) */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-3/4 -translate-y-1/2 w-[260px] h-[260px] rounded-full bg-[#EF4444]/15 blur-[90px] pointer-events-none" 
        aria-hidden="true" 
      />
      <div 
        className="absolute top-1/3 left-1/2 translate-x-1/4 -translate-y-1/3 w-[220px] h-[220px] rounded-full bg-[#F59E0B]/15 blur-[80px] pointer-events-none" 
        aria-hidden="true" 
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Top Announcement Pill */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-[#FEF3C7] text-stone-700 text-xs sm:text-sm font-medium shadow-soft mb-6 hover:border-amber-300 transition-colors cursor-pointer"
        >
          <span className="text-[#F59E0B]">✦</span>
          <span>Upload notes → Quiz in 12s</span>
          <span className="w-5 h-5 rounded-full bg-stone-900 text-white inline-flex items-center justify-center text-[10px]">
            →
          </span>
        </motion.div>

        {/* H1 Heading with Red Scribble Underline */}
        <motion.h1 
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-[68px] font-extrabold text-[#1C1917] tracking-tight leading-[1.08] mb-6 font-serif-title"
        >
          Turn notes into{' '}
          <span className="relative inline-block text-[#1C1917]">
            <span>quizzes</span>
            {/* Hand-drawn scribble SVG underline */}
            <svg
              className="absolute -bottom-2 left-0 w-full overflow-visible"
              viewBox="0 0 250 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 13C50 4 150 2 245 11C180 18 100 15 25 17"
                stroke="#EF4444"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.85"
              />
            </svg>
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg text-[#78716C] max-w-xl mx-auto leading-relaxed mb-8"
        >
          Upload PDF, DOCX or TXT. Get MCQs, flashcards and summary. No signup needed for demo.
        </motion.p>

        {/* Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-16"
        >
          <a
            href="#demo"
            className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3 rounded-full text-base font-semibold text-white bg-gradient-to-r from-[#DC2626] to-[#EF4444] shadow-glow-red hover:scale-[1.01] active:scale-[0.99] transition-transform"
          >
            Try demo — free
          </a>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3 rounded-full text-base font-semibold text-[#1C1917] bg-white border border-[#F3E8D9] hover:bg-stone-50 shadow-xs hover:scale-[1.01] active:scale-[0.99] transition-transform"
          >
            See how it works
          </a>
        </motion.div>

        {/* Browser Mockup Below */}
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative max-w-3xl mx-auto"
        >
          {/* Floating Pill Badges */}
          <div className="absolute -top-5 -left-4 sm:-left-8 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 px-4 shadow-soft border border-[#F3E8D9] flex items-center gap-3 animate-bounce" style={{ animationDuration: '4s' }}>
            <div className="w-8 h-8 rounded-full bg-[#D1FAE5] flex items-center justify-center text-[#22C55E]">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
            <div className="text-left">
              <div className="text-[10px] font-semibold tracking-wider text-[#78716C] uppercase">SCORE</div>
              <div className="text-xs sm:text-sm font-bold text-[#1C1917] flex items-center gap-1.5">
                92% • Excellent <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
              </div>
            </div>
          </div>

          <div className="absolute -bottom-4 -right-2 sm:-right-6 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 px-4 shadow-soft border border-[#FEF3C7] flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#FEF3C7] flex items-center justify-center text-[#F59E0B]">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <div className="text-[9px] font-bold text-[#78716C] uppercase">DUE TODAY</div>
              <div className="text-xs font-bold text-[#1C1917]">7 cards • SM-2</div>
            </div>
            <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-ping" />
          </div>

          {/* Browser Window Frame */}
          <div className="bg-white rounded-2xl border border-[#F3E8D9] shadow-soft overflow-hidden">
            {/* Browser Header Bar */}
            <div className="px-4 py-3 bg-[#FAFAF9] border-b border-[#F3E8D9] flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
                <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                <span className="w-3 h-3 rounded-full bg-[#22C55E]" />
              </div>
              <div className="px-4 py-1 rounded-md bg-white border border-[#E7E5E4] text-xs text-[#78716C] font-mono flex items-center gap-2">
                <span>quizforge.app/study/...</span>
              </div>
              <div className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Live
              </div>
            </div>

            {/* Browser Body with 3 Quiz Cards */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#FFFDf8]/50">
              {/* Card 1 - Photosynthesis */}
              <div className="bg-white p-4 rounded-xl border border-[#F3E8D9] shadow-xs text-left transform md:-rotate-2 hover:rotate-0 transition-transform">
                <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FFE4E6] text-rose-700 mb-2">
                  92% avg
                </span>
                <h4 className="text-sm font-bold text-[#1C1917] mb-3">Photosynthesis — 3 Qs</h4>
                <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#1C1917] h-full rounded-full" style={{ width: '92%' }} />
                </div>
                <div className="flex justify-between items-center text-[10px] text-[#78716C] mt-2">
                  <span>Biology 101</span>
                  <span>92%</span>
                </div>
              </div>

              {/* Card 2 - WWII Timeline */}
              <div className="bg-white p-4 rounded-xl border border-[#F3E8D9] shadow-xs text-left transform md:translate-y-[-4px] hover:translate-y-0 transition-transform">
                <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-amber-800 mb-2">
                  7 cards
                </span>
                <h4 className="text-sm font-bold text-[#1C1917] mb-3">WWII Timeline</h4>
                <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#1C1917] h-full rounded-full" style={{ width: '68%' }} />
                </div>
                <div className="flex justify-between items-center text-[10px] text-[#78716C] mt-2">
                  <span>History</span>
                  <span>68%</span>
                </div>
              </div>

              {/* Card 3 - Python Basics */}
              <div className="bg-white p-4 rounded-xl border border-[#F3E8D9] shadow-xs text-left transform md:rotate-2 hover:rotate-0 transition-transform">
                <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#D1FAE5] text-emerald-800 mb-2">
                  Summary ready
                </span>
                <h4 className="text-sm font-bold text-[#1C1917] mb-3">Python Basics</h4>
                <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#1C1917] h-full rounded-full" style={{ width: '44%' }} />
                </div>
                <div className="flex justify-between items-center text-[10px] text-[#78716C] mt-2">
                  <span>Computer Science</span>
                  <span>44%</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Small social proof stat strip below mockup */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[#78716C]">
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 inline-flex items-center justify-center text-[10px]">✓</span>
            Students from 120+ universities
          </span>
          <span>•</span>
          <span>4.9/5 • 2.3k reviews</span>
          <span>•</span>
          <span className="text-[#22C55E] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
            No data stored until you finish
          </span>
        </div>
      </div>
    </section>
  );
}
