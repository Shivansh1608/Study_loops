import { ArrowUp, Sparkles, Check } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Upload notes',
      desc: 'PDF, DOCX, TXT or just paste. We handle messy formatting, bullet points, lecture slides.',
      topBorder: 'bg-[#DC2626]', // red
      icon: <ArrowUp className="w-4 h-4 text-[#DC2626]" />,
      iconBg: 'bg-[#FFE4E6]',
    },
    {
      num: '02',
      title: 'AI generates',
      desc: 'MCQs at 3 difficulties, flashcards with SM-2 scheduling, plus concise summary.',
      topBorder: 'bg-[#F59E0B]', // amber
      icon: <Sparkles className="w-4 h-4 text-[#F59E0B]" />,
      iconBg: 'bg-[#FEF3C7]',
    },
    {
      num: '03',
      title: 'Study & retain',
      desc: 'Practice with instant feedback. Track progress, revisit weak spots, never forget.',
      topBorder: 'bg-[#3B82F6]', // sky/blue
      icon: <Check className="w-4 h-4 text-[#3B82F6]" />,
      iconBg: 'bg-[#DBEAFE]',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1C1917] font-serif-title mb-2">
            How it works
          </h2>
          <p className="text-[#78716C] text-base">
            Three steps, 30 seconds.
          </p>
        </div>
        <p className="text-sm text-[#78716C] max-w-sm md:text-right">
          No account needed. Paste notes, get structured recall material optimized for retention.
        </p>
      </div>

      {/* 3 Steps Cards */}
      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Desktop Dashed Connector Line */}
        <div 
          className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-[1px] border-t-2 border-dashed border-[#F3E8D9] -z-10" 
          aria-hidden="true" 
        />

        {steps.map((step, idx) => (
          <div
            key={idx}
            className="group relative bg-white rounded-2xl border border-[#F3E8D9] shadow-soft p-8 pt-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-md overflow-hidden flex flex-col justify-between"
          >
            {/* Colored top bar */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${step.topBorder}`} />

            <div>
              {/* Row with faint number and colored circle icon */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-4xl sm:text-5xl font-extrabold text-stone-200/90 font-mono tracking-tight select-none">
                  {step.num}
                </span>
                <div className={`w-9 h-9 rounded-full ${step.iconBg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                  {step.icon}
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-lg font-bold text-[#1C1917] mb-2.5">
                {step.title}
              </h3>
              <p className="text-sm text-[#78716C] leading-relaxed">
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

