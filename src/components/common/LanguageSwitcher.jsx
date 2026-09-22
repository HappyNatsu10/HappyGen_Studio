import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <div className="relative inline-flex items-center">
      <Globe className="w-4 h-4 text-[var(--accent)] absolute left-2 pointer-events-none" />
      <select
        value={i18n.resolvedLanguage || 'en'}
        onChange={changeLanguage}
        className="appearance-none bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-md py-1.5 pl-8 pr-6 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] hover:border-[var(--border-default)] cursor-pointer"
      >
        <option className="bg-[var(--surface-1)] text-[var(--text-primary)]" value="en">English</option>
        <option className="bg-[var(--surface-1)] text-[var(--text-primary)]" value="es">Español</option>
        <option className="bg-[var(--surface-1)] text-[var(--text-primary)]" value="fr">Français</option>
        <option className="bg-[var(--surface-1)] text-[var(--text-primary)]" value="ja">日本語</option>
        <option className="bg-[var(--surface-1)] text-[var(--text-primary)]" value="zh">中文</option>
        <option className="bg-[var(--surface-1)] text-[var(--text-primary)]" value="ko">한국어</option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--accent)]">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
}
