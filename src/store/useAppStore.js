import { create } from 'zustand';

const useAppStore = create((set) => ({
  // Navigation State
  activeTab: 'generate',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // UI State
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  
  // App Settings
  mode: localStorage.getItem('omnigen_mode') || 'basic',
  setMode: (mode) => {
    localStorage.setItem('omnigen_mode', mode);
    set({ mode });
  },
  
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
}));

export default useAppStore;
