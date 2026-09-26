import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAppStore = create(persist((set) => ({
  // Navigation State
  activeTab: 'generate',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // UI State
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  
  showThemeModal: false,
  showFeedbackModal: false,
  setShowFeedbackModal: (val) => set({ showFeedbackModal: val }),
  setShowThemeModal: (val) => set({ showThemeModal: val }),
  
  // App Settings
  hasSelectedLanguage: false,
  setHasSelectedLanguage: (val) => set({ hasSelectedLanguage: val }),

  hasSeenTutorial: false,
  setHasSeenTutorial: (val) => set({ hasSeenTutorial: val }),
  
  hasSeenInteractiveTour: false,
  setHasSeenInteractiveTour: (val) => set({ hasSeenInteractiveTour: val }),

  isAdultMode: false,
  setIsAdultMode: (isAdult) => set({ isAdultMode: isAdult }),

  // Modals
  showBackendModal: false,
  setShowBackendModal: (show) => set({ showBackendModal: show }),

  showProfileModal: false,
  setShowProfileModal: (show) => set({ showProfileModal: show }),

  showModelModal: false,
  modalEngineContext: null,
  openModelModal: (context) => set({ showModelModal: true, modalEngineContext: context }),
  closeModelModal: () => set({ showModelModal: false, modalEngineContext: null }),
}), { name: 'omnigen-app-storage' }));

export default useAppStore;
