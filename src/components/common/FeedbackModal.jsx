import React, { useState } from 'react';
import { MessageSquare, X, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function FeedbackModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setStatus('loading');
    
    const webhookUrl = import.meta.env.VITE_DISCORD_WEBHOOK_URL;
    
    if (!webhookUrl) {
      setStatus('error');
      setErrorMessage('Discord webhook URL is not configured. Developer: Please add VITE_DISCORD_WEBHOOK_URL to your .env file.');
      return;
    }

    const payload = {
      username: 'HappyGen Feedback Bot',
      embeds: [{
        title: 'New User Feedback',
        color: 0x3498db,
        fields: [
          {
            name: 'Feedback',
            value: feedback
          },
          {
            name: 'Email (Optional)',
            value: email || 'Not provided'
          }
        ],
        timestamp: new Date().toISOString()
      }]
    };

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to send feedback');
      }

      setStatus('success');
      setTimeout(() => {
        onClose();
        setTimeout(() => {
          setStatus('idle');
          setFeedback('');
          setEmail('');
        }, 300);
      }, 2000);
    } catch (error) {
      setStatus('error');
      setErrorMessage(error.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-[var(--surface-1)] border border-[var(--border-subtle)] shadow-2xl rounded-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--surface-2)]">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-white">{t('feedback.title', 'Send Feedback')}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          {status === 'success' ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
              <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-medium text-lg">{t('feedback.successTitle', 'Thank You!')}</h4>
                <p className="text-[13px] text-slate-400 mt-1">{t('feedback.successDesc', 'Your feedback has been sent directly to the developer.')}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-[13px] text-slate-400">
                {t('feedback.desc', 'Found a bug? Have a feature request? Or just want to say hi? Let us know below!')}
              </p>

              {status === 'error' && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                  <p className="text-[12px] text-red-400">{errorMessage}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-slate-300">
                  {t('feedback.messageLabel', 'Your Message')} <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={t('feedback.messagePlaceholder', 'Tell us what you think...')}
                  className="w-full h-32 px-3 py-2 bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-slate-300">
                  {t('feedback.emailLabel', 'Email (Optional)')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('feedback.emailPlaceholder', 'If you want us to reply')}
                  className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-[13px] font-medium text-slate-300 hover:text-white hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
                  disabled={status === 'loading'}
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={!feedback.trim() || status === 'loading'}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[13px] font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {status === 'loading' ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {t('feedback.submit', 'Send Feedback')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
