import React, { useState, useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { useTranslation } from 'react-i18next';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Palette, Globe, MessageSquare, X } from 'lucide-react';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import GeneratePage from './components/generate/GeneratePage';
import ModelExplorer from './components/models/ModelExplorer';
import GalleryProjects from './components/GalleryProjects';
import VideoStudio from './components/VideoStudio';
import CanvasEditor from './components/CanvasEditor';
import FeedbackModal from './components/common/FeedbackModal';
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
import VaultSecurityModal from './components/common/VaultSecurityModal';
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
    showFeedbackModal,
    setShowFeedbackModal,
  } = useAppStore();

  const [showBanner, setShowBanner] = useState(true);

  const { syncModelProfiles } = useModelStore();

  useEffect(() => {
    if (currentUser?.modelProfiles) {
      syncModelProfiles(currentUser.modelProfiles);
    }
  }, [currentUser?.modelProfiles, syncModelProfiles]);

  // Lock adult vault when app goes to background
  useEffect(() => {
    const lockVault = () => useAppStore.getState().setAdultVaultUnlocked(false);

    // Web visibility change (switching tabs/minimizing browser)
    const handleVisibilityChange = () => {
      if (document.hidden) lockVault();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Native app background state (Capacitor)
    let appStateListener;
    if (window.Capacitor && window.Capacitor.isNativePlatform()) {
      appStateListener = CapacitorApp.addListener('appStateChange', ({ isActive }) => {
        if (!isActive) lockVault();
      });
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (appStateListener) {
        appStateListener.then(listener => listener.remove()).catch(() => {});
      }
    };
  }, []);

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

        {showBanner && (
          <div className="border-b px-2 sm:px-4 py-2 flex items-center justify-center text-center relative overflow-hidden shrink-0" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
            <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 pointer-events-none" />
            <p className="text-[12px] font-medium relative z-10 text-center leading-relaxed w-full break-words whitespace-normal px-6" style={{ color: 'var(--text-primary)' }}>
              <span className="text-xl drop-shadow-sm align-middle inline-block mr-1 sm:mr-2">🚀</span>
              <span className="align-middle inline">{t('app.bannerText', 'More base models and the advanced Video Suite are coming soon! Stay tuned.')}</span>
            </p>
            <button onClick={() => setShowBanner(false)} className="absolute right-2 z-20 p-1 rounded-md opacity-60 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 transition-all text-[var(--text-primary)]">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

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
      <FeedbackModal isOpen={showFeedbackModal} onClose={() => setShowFeedbackModal(false)} />
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
  const { isAdultMode, setIsAdultMode, setShowBackendModal, setHasSeenTutorial, setHasSeenInteractiveTour, setShowThemeModal, setShowFeedbackModal, adultVaultPin } = useAppStore();
  const [showDocs, setShowDocs] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinMode, setPinMode] = useState('verify'); // verify | setup | remove
  const [pendingAction, setPendingAction] = useState(null);

  const handleToggleAdultMode = () => {
    if (!adultVaultPin) {
      // Require PIN setup before toggling
      setPinMode('setup');
      setPendingAction(() => () => setIsAdultMode(!isAdultMode));
      setShowPinModal(true);
    } else {
      setPinMode('verify');
      setPendingAction(() => () => setIsAdultMode(!isAdultMode));
      setShowPinModal(true);
    }
  };

  const handleSetupPin = () => {
    setPinMode('setup');
    setPendingAction(() => () => {});
    setShowPinModal(true);
  };

  const handleRemovePin = () => {
    setPinMode('remove');
    setPendingAction(() => () => {});
    setShowPinModal(true);
  };

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
            <div className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{t('settings.backendDesc', 'Configure Local GPU or Colab/Kaggle')}</div>
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
            onClick={handleToggleAdultMode}
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

        {/* Vault Security */}
        <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <div>
            <div className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{t('settings.vaultSecurity', 'Vault Security')}</div>
            <div className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{t('settings.vaultSecurityDesc', 'Manage PIN protection for 18+ mode and Vault')}</div>
          </div>
          {adultVaultPin ? (
            <button onClick={handleRemovePin} className="btn text-[12px] text-red-500 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg">
              {t('settings.removePin', 'Remove PIN')}
            </button>
          ) : (
            <button onClick={handleSetupPin} className="btn btn-secondary text-[12px]">
              {t('settings.setupPin', 'Setup PIN')}
            </button>
          )}
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
        <button 
          onClick={() => setShowFeedbackModal(true)}
          className="btn btn-secondary w-full text-[12px] py-2 transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
          {t('settings.sendFeedback', 'Send Feedback')}
        </button>
      </div>

      {/* Community */}
      <div className="card p-4">
        <div className="text-[13px] font-medium mb-2" style={{ color: 'var(--text-primary)' }}>{t('sidebar.community', 'COMMUNITY')}</div>
        <div className="flex gap-3">
          <a href="https://discord.gg/TNb3XcFaM" target="_blank" rel="noreferrer" className="flex-1 btn btn-secondary text-[12px] py-2 transition-colors flex items-center justify-center gap-2 cursor-pointer text-slate-300 hover:text-white">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>
            Discord
          </a>
          <a href="https://x.com/happygenstudio" target="_blank" rel="noreferrer" className="flex-1 btn btn-secondary text-[12px] py-2 transition-colors flex items-center justify-center gap-2 cursor-pointer text-slate-300 hover:text-white">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            X (Twitter)
          </a>
        </div>
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

      <VaultSecurityModal 
        isOpen={showPinModal} 
        onClose={() => setShowPinModal(false)} 
        mode={pinMode}
        onSuccess={() => { if(pendingAction) pendingAction(); }}
      />
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
