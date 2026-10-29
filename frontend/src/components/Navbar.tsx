import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { 
  Sparkles, 
  LayoutDashboard, 
  UploadCloud, 
  BookOpen, 
  Flame, 
  Layers, 
  LogOut, 
  LogIn
} from 'lucide-react';

interface NavbarProps {
  streak?: number;
  dueCardsCount?: number;
}

export function Navbar({ streak = 0, dueCardsCount = 0 }: NavbarProps) {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Upload & Notes', path: '/upload', icon: UploadCloud },
    { name: 'My Quizzes', path: '/quizzes', icon: BookOpen },
    { 
      name: 'Flashcards', 
      path: '/flashcards', 
      icon: Layers 
    },
    { 
      name: 'Spaced Review', 
      path: '/review', 
      icon: Sparkles,
      badge: dueCardsCount > 0 ? dueCardsCount : undefined 
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#F3E8D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-6">
          <Link to="/dashboard" className="flex items-center space-x-2.5 group">
            <div className="relative w-8 h-8 rounded-lg bg-[#1C1917] flex items-center justify-center text-white font-bold text-lg shadow-xs group-hover:scale-105 transition-transform">
              <span>Q</span>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#DC2626] ring-2 ring-white shadow-xs" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-[#1C1917]">
                QuizForge
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FEF3C7] text-amber-900 border border-[#FDE68A]">
                SM-2 Pro
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#FFE4E6]/80 text-[#DC2626] font-semibold border border-rose-200'
                      : 'text-[#78716C] hover:text-[#1C1917] hover:bg-stone-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#DC2626]' : 'text-stone-400'}`} />
                  <span>{link.name}</span>
                  {link.badge !== undefined && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#DC2626] text-white">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User / Auth Actions */}
        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <>
              {/* Gamification Streak Pill */}
              <div 
                className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FEF3C7] border border-[#FDE68A] text-amber-900 text-xs font-semibold"
                title={`${streak} day study streak!`}
              >
                <Flame className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />
                <span>{streak}d</span>
              </div>

              {/* User profile avatar / pill */}
              <div className="flex items-center space-x-2 border-l border-[#F3E8D9] pl-3">
                <div className="w-7 h-7 rounded-full bg-[#DC2626] text-white flex items-center justify-center font-bold text-xs">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="hidden lg:inline-block text-xs font-medium text-[#1C1917] max-w-[120px] truncate">
                  {user?.email?.split('@')[0] || 'Student'}
                </span>
                <button
                  onClick={logout}
                  className="p-1.5 text-stone-400 hover:text-[#DC2626] hover:bg-stone-50 rounded-lg transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="text-xs font-semibold text-[#78716C] hover:text-[#1C1917] px-3 py-1.5 rounded-full"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-[#DC2626] to-[#EF4444] shadow-glow-red hover:opacity-95 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign Up Free</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
