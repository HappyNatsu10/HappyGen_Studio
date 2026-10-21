import { create } from 'zustand';
import confetti from 'canvas-confetti';
import { 
  DEFAULT_APP_VERSION,
  checkForUpdates as checkUpdatesService, 
  installUpdate as installUpdateService,
  getLastCheckedTime,
  getRecentUpdateNotice,
  clearRecentUpdateNotice
} from '../services/updateService';

export const useUpdateStore = create((set, get) => ({
  currentVersion: DEFAULT_APP_VERSION,
  latestVersion: DEFAULT_APP_VERSION,
  lastChecked: getLastCheckedTime(),
  isChecking: false,
  updateAvailable: false,
  releaseInfo: null,

  // Modal State
  showModal: false,
  modalMode: 'available', // 'available' | 'installing' | 'post-install'
  
  // Installation Progress State
  installing: false,
  installProgress: 0,
  installStatusText: '',
  installSuccess: false,

  // Check for updates against real sources
  checkUpdates: async (forceModal = false) => {
    set({ isChecking: true });
    try {
      const res = await checkUpdatesService();
      const lastChecked = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      set({
        isChecking: false,
        currentVersion: res.currentVersion,
        latestVersion: res.latestVersion,
        updateAvailable: res.updateAvailable,
        releaseInfo: res.release,
        lastChecked
      });

      if (res.updateAvailable && forceModal) {
        set({
          showModal: true,
          modalMode: 'available'
        });
      }

      return res;
    } catch (err) {
      console.error('Update check failed:', err);
      set({ isChecking: false });
      return { updateAvailable: false, error: err.message };
    }
  },

  // Open "What's New" modal
  openWhatsNew: (mode = 'available') => {
    set({
      showModal: true,
      modalMode: mode
    });
    if (mode === 'post-install') {
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    }
  },

  // Close Modal
  closeModal: () => {
    set({ showModal: false });
    if (get().modalMode === 'post-install') {
      clearRecentUpdateNotice();
    }
  },

  // Start real in-app download and installation
  startInstall: async () => {
    const { releaseInfo } = get();
    if (!releaseInfo) return;

    set({
      modalMode: 'installing',
      installing: true,
      installProgress: 5,
      installStatusText: 'Connecting to download server...'
    });

    try {
      const result = await installUpdateService(releaseInfo, (progress, statusText) => {
        set({
          installProgress: progress,
          installStatusText: statusText
        });
      });

      if (result.success) {
        set({
          installing: false,
          installSuccess: true,
          currentVersion: result.version,
          updateAvailable: false,
          modalMode: 'post-install'
        });

        // Trigger celebratory confetti
        try {
          confetti({
            particleCount: 110,
            spread: 80,
            origin: { y: 0.55 },
            colors: ['#6366f1', '#a855f7', '#ec4899', '#10b981', '#f59e0b']
          });
        } catch (e) {}
      }
    } catch (err) {
      console.error('Failed to install update:', err);
      set({
        installing: false,
        installStatusText: 'Installation encountered an issue. Please try again.'
      });
    }
  },

  // Check if there was an update recently applied that hasn't displayed "What's New"
  checkPendingWhatsNew: () => {
    const recent = getRecentUpdateNotice();
    if (recent) {
      set({
        currentVersion: recent.version,
        releaseInfo: recent,
        showModal: true,
        modalMode: 'post-install'
      });
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    }
  }
}));
