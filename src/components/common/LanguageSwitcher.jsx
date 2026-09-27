import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

import CustomSelect from './CustomSelect';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (val) => {
    i18n.changeLanguage(val);
  };

  const LANGUAGES = [
    { label: 'English', value: 'en' },
    { label: 'Español', value: 'es' },
    { label: 'Français', value: 'fr' },
    { label: '日本語', value: 'ja' },
    { label: '中文', value: 'zh' },
    { label: '한국어', value: 'ko' }
  ];

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-[var(--accent)]" />
      <CustomSelect
        value={i18n.resolvedLanguage || 'en'}
        onChange={changeLanguage}
        options={LANGUAGES}
        size="sm"
        className="min-w-[110px]"
      />
    </div>
  );
}
