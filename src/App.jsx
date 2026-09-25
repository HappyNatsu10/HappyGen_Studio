import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Palette, Globe, MessageSquare } from 'lucide-react';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import GeneratePage from './components/generate/GeneratePage';
import ModelExplorer from './components/models/ModelExplorer';
import GalleryProjects from './components/GalleryProjects';
import VideoStudio from './components/VideoStudio';
import CanvasEditor from './components/CanvasEditor';
import BackendConfigModal from './components/BackendConfigModal';
import AuthModal from './components/AuthModal';
import UserProfileModal from './components/UserProfileModal';
import MobileTabBar from './components/layout/MobileTabBar';
import ModelSelectionModal from './components/models/ModelSelectionModal';
import InpaintStudio from './components/InpaintStudio';
import OnboardingTutorial from './components/common/OnboardingTutorial';
import InteractiveTour from './components/common/InteractiveTour';
import SystemDocs from './components/common/SystemDocs';
import LanguageSelectorModal from './components/common/LanguageSelectorModal';
import LanguageSwitcher from './components/common/LanguageSwitcher';
import ThemeManager from './components/common/ThemeManager';
import ThemeSelectorModal from './components/common/ThemeSelectorModal';
import useAppStore from './store/useAppStore';
import useModelStore from './store/useModelStore';

function MainApp() {
  const { t } = useTranslation();
  const { currentUser, isAuthenticated, openAuth } = useAuth();
  
  const {
    activeTab,
    sidebarCollapsed,
    mode,
    showBackendModal,
    showProfileModal,
    showModelModal,
    showThemeModal,
    hasSelectedLanguage,
    hasSeenTutorial,
    setShowBackendModal,
    setShowProfileModal,
    setShowThemeModal,
  } = useAppStore();

  const { syncModelProfiles } = useModelStore();

  useEffect(() => {
    if (currentUser?.modelProfiles) {
      syncModelProfiles(currentUser.modelProfiles);
    }
  }, [currentUser?.modelProfiles, syncModelProfiles]);

  const sidebarWidth = sidebarCollapsed ? 60 : 220;

  const TAB_TITLES = {
    generate: t('nav.create', 'Create'),
    models: t('nav.explore', 'Model Explorer'),
    gallery: t('nav.gallery', 'Gallery'),
    settings: t('nav.settings', 'Settings'),
    video: t('nav.video', 'Video Suite'),
    canvas: t('nav.canvas', 'Canvas'),
    inpaint: t('nav.inpaint', 'Inpaint Studio'),
  };

  return (
    <div className="h-screen overflow-hidden flex" style={{ background: 'var(--surface-0)' }}>
      <ThemeManager />
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col transition-all duration-200 w-full md:w-auto pb-[60px] md:pb-0"
           style={{ marginLeft: 'var(--sidebar-width, 0px)' }}>

        <style dangerouslySetInnerHTML={{__html: `
          @media (min-width: 768px) {
            :root { --sidebar-width: ${sidebarWidth}px; }
          }
        `}} />

        <TopBar
          title={TAB_TITLES[activeTab] || 'HappyGen'}
          onOpenBackendModal={() => setShowBackendModal(true)}
        />

        <div className="border-b px-2 sm:px-4 py-2 flex items-center justify-center text-center relative overflow-hidden shrink-0" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
          <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 pointer-events-none" />
          <p className="text-[12px] font-medium relative z-10 text-center leading-relaxed w-full break-words whitespace-normal" style={{ color: 'var(--text-primary)' }}>
            <span className="text-xl drop-shadow-sm align-middle inline-block mr-1 sm:mr-2">🚀</span>
            <span className="align-middle inline">{t('app.bannerText', 'More base models and the advanced Video Suite are coming soon! Stay tuned.')}</span>
          </p>
        </div>

        {activeTab === 'inpaint' && (
          <div className="flex-1 flex flex-col h-full">
            <InpaintStudio />
          </div>
        )}
        {activeTab === 'generate' && (
          <GeneratePage />
        )}

        {activeTab === 'models' && (
          <ModelExplorer />
        )}

        {activeTab === 'gallery' && (
          <div className="flex-1 overflow-y-auto p-5 pb-24 md:pb-5">
            <GalleryProjects />
          </div>
        )}

        {activeTab === 'video' && (
          <div className="flex-1 flex flex-col h-full pb-20 md:pb-0 overflow-y-auto">
            <VideoStudio />
          </div>
        )}

        {activeTab === 'canvas' && (
          <div className="flex-1 overflow-y-auto p-5 pb-24 md:pb-5">
            <CanvasEditor />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="flex-1 overflow-y-auto p-5 pb-24 md:pb-5">
            <SettingsPage />
          </div>
        )}
      </div>

      <MobileTabBar />

      {/* Modals */}
      <ModelSelectionModal />
      <AuthModal />
      <UserProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
      <ThemeSelectorModal isOpen={showThemeModal} onClose={() => setShowThemeModal(false)} />
      <BackendConfigModal isOpen={showBackendModal} onClose={() => setShowBackendModal(false)} />
      
      {!hasSelectedLanguage && <LanguageSelectorModal />}
      {hasSelectedLanguage && !hasSeenTutorial && <OnboardingTutorial />}
      {hasSelectedLanguage && <InteractiveTour />}
    </div>
  );
}

