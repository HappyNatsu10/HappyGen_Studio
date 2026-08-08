import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, X, Mail, Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, Check, Zap } from 'lucide-react';

export default function AuthModal() {
  const { showAuthModal, authModalMode, closeAuth, login, register, loginAsGuest, DEFAULT_AVATARS } = useAuth();
  const [mode, setMode] = useState(authModalMode || 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(DEFAULT_AVATARS[0]);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!showAuthModal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!email || !password || !name) {
          throw new Error('Please fill in all required fields.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }
        register({ name, email, password, avatar: selectedAvatar });
      } else {
        if (!email || !password) {
          throw new Error('Please enter your email and password.');
        }
        login({ email, password });
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    setError('');
    loginAsGuest();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="max-w-md w-full bg-slate-900/90 border border-indigo-500/30 rounded-3xl overflow-hidden shadow-2xl relative text-slate-100 backdrop-blur-2xl ring-1 ring-white/10">
        
        {/* Decorative Top Glow */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-indigo-500/20 via-purple-500/10 to-transparent pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closeAuth}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 transition-all z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-8 space-y-6 relative">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 mx-auto flex items-center justify-center text-white text-2xl shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold font-display tracking-tight text-white">
              {mode === 'signup' ? 'Create Your Account' : 'Welcome Back'}
            </h2>
            <p className="text-xs text-slate-400">
              {mode === 'signup' 
                ? 'Join OmniGen AI Studio to generate and save your AI creations.'
                : 'Sign in to access your cloud models, history, and generations.'}
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-2xl border border-white/10 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`py-2 rounded-xl transition-all ${
                mode === 'login' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); }}
              className={`py-2 rounded-xl transition-all ${
                mode === 'signup' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-medium flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {mode === 'signup' && (
              <>
                {/* Name */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Creator Name / Handle</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Rivera"
                      className="w-full bg-slate-950/80 border border-white/10 rounded-xl p-3 pl-9 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-medium"
                    />
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  </div>
                </div>

                {/* Avatar Picker */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Choose Avatar</label>
                  <div className="flex items-center space-x-2.5 overflow-x-auto pb-1">
                    {DEFAULT_AVATARS.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedAvatar(url)}
                        className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                          selectedAvatar === url 
                            ? 'border-indigo-500 ring-2 ring-indigo-500/50 scale-110 shadow-md' 
                            : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'
                        }`}
                      >
                        <img src={url} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label className="block text-slate-300 font-bold mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl p-3 pl-9 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-medium font-mono"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-slate-300 font-bold mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl p-3 pl-9 pr-9 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-medium font-mono"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer mt-2"
            >
              <span>{mode === 'signup' ? 'Create Account' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Guest / Demo Option */}
          <div className="pt-2 border-t border-white/10 text-center">
            <button
              type="button"
              onClick={handleGuestLogin}
              className="text-xs text-slate-400 hover:text-indigo-400 font-medium flex items-center justify-center space-x-1.5 mx-auto transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Or continue as Guest (Instant Access)</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
