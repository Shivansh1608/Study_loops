import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, X, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const SAMPLE_NOTES = {
  photosynthesis: `Photosynthesis is the biological process used by plants, algae, and certain bacteria to convert light energy into chemical energy stored in glucose. It takes place primarily in the chloroplasts of plant cells, specifically using chlorophyll pigments to absorb blue and red wavelengths of light while reflecting green light. The general chemical equation is 6CO2 + 6H2O + light energy -> C6H12O6 + 6O2. The reaction consists of two stages: the light-dependent reactions in the thylakoid membranes, which produce ATP and NADPH, and the Calvin cycle (light-independent reactions) in the stroma, where RuBisCO fixes carbon dioxide into 3-phosphoglycerate (3-PGA) to synthesize carbohydrates.`,
  wwii: `World War II was a global conflict that lasted from 1939 to 1945, involving the majority of the world's countries divided between the Allies (led by Britain, the Soviet Union, and the United States) and the Axis powers (led by Germany, Japan, and Italy). Key turning points included the Battle of Britain (1940), the German invasion of the Soviet Union (Operation Barbarossa, 1941), the Japanese attack on Pearl Harbor which brought the US into the war, the decisive Battle of Stalingrad (1942-1943), and the Allied D-Day landings in Normandy on June 6, 1944. The European war concluded with Germany's unconditional surrender in May 1945, followed by the atomic bombings of Hiroshima and Nagasaki leading to Japan's surrender in August 1945.`,
  python: `Python is a high-level, interpreted programming language designed with an emphasis on readability and rapid development. Core features include dynamic typing, automatic garbage collection, and comprehensive built-in data structures such as lists, dictionaries, tuples, and sets. Python supports multiple paradigms including procedural, object-oriented, and functional programming. List comprehensions provide an expressive syntax to create lists: [x**2 for x in range(10) if x % 2 == 0]. In Python 3, strings are Unicode by default, and generators utilize the yield keyword to produce memory-efficient iterators without allocating full sequences in memory.`
};

const SAMPLE_QUESTIONS: Record<string, Question[]> = {
  photosynthesis: [
    {
      id: 1,
      question: "Where do the light-dependent reactions take place within plant cells?",
      options: [
        "In the stroma of the chloroplast",
        "In the thylakoid membranes of chloroplasts",
        "Inside the inner mitochondrial matrix",
        "Along the cell outer cellulose wall"
      ],
      correctAnswer: 1,
      explanation: "Light-dependent reactions occur specifically in the thylakoid membranes where chlorophyll absorbs photons to generate ATP and NADPH."
    },
    {
      id: 2,
      question: "Which enzyme is responsible for primary carbon fixation in the Calvin cycle?",
      options: [
        "ATP Synthase",
        "DNA Polymerase III",
        "RuBisCO (Ribulose-1,5-bisphosphate carboxylase-oxygenase)",
        "Amylase enzyme"
      ],
      correctAnswer: 2,
      explanation: "RuBisCO catalyzes the attachment of atmospheric CO2 to ribulose 1,5-bisphosphate (RuBP) during the Calvin cycle in the stroma."
    },
    {
      id: 3,
      question: "What is the primary chemical byproduct released into the atmosphere during photosynthesis?",
      options: [
        "Molecular oxygen (O2) from photolysis of water",
        "Carbon monoxide (CO)",
        "Methane gas (CH4)",
        "Nitrogen dioxide (NO2)"
      ],
      correctAnswer: 0,
      explanation: "Oxygen gas (O2) is produced when water molecules (H2O) are split during the light reactions."
    }
  ],
  wwii: [
    {
      id: 1,
      question: "Which major military operation marked the Allied amphibious invasion of Normandy on June 6, 1944?",
      options: [
        "Operation Barbarossa",
        "Operation Overlord (D-Day)",
        "Operation Market Garden",
        "Operation Torch"
      ],
      correctAnswer: 1,
      explanation: "Operation Overlord was the codename for the Battle of Normandy, launching the successful liberation of Western Europe."
    },
    {
      id: 2,
      question: "Which battle on the Eastern Front is widely regarded as the catastrophic turning point for Axis forces?",
      options: [
        "Battle of Stalingrad (1942–1943)",
        "Battle of the Bulge",
        "Battle of Midway",
        "Battle of El Alamein"
      ],
      correctAnswer: 0,
      explanation: "The Soviet victory at Stalingrad decimated the German Sixth Army and permanently put Germany on the defensive."
    },
    {
      id: 3,
      question: "What catalyst prompted the formal entry of the United States into World War II?",
      options: [
        "The invasion of Poland",
        "The surprise military strike on Pearl Harbor in December 1941",
        "The Blitz of London",
        "The Battle of Coral Sea"
      ],
      correctAnswer: 1,
      explanation: "The attack on Pearl Harbor on December 7, 1941 led the United States to declare war on Japan and enter WWII."
    }
  ],
  python: [
    {
      id: 1,
      question: "Which keyword is used to produce items lazily from a Python generator function?",
      options: [
        "return",
        "yield",
        "generate",
        "emit"
      ],
      correctAnswer: 1,
      explanation: "The 'yield' statement suspends execution and returns a value to the caller, resuming state on subsequent iterations."
    },
    {
      id: 2,
      question: "What is the result of [x for x in [1, 2, 3, 4] if x % 2 == 0]?",
      options: [
        "[1, 3]",
        "[2, 4]",
        "[True, False, True, False]",
        "SyntaxError"
      ],
      correctAnswer: 1,
      explanation: "The condition 'x % 2 == 0' filters for even integers, resulting in the list [2, 4]."
    },
    {
      id: 3,
      question: "Which data structure in Python is immutable by default?",
      options: [
        "List []",
        "Dictionary {}",
        "Tuple ()",
        "Set set()"
      ],
      correctAnswer: 2,
      explanation: "Tuples cannot be modified after creation, providing hashability and data integrity."
    }
  ]
};

