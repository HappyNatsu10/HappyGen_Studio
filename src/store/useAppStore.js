import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAppStore = create(persist((set) => ({
  // Navigation State
  activeTab: 'generate',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // UI State
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  
  // App Settings
  
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
