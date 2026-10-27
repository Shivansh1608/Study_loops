import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  BrainCircuit, 
  Layers, 
  FileText, 
  Flame, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  ChevronRight,
  BookOpen,
  GraduationCap,
  Play,
  RotateCw
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function Landing() {
  const { isAuthenticated } = useAuthStore();
  const [flipped, setFlipped] = useState(false);
  const [selectedDemoAnswer, setSelectedDemoAnswer] = useState<number | null>(null);

  const demoOptions = [
    "It produces ATP during light-dependent reactions",
    "It fixes atmospheric CO2 into 3-PGA in the stroma",
    "It breaks down glucose through glycolysis",
    "It absorbs green photons to excite electrons"
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-slate-100 min-h-screen">
      {/* Background Glow Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-tr from-purple-600/30 via-indigo-500/20 to-pink-500/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute top-[600px] left-10 w-[500px] h-[400px] bg-indigo-600/15 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute top-[800px] right-10 w-[600px] h-[500px] bg-purple-600/15 blur-[140px] pointer-events-none rounded-full" />

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 md:pt-20 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs sm:text-sm font-semibold backdrop-blur-md shadow-lg shadow-purple-500/10 hover:border-purple-500/50 transition-all">
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
            <span>Next-Gen Active Recall & Spaced Repetition</span>
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span className="text-purple-200">Zero Hallucinations</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-heading tracking-tight text-white leading-[1.1]">
            Turn Any Lecture Notes Into{' '}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-300 bg-clip-text text-transparent">
              Exam-Crushing Quizzes
            </span>{' '}
            in Seconds.
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Stop passively reading highlights. Upload raw PDFs or paste notes — our AI generates 
            interactive practice tests, active-recall flashcards, and comprehensive revision guides.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to={isAuthenticated ? "/dashboard" : "/register"}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all text-base"
            >
              <span>{isAuthenticated ? "Go to Dashboard" : "Start Studying Free"}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to={isAuthenticated ? "/upload" : "/login"}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 shadow-lg backdrop-blur-sm hover:scale-[1.02] active:scale-[0.98] transition-all text-base"
            >
              <Play className="w-4 h-4 text-purple-400 fill-purple-400" />
              <span>{isAuthenticated ? "Upload Notes" : "Sign In to Account"}</span>
            </Link>
          </div>

          {/* Micro Proof */}
          <div className="flex items-center justify-center gap-6 pt-4 text-xs sm:text-sm text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Grounded in your text only</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>SuperMemo SM-2 Algorithm</span>
            </div>
            <div className="flex items-center gap-1.5 hidden sm:flex">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Free for students</span>
            </div>
          </div>
        </div>

        {/* Interactive Live Demo Preview Box */}
        <div className="mt-16 max-w-5xl mx-auto rounded-2xl border border-slate-700/60 bg-slate-900/80 p-2 sm:p-4 backdrop-blur-xl shadow-2xl shadow-indigo-950/80">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 font-mono text-slate-400">Interactive Demo: Biology 101 Notes</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold text-[11px]">
              Live Simulator
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 sm:p-6">
            {/* Left: Interactive Quiz Question Demo */}
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">
                    Question 1 of 5 • Multiple Choice
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Medium
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-4">
                  According to the lecture notes, what is the primary biochemical role of the enzyme RuBisCO?
                </h3>
                <div className="space-y-2">
                  {demoOptions.map((opt, idx) => {
                    const isSelected = selectedDemoAnswer === idx;
                    const isCorrect = idx === 1;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedDemoAnswer(idx)}
                        className={`w-full text-left p-3 rounded-lg text-sm transition-all border ${
                          isSelected
                            ? isCorrect
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200'
                              : 'bg-rose-500/20 border-rose-500 text-rose-200'
                            : 'bg-slate-900/60 border-slate-700 hover:border-slate-500 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{opt}</span>
                          {isSelected && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedDemoAnswer !== null && (
                <div className="mt-4 p-3 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-xs text-indigo-200">
                  <span className="font-bold text-indigo-300">Explanation: </span>
                  RuBisCO catalyzes the first major step of carbon fixation in the Calvin cycle, bonding CO2 with RuBP to create 3-PGA.
                </div>
              )}
            </div>

            {/* Right: Interactive 3D Flashcard Flip Demo */}
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-5 flex flex-col items-center justify-center text-center">
              <div className="w-full flex items-center justify-between mb-3 text-xs text-slate-400">
                <span className="font-semibold text-pink-400">Active Recall Card</span>
                <button
                  onClick={() => setFlipped(!flipped)}
                  className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Click to flip</span>
                </button>
              </div>

              <div
                onClick={() => setFlipped(!flipped)}
                className="w-full h-56 rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-900/40 via-indigo-900/30 to-slate-900 p-6 flex flex-col items-center justify-center cursor-pointer shadow-inner hover:border-purple-500/60 transition-all select-none"
              >
                {!flipped ? (
                  <div className="space-y-3">
                    <span className="text-xs uppercase font-bold tracking-wider text-purple-300 bg-purple-500/20 px-2 py-1 rounded">
                      Front Prompt
                    </span>
                    <p className="text-lg font-bold text-white">
                      What is the difference between active transport and passive facilitated diffusion?
                    </p>
                    <p className="text-xs text-slate-400">Tap to reveal answer & formula</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <span className="text-xs uppercase font-bold tracking-wider text-emerald-300 bg-emerald-500/20 px-2 py-1 rounded">
                      Back Solution
                    </span>
                    <p className="text-sm font-medium text-slate-200">
                      Active transport requires energy (ATP hydrolysis) to pump solutes against electrochemical gradients. Passive facilitated diffusion relies on channel proteins along gradients without energy.
                    </p>
                    <div className="flex justify-center gap-2 pt-2">
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-xs">Hard</span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-xs">Good</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs">Easy</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-purple-400">
            Engineered For Top Grades
          </h2>
          <p className="text-3xl sm:text-5xl font-extrabold text-white font-heading">
            Everything you need to master your coursework.
          </p>
          <p className="text-slate-400 text-base sm:text-lg">
            Powered by cognitive science principles: testing effect, spaced repetition, and interleaving.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="md:col-span-2 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-8 hover:border-purple-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              AI-Generated Quizzes with Fact Grounding
            </h3>
            <p className="text-slate-400 leading-relaxed mb-6">
              Generate Multiple Choice, True/False, or mixed assessment sets customized by difficulty 
              (Easy, Medium, Hard). Our prompts enforce strict 100% adherence to your uploaded materials — zero made-up hallucinated facts.
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-slate-800 text-purple-300 border border-purple-500/20">Custom Question Counts</span>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-purple-300 border border-purple-500/20">Step-by-Step Rationale</span>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-purple-300 border border-purple-500/20">Difficulty Tagging</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-8 hover:border-indigo-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              SM-2 Spaced Repetition
            </h3>
            <p className="text-slate-400 leading-relaxed mb-6">
              Never experience the forgetting curve. Review cards right when your brain is about to forget them, optimizing study time by up to 60%.
            </p>
            <div className="flex items-center gap-2 text-indigo-300 text-sm font-semibold">
              <Flame className="w-4 h-4 text-orange-400" />
              <span>Smart Review Scheduling</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-8 hover:border-pink-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 mb-6 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              Rich Revision Guides
            </h3>
            <p className="text-slate-400 leading-relaxed mb-6">
              Turn 40-page messy slides into clean, structured Markdown summaries packed with key definitions, worked formulas, concrete examples, and predicted exam questions.
            </p>
            <div className="flex items-center gap-2 text-pink-300 text-sm font-semibold">
              <CheckCircle2 className="w-4 h-4 text-pink-400" />
              <span>800–1500+ words of structured review</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="md:col-span-2 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-8 hover:border-emerald-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              Mastery Tracking & Streak Metrics
            </h3>
            <p className="text-slate-400 leading-relaxed mb-6">
              Track your daily study streak, accuracy rate across attempts, questions answered, and cards due today. Celebrate consistency and identify weak topics before exam day.
            </p>
            <div className="grid grid-cols-3 gap-4 border-t border-slate-800 pt-4">
              <div>
                <p className="text-2xl font-black text-white">100%</p>
                <p className="text-xs text-slate-400">Grounding Guarantee</p>
              </div>
              <div>
                <p className="text-2xl font-black text-emerald-400">&lt; 1s</p>
                <p className="text-xs text-slate-400">Response Speed</p>
              </div>
              <div>
                <p className="text-2xl font-black text-purple-400">3x</p>
                <p className="text-xs text-slate-400">Retention Multiplier</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-indigo-400">
            Dead Simple Workflow
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white font-heading">
            How NoteWise AI transforms your study routine
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="relative p-6 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/40 text-purple-400 font-black text-xl flex items-center justify-center mb-6">
              1
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Upload or Paste Notes</h4>
            <p className="text-slate-400 text-sm">
              Upload PDF slides, textbook excerpts, or paste messy lecture notes directly.
            </p>
          </div>

          <div className="relative p-6 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 font-black text-xl flex items-center justify-center mb-6">
              2
            </div>
            <h4 className="text-xl font-bold text-white mb-2">AI Analyzes & Generates</h4>
            <p className="text-slate-400 text-sm">
              Gemini extracts key definitions, relationships, and generates custom quizzes & spaced repetition cards.
            </p>
          </div>

          <div className="relative p-6 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 font-black text-xl flex items-center justify-center mb-6">
              3
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Practice & Ace Exams</h4>
            <p className="text-slate-400 text-sm">
              Take timed tests, flip through active-recall cards, and review detailed revision guides with worked examples.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="rounded-3xl bg-gradient-to-r from-purple-900/80 via-indigo-900/70 to-slate-900 p-8 sm:p-14 border border-purple-500/30 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black text-white font-heading">
              Ready to learn twice as fast?
            </h2>
            <p className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto">
              Join students using NoteWise AI to retain more, study less, and score higher.
            </p>
            <div className="pt-2">
              <Link
                to={isAuthenticated ? "/dashboard" : "/register"}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-600/40 hover:scale-105 active:scale-95 transition-all text-lg"
              >
                <span>{isAuthenticated ? "Enter Study Dashboard" : "Get Started For Free"}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
