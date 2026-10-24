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
  LogIn,
  ExternalLink
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
    { 
      name: 'Flashcards', 
      path: '/flashcards', 
      icon: Layers 
    },
    { 
      name: 'Spaced Review', 
      path: '/review', 
      icon: BookOpen,
      badge: dueCardsCount > 0 ? dueCardsCount : undefined 
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-6">
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold font-heading bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 bg-clip-text text-transparent">
                NoteWise AI
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                Study Loop
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-purple-50 text-purple-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-purple-600' : 'text-slate-400'}`} />
                  <span>{link.name}</span>
                  {link.badge !== undefined && (
                    <span className="ml-1.5 px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500 text-white animate-pulse">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          {/* Study Streak */}
          <div 
            title={`${streak} day study streak!`}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-50 to-amber-50 border border-amber-200/80 text-amber-700 text-xs font-bold shadow-xs"
          >
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-bounce" />
            <span>{streak} Day Streak</span>
          </div>

          {/* API Docs link */}
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center space-x-1 text-xs font-semibold text-slate-500 hover:text-purple-600 px-2 py-1 transition-colors"
          >
            <span>Docs</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <div className="h-4 w-px bg-slate-200" />

          {/* User Profile / Auth */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 font-medium hidden sm:inline-block max-w-[120px] truncate">
                {user?.email || 'Student'}
              </span>
              <button
                onClick={logout}
                title="Log Out"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center space-x-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
