import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import useAppStore from '../../store/useAppStore';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
];

export default function LanguageSelectorModal() {
  const { i18n, t } = useTranslation();
  const { setHasSelectedLanguage } = useAppStore();

  const handleSelect = (code) => {
    i18n.changeLanguage(code);
    setHasSelectedLanguage(true);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="card w-full max-w-md bg-[var(--surface-1)] border border-[var(--border-subtle)] shadow-2xl rounded-2xl overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className="px-6 py-8 text-center border-b border-[var(--border-subtle)] bg-gradient-to-br from-[var(--surface-2)] to-transparent relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500 via-transparent to-transparent blur-2xl" />
          
          <div className="w-16 h-16 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <Globe className="w-8 h-8" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2 tracking-wide">
            Welcome to HappyGen
          </h2>
          <p className="text-[14px] text-slate-400">
            Please select your preferred language
          </p>
        </div>

        {/* Language Grid */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className="flex items-center gap-3 p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)] hover:border-purple-500/50 transition-all text-left group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/0 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-2xl">{lang.flag}</span>
                <span className="font-semibold text-[14px] text-white tracking-wide group-hover:text-purple-300 transition-colors">
                  {lang.name}
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
