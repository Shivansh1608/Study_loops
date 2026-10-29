import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, loginUser, fetchMe } from '../api/client';
import { useAuthStore } from '../store/useAuthStore';
import { Lock, Mail, User, Loader2, ArrowRight } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await registerUser(email, password);
      const tokenData = await loginUser(email, password);
      localStorage.setItem('notes_quiz_token', tokenData.access_token);
      const user = await fetchMe();
      setAuth(tokenData.access_token, user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Registration failed. Email might already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 bg-[#FFFDf8]">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-[#F3E8D9] shadow-soft space-y-7">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="relative w-12 h-12 rounded-xl bg-[#1C1917] flex items-center justify-center text-white font-bold text-xl mx-auto shadow-md">
            <span>Q</span>
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#DC2626] ring-2 ring-white shadow-xs" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#1C1917] font-serif-title">
            Create QuizForge Account
          </h2>
          <p className="text-xs text-[#78716C]">
            Start forging high-retention practice tests and spaced repetition decks.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Jane Doe"
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50/60 border border-[#F3E8D9] rounded-xl text-sm text-[#1C1917] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#EF4444]/30 focus:border-[#EF4444] transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@university.edu"
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50/60 border border-[#F3E8D9] rounded-xl text-sm text-[#1C1917] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#EF4444]/30 focus:border-[#EF4444] transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50/60 border border-[#F3E8D9] rounded-xl text-sm text-[#1C1917] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#EF4444]/30 focus:border-[#EF4444] transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-[#FFE4E6] border border-[#FECDD3] text-[#DC2626] text-xs font-medium rounded-xl flex items-center space-x-2">
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-[#DC2626] to-[#EF4444] hover:opacity-95 text-white font-semibold text-sm rounded-full shadow-glow-red hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-2 text-xs text-[#78716C]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#DC2626] hover:text-[#EF4444] font-semibold underline underline-offset-2 ml-1">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
