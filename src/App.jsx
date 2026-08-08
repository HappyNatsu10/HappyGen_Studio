import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import SidebarNav from './components/SidebarNav';
import ImageStudio from './components/ImageStudio';
import VideoStudio from './components/VideoStudio';
import CanvasEditor from './components/CanvasEditor';
import SafetyDashboard from './components/SafetyDashboard';
import GalleryProjects from './components/GalleryProjects';
import AdultVerificationModal from './components/AdultVerificationModal';
import AppExportModal from './components/AppExportModal';
import BackendConfigModal from './components/BackendConfigModal';
import AuthModal from './components/AuthModal';
import UserProfileModal from './components/UserProfileModal';

function MainAppContent() {
  const { currentUser, isAuthenticated, consumeCredits, openAuth } = useAuth();
  const [activeTab, setActiveTab] = useState('image');
  const [isAdultMode, setIsAdultMode] = useState(false);
  const [isVerifiedAdult, setIsVerifiedAdult] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showBackendModal, setShowBackendModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [generatedAssets, setGeneratedAssets] = useState([]);
  const [safetyLogs, setSafetyLogs] = useState([]);
  const [canvasTargetImage, setCanvasTargetImage] = useState(null);

  const handleImageGenerated = (newImages) => {
    setGeneratedAssets(prev => [...newImages, ...prev]);
    consumeCredits(newImages.length * 2);
  };

  const handleAddSafetyLog = (logItem) => {
    setSafetyLogs(prev => [logItem, ...prev]);
  };

  const handleSendToCanvas = (url) => {
    setCanvasTargetImage(url);
    setActiveTab('canvas');
  };

  const handleVerificationComplete = () => {
    setIsVerifiedAdult(true);
    setIsAdultMode(true);
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans ${
      isAdultMode 
        ? 'bg-[#0b0306] text-rose-50 bg-adult-gradient' 
        : 'bg-[#080811] text-slate-100 bg-radial-gradient'
    } bg-grid relative pb-24 md:pb-12`}>

      {/* Header Bar */}
      <Navbar
        isAdultMode={isAdultMode}
        onToggleAdultMode={setIsAdultMode}
        isVerifiedAdult={isVerifiedAdult}
        onOpenVerifyModal={() => setShowVerifyModal(true)}
        onOpenExportModal={() => setShowExportModal(true)}
        onOpenBackendModal={() => setShowBackendModal(true)}
        onOpenProfileModal={() => setShowProfileModal(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main View Area */}
      <main className="transition-all duration-300">
        {activeTab === 'image' && (
          <ImageStudio
            isAdultMode={isAdultMode}
            onImageGenerated={handleImageGenerated}
            onAddSafetyLog={handleAddSafetyLog}
            onSendToCanvas={handleSendToCanvas}
          />
        )}

        {activeTab === 'video' && (
          <VideoStudio
            isAdultMode={isAdultMode}
            onAddSafetyLog={handleAddSafetyLog}
          />
        )}

        {activeTab === 'canvas' && (
          <CanvasEditor
            initialImageUrl={canvasTargetImage}
            isAdultMode={isAdultMode}
          />
        )}

        {activeTab === 'gallery' && (
          <GalleryProjects
            generatedAssets={generatedAssets}
            isAdultMode={isAdultMode}
            isVerifiedAdult={isVerifiedAdult}
          />
        )}

        {activeTab === 'safety' && (
          <SafetyDashboard
            safetyLogs={safetyLogs}
            isAdultMode={isAdultMode}
          />
        )}
      </main>

      {/* Mobile Dock */}
      <SidebarNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdultMode={isAdultMode}
        onOpenExportModal={() => setShowExportModal(true)}
      />

      {/* User Authentication Modal */}
      <AuthModal />

      {/* User Profile & Account Modal */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      {/* Adult Verification Modal */}
      <AdultVerificationModal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        onVerificationComplete={handleVerificationComplete}
      />

      {/* App Export Download Modal (.EXE & .APK) */}
      <AppExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />

      {/* Backend API Configuration Modal */}
      <BackendConfigModal
        isOpen={showBackendModal}
        onClose={() => setShowBackendModal(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
