import React from 'react';
import { Image, Layers, FolderOpen, Settings, Video, Brush } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useAppStore from '../../store/useAppStore';

export default function MobileTabBar() {
  const { t } = useTranslation();
  const { activeTab, setActiveTab } = useAppStore();
  
  const TABS = [
    { id: 'generate', label: t('nav.create', 'Create'), icon: Image },
    { id: 'video', label: t('nav.video', 'Video'), icon: Video },
    { id: 'inpaint', label: t('nav.inpaint', 'Inpaint'), icon: Brush },
    { id: 'models', label: t('nav.explore', 'Explore'), icon: Layers },
    { id: 'gallery', label: t('nav.gallery', 'Gallery'), icon: FolderOpen },
    { id: 'settings', label: t('nav.settings', 'Settings'), icon: Settings },
  ];
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface-1)] border-t border-[var(--border-subtle)] flex items-center justify-around px-2 pb-safe pt-1 h-[60px]" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 4px)' }}>
      {TABS.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 relative ${tab.id === 'gallery' ? 'tour-gallery-mobile' : ''}`}
            style={{ color: isActive ? 'var(--accent)' : 'var(--text-tertiary)' }}
          >
            {isActive && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-b-full bg-gradient-to-r from-[var(--accent)] to-purple-500" />
            )}
            <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
