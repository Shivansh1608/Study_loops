import { Link } from 'react-router-dom';

export function MinimalFooter() {
  return (
    <footer className="py-12 border-t border-[#F3E8D9] bg-white/40 text-xs text-[#78716C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#1C1917]">QuizForge</span>
          <span>•</span>
          <span>© 2026 Light UI/UX Polished • Soft colors, subtle shadows</span>
        </div>

        <div className="flex items-center gap-6">
          <Link to="/privacy" className="hover:text-[#1C1917] transition-colors">Privacy</Link>
          <Link to="/terms" className="hover:text-[#1C1917] transition-colors">Terms</Link>
          <a href="mailto:support@quizforge.app" className="hover:text-[#1C1917] transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}

