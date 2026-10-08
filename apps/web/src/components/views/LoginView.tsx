'use client';

import { useState } from 'react';
import { useUIStore } from '../../store/uiStore';
import { AtmosphereLayer } from '../../components/talk/AtmosphereLayer';

export default function LoginView() {
  const setMainView = useUIStore((s) => s.setMainView);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'bypass-tunnel-reminder': 'true' },
        body: JSON.stringify({ email, password })
      });
      
      if (!res.ok) {
        throw new Error('Invalid credentials');
      }
      
      const data = await res.json();
      localStorage.setItem('vaani_token', data.access_token);
      localStorage.setItem('vaani_user_id', data.user_id);
      localStorage.setItem('vaani_org_id', data.org_id);
      
      setMainView('landing');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/guest', {
        method: 'POST',
        headers: { 'bypass-tunnel-reminder': 'true' }
      });
      if (!res.ok) throw new Error('Guest login failed');
      
      const data = await res.json();
      localStorage.setItem('vaani_token', data.access_token);
      localStorage.setItem('vaani_user_id', data.user_id);
      localStorage.setItem('vaani_org_id', data.org_id);
      
      setMainView('landing');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white overflow-hidden selection:bg-purple-500/30 font-sans transition-colors duration-300 flex items-center justify-center px-4">
      <AtmosphereLayer />
      
      <div className="relative z-10 max-w-md w-full space-y-8 bg-white/5 dark:bg-zinc-900/50 backdrop-blur-xl p-8 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-serif text-white tracking-tight">వాణి Studio</h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 font-medium">Sign in to manage your AI agents</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Email address</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-100 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Password</label>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-100 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && <div className="text-red-500 dark:text-red-400 text-sm text-center font-medium bg-red-100 dark:bg-red-400/10 py-2 rounded-lg">{error}</div>}

          <div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-black bg-zinc-100 hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500 transition-all disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-900/50 backdrop-blur-md rounded-full">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGuestLogin}
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-sm text-sm font-medium text-zinc-700 dark:text-zinc-200 bg-zinc-50 hover:bg-zinc-100 dark:bg-white/5 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500 transition-all disabled:opacity-50"
            >
              Guest Demo (Read-Only)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
