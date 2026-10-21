import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, User, Eye, EyeOff, ArrowRight, Zap, CheckCircle2, Upload } from 'lucide-react';
import { resizeAndConvertToBase64 } from '../utils/imageUtils';

export default function AuthModal() {
  const { t } = useTranslation();
  const { showAuthModal, authModalMode, closeAuth, login, register, loginAsGuest, DEFAULT_AVATARS } = useAuth();
  const [mode, setMode] = useState(authModalMode || 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(DEFAULT_AVATARS[0]);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync internal mode with the external authModalMode whenever the modal opens
  useEffect(() => {
    if (showAuthModal) {
      setMode(authModalMode || 'login');
      setError('');
      setSuccessMessage('');
    }
  }, [showAuthModal, authModalMode]);

  if (!showAuthModal) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        if (!email || !password || !name) throw new Error(t('auth.fillAll', 'Please fill in all required fields.'));
        if (password.length < 6) throw new Error(t('auth.passwordLength', 'Password must be at least 6 characters long.'));
        await register({ name, email, password, avatar: selectedAvatar });
        // Don't logout here — register already saves to Firestore and sets currentUser.
        // onAuthStateChanged will handle setting the user profile on its own.
        closeAuth();
      } else {
        if (!email || !password) throw new Error(t('auth.enterEmailPassword', 'Please enter your email and password.'));
        await login({ email, password });
        closeAuth();
      }
    } catch (err) {
      setError(err.message || t('auth.error', 'An error occurred during authentication.'));
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    setError('');
    loginAsGuest();
    closeAuth();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLoading(true);
      const base64Img = await resizeAndConvertToBase64(file);
      setSelectedAvatar(base64Img);
    } catch (err) {
      setError(t('profile.uploadError', 'Failed to process image. Please try another one.'));
    } finally {
      setLoading(false);
    }
  };

  if (successMessage) {
    return (
      <div className="modal-overlay overlay-enter" onClick={closeAuth}>
        <div className="modal-panel animate-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
          <div className="p-8 flex flex-col items-center justify-center space-y-4 text-center">
            <CheckCircle2 className="w-14 h-14 text-emerald-500" />
            <div>
              <h2 className="text-[16px] font-semibold text-white">{successMessage}</h2>
              <p className="text-[12px] text-gray-400 mt-1">{t('auth.preparing', 'Preparing your studio...')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay overlay-enter" onClick={closeAuth}>
      <div className="modal-panel" onClick={e => e.stopPropagation()}>
        <div className="p-6 space-y-5">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[16px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                {mode === 'signup' ? t('auth.createAccount', 'Create Account') : t('auth.signIn', 'Sign In')}
              </h2>
              <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                {mode === 'signup'
                  ? t('auth.joinDesc', 'Join HappyGen Studio to save your creations.')
                  : t('auth.welcomeBack', 'Welcome back to HappyGen Studio.')}
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
              {t('auth.signIn', 'Sign In')}
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); }}
              className={`mode-toggle-option flex-1 ${mode === 'signup' ? 'active' : ''}`}
            >
              {t('auth.createAccount', 'Create Account')}
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
                  <label className="text-[11px] font-medium block mb-1" style={{ color: 'var(--text-tertiary)' }}>{t('auth.name', 'Name')}</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                    <input type="text" required value={name} onChange={e => setName(e.target.value)}
                      placeholder={t('auth.namePlaceholder', 'Your name')} className="input w-full pl-10 text-[13px]" />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-medium block mb-1.5" style={{ color: 'var(--text-tertiary)' }}>{t('auth.avatar', 'Avatar')}</label>
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
                  
                  {/* Custom Upload */}
                  <div className="mt-2 flex items-center gap-3">
                    {selectedAvatar && !DEFAULT_AVATARS.includes(selectedAvatar) && (
                      <img src={selectedAvatar} alt="Custom" className="w-9 h-9 rounded-full object-cover border-2" style={{ borderColor: 'var(--accent)' }} />
                    )}
                    <label className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg border border-dashed cursor-pointer transition-colors text-[12px] font-medium"
                      style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)', color: 'var(--text-secondary)' }}>
                      <Upload className="w-3.5 h-3.5" />
                      {t('auth.uploadCustom', 'Upload Custom Picture')}
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" disabled={loading} />
                    </label>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-[11px] font-medium block mb-1" style={{ color: 'var(--text-tertiary)' }}>{t('auth.email', 'Email')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com" className="input w-full pl-10 text-[13px]" />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium block mb-1" style={{ color: 'var(--text-tertiary)' }}>{t('auth.password', 'Password')}</label>
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
              {mode === 'signup' ? t('auth.createAccount', 'Create Account') : t('auth.signIn', 'Sign In')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: 'var(--border-subtle)' }}></div>
            </div>
            <div className="relative flex justify-center text-[10px]">
              <span className="px-2" style={{ background: 'var(--surface-0)', color: 'var(--text-tertiary)' }}>
                {t('auth.or', 'OR')}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGuestLogin}
            disabled={loading}
            className="w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left group hover:border-[var(--accent)] hover:bg-[var(--surface-2)] cursor-pointer"
            style={{
              borderColor: 'var(--border-subtle)',
              background: 'var(--surface-1)'
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(234, 179, 8, 0.12)' }}>
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <div className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {t('auth.continueGuest', 'Continue as Guest')}
                </div>
                <div className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                  Instant offline-ready studio access
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 shrink-0" style={{ color: 'var(--text-tertiary)' }} />
          </button>

        </div>
      </div>
    </div>
  );
}