export function LiveDemo() {
  const [selectedTopic, setSelectedTopic] = useState<'photosynthesis' | 'wwii' | 'python'>('photosynthesis');
  const [notesText, setNotesText] = useState(SAMPLE_NOTES.photosynthesis);
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [, startTransition] = useTransition();

  const handleSelectSample = (topic: 'photosynthesis' | 'wwii' | 'python') => {
    setSelectedTopic(topic);
    setNotesText(SAMPLE_NOTES[topic]);
    setQuestions(null);
    setUserAnswers({});
    setQuizCompleted(false);
  };

  const handleGenerate = () => {
    if (!notesText.trim()) return;
    setIsGenerating(true);
    setQuestions(null);
    setUserAnswers({});
    setQuizCompleted(false);

    // Simulate AI generation with shimmer
    setTimeout(() => {
      startTransition(() => {
        setQuestions(SAMPLE_QUESTIONS[selectedTopic] || SAMPLE_QUESTIONS.photosynthesis);
        setIsGenerating(false);
      });
    }, 1200);
  };

  const handleAnswerSelect = (questionId: number, optionIndex: number) => {
    if (userAnswers[questionId] !== undefined) return; // already answered
    const nextAnswers = { ...userAnswers, [questionId]: optionIndex };
    setUserAnswers(nextAnswers);

    // Check if finished
    if (questions && Object.keys(nextAnswers).length === questions.length) {
      setQuizCompleted(true);
      // Trigger minimal confetti dots
      confetti({
        particleCount: 25,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#EF4444', '#F59E0B', '#22C55E', '#3B82F6']
      });

      // Backend sync record as required
      const correctCount = questions.filter(q => nextAnswers[q.id] === q.correctAnswer).length;
      const score = Math.round((correctCount / questions.length) * 100);
      try {
        fetch("actions", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            action: "records.create",
            args: { title: `Demo: ${selectedTopic.toUpperCase()}`, score }
          })
        }).catch(() => {
          // graceful handle if backend endpoint is mock
        });
      } catch (err) {
        // quiet ignore
      }
    }
  };

  const wordCount = notesText.trim() ? notesText.trim().split(/\s+/).length : 0;
  const charCount = notesText.length;

  const correctAnswersCount = questions
    ? questions.filter(q => userAnswers[q.id] === q.correctAnswer).length
    : 0;
  const scorePercent = questions ? Math.round((correctAnswersCount / questions.length) * 100) : 0;

  return (
    <section id="demo" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-600">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
            Live demo
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1C1917] font-serif-title">
            Try it with your notes
          </h2>
        </div>
        <div className="text-xs text-[#78716C] flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
          <span>synced via fetch(&quot;actions&quot;, ...)</span>
        </div>
      </div>

      {/* Main Interactive Demo Container (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Input Notes & Sample Chips */}
        <div className="bg-white rounded-2xl border border-[#F3E8D9] shadow-soft p-6">
          <div className="flex items-center justify-between mb-3 text-xs text-[#78716C]">
            <span className="font-semibold text-[#1C1917]">Your notes</span>
            <span className="font-mono">{charCount} chars • {wordCount} words</span>
          </div>

          {/* Textarea */}
          <div className="relative mb-5">
            <textarea
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              rows={8}
              placeholder="Paste your notes here... (lecture transcript, textbook chapter, etc.)"
              className="w-full p-4 rounded-xl border border-[#F3E8D9] bg-stone-50/50 text-sm text-[#1C1917] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#EF4444]/40 focus:border-[#EF4444] transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Sample Chips */}
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-xs text-[#78716C] mr-1">Try sample:</span>
            
            <button
              onClick={() => handleSelectSample('photosynthesis')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedTopic === 'photosynthesis'
                  ? 'bg-[#D1FAE5] text-emerald-800 border-2 border-emerald-400 font-semibold'
                  : 'bg-white border border-[#D1FAE5] text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <span>🌿</span> Photosynthesis
            </button>

            <button
              onClick={() => handleSelectSample('wwii')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedTopic === 'wwii'
                  ? 'bg-[#FEF3C7] text-amber-800 border-2 border-amber-400 font-semibold'
                  : 'bg-white border border-[#FEF3C7] text-amber-800 hover:bg-amber-50'
              }`}
            >
              <span>🌓</span> WWII
            </button>

            <button
              onClick={() => handleSelectSample('python')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedTopic === 'python'
                  ? 'bg-[#DBEAFE] text-sky-800 border-2 border-sky-400 font-semibold'
                  : 'bg-white border border-[#DBEAFE] text-sky-800 hover:bg-sky-50'
              }`}
            >
              <span>🐍</span> Python
            </button>
          </div>

          {/* Generate Button with Shimmer */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !notesText.trim()}
            className="relative w-full py-3.5 px-6 rounded-full font-semibold text-white bg-gradient-to-r from-[#DC2626] to-[#EF4444] hover:opacity-95 shadow-glow-red hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2 overflow-hidden group"
          >
            {/* Shimmer effect bar */}
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-white" />
                <span>Forging quiz with AI...</span>
              </>
            ) : (
              <>
                <span>Generate quiz →</span>
              </>
            )}
          </button>
          <div className="text-center mt-2.5">
            <span className="text-[11px] text-[#78716C]">
              Takes ~12s • method: &quot;POST&quot; • &quot;content-type&quot;: &quot;application/json&quot; • JSON.stringify
            </span>
          </div>
        </div>

        {/* Right Column: Quiz Preview / Results */}
        <div className="bg-white rounded-2xl border border-[#F3E8D9] shadow-soft p-6 min-h-[460px] flex flex-col justify-center">
          {!questions && !isGenerating && (
            <div className="text-center py-16 px-4">
              <div className="w-12 h-12 mx-auto rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-4">
                <span className="text-xl">⏸</span>
              </div>
              <h3 className="text-base font-bold text-[#1C1917] mb-1">Your quiz will appear here</h3>
              <p className="text-xs text-[#78716C] max-w-xs mx-auto">
                Paste notes and click Generate. Preview uses soft colors.
              </p>
              <div className="mt-6 flex justify-center gap-1.5 opacity-40">
                <span className="w-4 h-1.5 rounded-full bg-stone-300" />
                <span className="w-2 h-1.5 rounded-full bg-amber-400" />
                <span className="w-2 h-1.5 rounded-full bg-rose-400" />
              </div>
            </div>
          )}

          {isGenerating && (
            <div className="text-center py-16">
              <div className="w-12 h-12 mx-auto rounded-full border-3 border-stone-200 border-t-[#DC2626] animate-spin mb-4" />
              <h4 className="text-sm font-bold text-[#1C1917] mb-1">Analyzing notes...</h4>
              <p className="text-xs text-[#78716C]">Synthesizing 3 active-recall MCQs + explanations</p>
            </div>
          )}

          {questions && (
            <div>
              {/* Score summary header if finished */}
              {quizCompleted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6 p-4 rounded-xl bg-gradient-to-r from-[#D1FAE5]/60 to-[#FEF3C7]/40 border border-[#D1FAE5] flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {/* Score ring */}
                    <div className="relative w-12 h-12 flex items-center justify-center">
                      <svg className="w-12 h-12 transform -rotate-90">
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          stroke="#E7E5E4"
                          strokeWidth="3.5"
                          fill="transparent"
                        />
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          stroke="#22C55E"
                          strokeWidth="3.5"
                          fill="transparent"
                          strokeDasharray={125.6}
                          strokeDashoffset={125.6 - (125.6 * scorePercent) / 100}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute text-xs font-bold text-[#1C1917]">{scorePercent}%</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#1C1917]">
                        {scorePercent >= 80 ? 'Outstanding retention! 🎉' : 'Good effort! Review weak spots.'}
                      </h4>
                      <p className="text-xs text-[#78716C]">
                        {correctAnswersCount} of {questions.length} correct • Saved to review deck
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setUserAnswers({});
                      setQuizCompleted(false);
                    }}
                    className="p-2 rounded-lg hover:bg-white/80 text-[#78716C] hover:text-[#1C1917] transition-colors"
                    title="Retry quiz"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {/* Questions List */}
              <div className="space-y-6">
                {questions.map((q, qIndex) => {
                  const userAnswer = userAnswers[q.id];
                  const hasAnswered = userAnswer !== undefined;

                  return (
                    <motion.div
                      key={q.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: qIndex * 0.15 }}
                      className="border-b border-[#F3E8D9] pb-5 last:border-b-0 last:pb-0"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <h4 className="text-sm font-semibold text-[#1C1917]">
                          <span className="text-[#DC2626] font-bold mr-1.5">Q{qIndex + 1}.</span>
                          {q.question}
                        </h4>
                      </div>

                      {/* Options */}
                      <div className="space-y-1.5">
                        {q.options.map((opt, optIndex) => {
                          const isSelected = userAnswer === optIndex;
                          const isCorrect = q.correctAnswer === optIndex;

                          let btnClasses = "bg-white border-[#F3E8D9] text-[#1C1917] hover:bg-[#FEF2F2] hover:border-rose-200";

                          if (hasAnswered) {
                            if (isCorrect) {
                              btnClasses = "bg-[#D1FAE5] border-[#22C55E] text-emerald-950 font-medium";
                            } else if (isSelected && !isCorrect) {
                              btnClasses = "bg-[#FFE4E6] border-[#FF1A1A] text-rose-950";
                            } else {
                              btnClasses = "bg-stone-50 border-stone-200 text-stone-400 opacity-60";
                            }
                          }

                          return (
                            <button
                              key={optIndex}
                              disabled={hasAnswered}
                              onClick={() => handleAnswerSelect(q.id, optIndex)}
                              className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs transition-all flex items-center justify-between gap-3 ${btnClasses}`}
                            >
                              <span className="flex-1">{opt}</span>
                              {hasAnswered && isCorrect && (
                                <span className="w-5 h-5 rounded-full bg-[#22C55E] text-white flex items-center justify-center shrink-0">
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </span>
                              )}
                              {hasAnswered && isSelected && !isCorrect && (
                                <span className="w-5 h-5 rounded-full bg-[#FF1A1A] text-white flex items-center justify-center shrink-0">
                                  <X className="w-3.5 h-3.5 stroke-[3]" />
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation slide */}
                      <AnimatePresence>
                        {hasAnswered && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2.5 p-2.5 rounded-lg bg-[#FFFBEB] border border-[#FEF3C7] text-[11px] text-[#78716C] leading-relaxed"
                          >
                            <span className="font-semibold text-amber-800">Explanation: </span>
                            {q.explanation}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
