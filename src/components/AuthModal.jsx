import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, User, Eye, EyeOff, ArrowRight, Zap } from 'lucide-react';

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
        if (!email || !password || !name) throw new Error('Please fill in all required fields.');
        if (password.length < 6) throw new Error('Password must be at least 6 characters long.');
        register({ name, email, password, avatar: selectedAvatar });
      } else {
        if (!email || !password) throw new Error('Please enter your email and password.');
        login({ email, password });
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay overlay-enter" onClick={closeAuth}>
      <div className="modal-panel" onClick={e => e.stopPropagation()}>
        <div className="p-6 space-y-5">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[16px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                {mode === 'signup' ? 'Create Account' : 'Sign In'}
              </h2>
              <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                {mode === 'signup'
                  ? 'Join HappyGen Studio to save your creations.'
                  : 'Welcome back to HappyGen Studio.'}
              </p>
            </div>
            <button onClick={closeAuth} className="btn-ghost p-1.5 rounded-md cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Tabs */}
          <div className="mode-toggle">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`mode-toggle-option flex-1 ${mode === 'login' ? 'active' : ''}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); }}
              className={`mode-toggle-option flex-1 ${mode === 'signup' ? 'active' : ''}`}
            >
              Create Account
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg text-[12px]"
              style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)', color: 'var(--error)' }}>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="text-[11px] font-medium block mb-1" style={{ color: 'var(--text-tertiary)' }}>Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                    <input type="text" required value={name} onChange={e => setName(e.target.value)}
                      placeholder="Your name" className="input w-full pl-10 text-[13px]" />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-medium block mb-1.5" style={{ color: 'var(--text-tertiary)' }}>Avatar</label>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {DEFAULT_AVATARS.map((url, idx) => (
                      <button key={idx} type="button" onClick={() => setSelectedAvatar(url)}
                        className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 cursor-pointer transition-all"
                        style={{
                          border: selectedAvatar === url ? '2px solid var(--accent)' : '2px solid transparent',
                          opacity: selectedAvatar === url ? 1 : 0.5,
                        }}>
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-[11px] font-medium block mb-1" style={{ color: 'var(--text-tertiary)' }}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com" className="input w-full pl-10 text-[13px]" />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium block mb-1" style={{ color: 'var(--text-tertiary)' }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                <input type={showPassword ? 'text' : 'password'} required value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  className="input w-full pl-10 pr-10 text-[13px]" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  style={{ color: 'var(--text-tertiary)' }}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn btn-primary w-full py-2.5 text-[13px] font-semibold mt-1">
              {mode === 'signup' ? 'Create Account' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Guest */}
          <div className="pt-2 border-t text-center" style={{ borderColor: 'var(--border-subtle)' }}>
            <button type="button" onClick={() => { setError(''); loginAsGuest(); }}
              className="flex items-center justify-center gap-1.5 mx-auto text-[12px] font-medium cursor-pointer transition-colors"
              style={{ color: 'var(--text-tertiary)' }}>
              <Zap className="w-3.5 h-3.5" style={{ color: 'var(--warning)' }} />
              Continue as Guest
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