// Simple settings page connected to Zustand
function SettingsPage() {
  const { t } = useTranslation();
  const { isAdultMode, setIsAdultMode, setShowBackendModal, setHasSeenTutorial, setHasSeenInteractiveTour, setShowThemeModal } = useAppStore();
  const [showDocs, setShowDocs] = useState(false);

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h2 className="text-[16px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{t('settings.title', 'Settings')}</h2>
        <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>{t('settings.subtitle', 'Configure your HappyGen Studio experience.')}</p>
      </div>

      <div className="card p-4 space-y-4">
        {/* Backend */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{t('settings.backendServer', 'Backend Server')}</div>
            <div className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{t('settings.backendDesc', 'Configure Local GPU or Google Colab')}</div>
          </div>
          <button onClick={() => setShowBackendModal(true)} className="btn btn-secondary text-[12px]">
            {t('settings.configure', 'Configure')}
          </button>
        </div>

        {/* Theme Settings */}
        <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <div>
            <div className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{t('settings.theme', 'Theme & Appearance')}</div>
            <div className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{t('settings.themeDesc', 'Customize the visual style')}</div>
          </div>
          <button onClick={() => setShowThemeModal(true)} className="btn btn-secondary text-[12px] flex items-center gap-2">
            <Palette className="w-3.5 h-3.5" />
            {t('settings.changeTheme', 'Change Theme')}
          </button>
        </div>

        {/* Language Settings */}
        <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <div>
            <div className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{t('settings.language', 'Language')}</div>
            <div className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{t('settings.languageDesc', 'Change the display language')}</div>
          </div>
          <LanguageSwitcher />
        </div>

        {/* 18+ Mode */}
        <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <div>
            <div className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{t('settings.adultMode', '18+ Content')}</div>
            <div className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{t('settings.adultDesc', 'Show NSFW models & disable content filter')}</div>
          </div>
          <button
            onClick={() => setIsAdultMode(!isAdultMode)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
              isAdultMode ? 'bg-red-500' : ''
            }`}
            style={{ background: isAdultMode ? undefined : 'var(--surface-4)' }}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isAdultMode ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>
      </div>

      {/* App Walkthrough */}
      <div className="card p-4">
        <div className="text-[13px] font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{t('settings.helpTitle', 'Help & Tutorials')}</div>
        <p className="text-[11px] mb-3" style={{ color: 'var(--text-tertiary)' }}>{t('settings.helpDesc', 'Replay the introductory guide or take an interactive tour.')}</p>
        <div className="flex flex-col gap-2">
          <button onClick={() => setShowDocs(true)} className="btn btn-secondary w-full text-[12px] py-2 cursor-pointer transition-colors hover:bg-white/10 flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            {t('settings.systemDocs', 'System Documentation')}
          </button>
          <button onClick={() => setHasSeenTutorial(false)} className="btn btn-secondary w-full text-[12px] py-2 cursor-pointer transition-colors hover:bg-white/10">
            {t('settings.showGuide', 'Show Welcome Guide')}
          </button>
          <button onClick={() => setHasSeenInteractiveTour(false)} className="btn btn-secondary w-full text-[12px] py-2 cursor-pointer transition-colors hover:bg-white/10">
            {t('settings.startTour', 'Start Interactive Tour')}
          </button>
        </div>
      </div>

      {/* Feedback */}
      <div className="card p-4">
        <div className="text-[13px] font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{t('settings.feedback', 'Feedback')}</div>
        <p className="text-[11px] mb-3" style={{ color: 'var(--text-tertiary)' }}>{t('settings.feedbackDesc', 'Have a suggestion or found a bug? Let us know!')}</p>
        <a 
          href="mailto:support@happygen.com?subject=HappyGen Studio Feedback"
          className="btn btn-secondary w-full text-[12px] py-2 transition-colors flex items-center justify-center gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          {t('settings.sendFeedback', 'Send Feedback via Email')}
        </a>
      </div>

      {/* About */}
      <div className="card p-4">
        <div className="text-[13px] font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{t('settings.about', 'About')}</div>
        <div className="text-[11px] space-y-0.5" style={{ color: 'var(--text-tertiary)' }}>
          <p>HappyGen Studio v2.0</p>
          <p>Built by HappyNatsu10</p>
          <p>Powered by CivitAI API & Stable Diffusion</p>
        </div>
      </div>

      {showDocs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="card w-full max-w-3xl bg-[var(--surface-1)] border border-[var(--border-subtle)] shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--surface-2)]">
              <h3 className="font-bold text-white">{t('settings.systemDocs', 'System Documentation')}</h3>
              <button onClick={() => setShowDocs(false)} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <SystemDocs />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
