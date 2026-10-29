import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

export function LandingNavbar() {
  const { isAuthenticated } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#F3E8D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative w-8 h-8 rounded-lg bg-[#1C1917] flex items-center justify-center text-white font-bold text-lg shadow-sm">
              <span>Q</span>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#DC2626] ring-2 ring-white shadow-xs" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#1C1917]">QuizForge</span>
          </Link>

          {/* Pill Free • No signup */}
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF3C7]/70 border border-[#FDE68A] text-amber-800 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
            <span>Free • No signup for demo</span>
          </div>
        </div>

        {/* Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#78716C]">
          <a href="#how-it-works" className="hover:text-[#1C1917] transition-colors">How it works</a>
          <a href="#demo" className="hover:text-[#1C1917] transition-colors">Demo</a>
          <a href="#features" className="hover:text-[#1C1917] transition-colors">Features</a>
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link
            to={isAuthenticated ? "/dashboard" : "/login"}
            className="text-sm font-medium text-[#78716C] hover:text-[#1C1917] hidden sm:block px-3 py-1.5"
          >
            {isAuthenticated ? "Dashboard" : "Sign in"}
          </Link>
          <Link
            to={isAuthenticated ? "/upload" : "/register"}
            className="px-5 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-[#DC2626] to-[#EF4444] hover:opacity-95 shadow-glow-red hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            Try free
          </Link>
        </div>
      </div>
    </header>
  );
}

