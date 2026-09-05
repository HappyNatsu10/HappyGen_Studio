import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import useAppStore from './store/useAppStore';

const TAB_TITLES = {
  generate: 'Generate',
  models: 'Model Explorer',
  gallery: 'Gallery',
  settings: 'Settings',
  video: 'Video Suite',
  canvas: 'Canvas',
  inpaint: 'Inpaint Studio',
};

function MainApp() {
  const { currentUser, isAuthenticated, openAuth } = useAuth();
  
  const {
    activeTab,
    sidebarCollapsed,
    mode,
    showBackendModal,
    showProfileModal,
    showModelModal,
    hasSeenTutorial,
    setShowBackendModal,
    setShowProfileModal,
  } = useAppStore();

  const sidebarWidth = sidebarCollapsed ? 60 : 220;

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--surface-0)' }}>
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
      <BackendConfigModal isOpen={showBackendModal} onClose={() => setShowBackendModal(false)} />
      
      {!hasSeenTutorial && <OnboardingTutorial />}
      <InteractiveTour />
    </div>
  );
}

// Simple settings page connected to Zustand
function SettingsPage() {
  const { isAdultMode, setIsAdultMode, setShowBackendModal, setHasSeenTutorial, setHasSeenInteractiveTour } = useAppStore();

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h2 className="text-[16px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Settings</h2>
        <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>Configure your HappyGen Studio experience.</p>
      </div>

      <div className="card p-4 space-y-4">
        {/* Backend */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>Backend Server</div>
            <div className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Configure Local GPU or Google Colab</div>
          </div>
          <button onClick={() => setShowBackendModal(true)} className="btn btn-secondary text-[12px]">
            Configure
          </button>
        </div>

        {/* 18+ Mode */}
        <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <div>
            <div className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>18+ Content</div>
            <div className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Show NSFW models & disable content filter</div>
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
        <div className="text-[13px] font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Help & Tutorials</div>
        <p className="text-[11px] mb-3" style={{ color: 'var(--text-tertiary)' }}>Replay the introductory guide or take an interactive tour of HappyGen Studio.</p>
        <div className="flex flex-col gap-2">
          <button onClick={() => setHasSeenTutorial(false)} className="btn btn-secondary w-full text-[12px] py-2 cursor-pointer transition-colors hover:bg-white/10">
            Show Welcome Guide
          </button>
          <button onClick={() => setHasSeenInteractiveTour(false)} className="btn btn-secondary w-full text-[12px] py-2 cursor-pointer transition-colors hover:bg-white/10">
            Start Interactive Tour
          </button>
        </div>
      </div>

      {/* About */}
      <div className="card p-4">
        <div className="text-[13px] font-medium mb-1" style={{ color: 'var(--text-primary)' }}>About</div>
        <div className="text-[11px] space-y-0.5" style={{ color: 'var(--text-tertiary)' }}>
          <p>HappyGen Studio v2.0</p>
          <p>Built by HappyNatsu10</p>
          <p>Powered by CivitAI API & Stable Diffusion</p>
        </div>
      </div>
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
