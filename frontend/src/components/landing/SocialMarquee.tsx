export function SocialMarquee() {
  const subjects = [
    { name: 'Biology', color: 'bg-emerald-500' },
    { name: 'Chemistry', color: 'bg-amber-500' },
    { name: 'History', color: 'bg-red-500' },
    { name: 'Computer Science', color: 'bg-sky-500' },
    { name: 'Medicine & MCAT', color: 'bg-purple-500' },
    { name: 'Constitutional Law', color: 'bg-rose-500' },
    { name: 'Psychology', color: 'bg-teal-500' },
    { name: 'Economics', color: 'bg-amber-600' },
    { name: 'Physics', color: 'bg-indigo-500' },
    { name: 'Philosophy', color: 'bg-stone-500' },
  ];

  return (
    <div className="py-6 border-y border-[#F3E8D9] bg-white/50 overflow-hidden relative select-none">
      <div className="flex w-max animate-[marquee_30s_linear_infinite] gap-10 items-center">
        {[...subjects, ...subjects, ...subjects].map((item, idx) => (
          <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-[#78716C] tracking-wide whitespace-nowrap">
            <span className={`w-2 h-2 rounded-full ${item.color}`} />
            <span>{item.name}</span>
            <span className="text-stone-300 ml-4">•</span>
          </div>
        ))}
      </div>
    </div>
  );
}

