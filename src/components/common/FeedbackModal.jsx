import React, { useState, useRef } from 'react';
import { MessageSquare, X, Send, CheckCircle2, AlertCircle, ImagePlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function FeedbackModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

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

    const formData = new FormData();
    formData.append('payload_json', JSON.stringify(payload));
    if (imageFile) {
      formData.append('file', imageFile);
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        body: formData,
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
          setImageFile(null);
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
            <MessageSquare className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-[var(--text-primary)]">{t('feedback.title', 'Send Feedback')}</h3>
          </div>
          <button onClick={onClose} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          {status === 'success' ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
              <div className="w-12 h-12 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-[var(--text-primary)] font-medium text-lg">{t('feedback.successTitle', 'Thank You!')}</h4>
                <p className="text-[13px] text-[var(--text-secondary)] mt-1">{t('feedback.successDesc', 'Your feedback has been sent directly to the developer.')}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-[13px] text-[var(--text-secondary)]">
                {t('feedback.desc', 'Found a bug? Have a feature request? Or just want to say hi? Let us know below!')}
              </p>

              {status === 'error' && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-[12px] text-red-500">{errorMessage}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[var(--text-primary)]">
                  {t('feedback.messageLabel', 'Your Message')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={t('feedback.messagePlaceholder', 'Tell us what you think...')}
                  className="w-full h-32 px-3 py-2 bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[var(--text-primary)]">
                  {t('feedback.emailLabel', 'Email (Optional)')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('feedback.emailPlaceholder', 'If you want us to reply')}
                  className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[var(--text-primary)]">
                  {t('feedback.imageLabel', 'Attach Image (Optional)')}
                </label>
                <div 
                  className={`border-2 border-dashed border-[var(--border-subtle)] rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-[var(--surface-3)] transition-colors ${imageFile ? 'bg-[var(--surface-3)]' : 'bg-[var(--surface-2)]'}`}
                  onClick={() => !imageFile && fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setImageFile(e.target.files[0]);
                    }}
                  />
                  {imageFile ? (
                    <div className="flex items-center gap-2 text-[var(--text-primary)] text-[13px]">
                      <span className="truncate max-w-[200px] font-medium">{imageFile.name}</span>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setImageFile(null); fileInputRef.current.value = ''; }} className="text-[var(--text-tertiary)] hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-500/10">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-[var(--text-tertiary)]">
                      <ImagePlus className="w-5 h-5" />
                      <span className="text-[12px]">{t('feedback.uploadImage', 'Click to upload image')}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-[13px] font-medium text-[var(--text-primary)] hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
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
