import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';

const idbStorage = {
  getItem: async (name) => {
    return (await get(name)) || null;
  },
  setItem: async (name, value) => {
    await set(name, value);
  },
  removeItem: async (name) => {
    await del(name);
  },
};

import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';

const useWorkspaceStore = create(persist((set, get) => ({
  // Global Assets
  generatedAssets: [],
  setGeneratedAssets: (assets) => set({ generatedAssets: assets }),
  addGeneratedAssets: async (newAssets) => {
    const assetsWithTime = newAssets.map(a => ({
      ...a,
      timestamp: a.timestamp || Date.now()
    }));
    // 1. Update local Zustand state
    set((state) => ({ 
      generatedAssets: [...assetsWithTime, ...state.generatedAssets] 
    }));
    
    // 2. Sync to Firebase if user is logged in
    const user = auth?.currentUser;
    if (user && db) {
      try {
        const docRef = doc(db, 'user_workspaces', user.uid);
        const currentAssets = get().generatedAssets;
        await setDoc(docRef, { generatedAssets: currentAssets }, { merge: true });
      } catch (err) {
        console.warn("Could not sync generated assets to Firebase.", err);
      }
    }
  },

  removeGeneratedAsset: async (assetId) => {
    set((state) => ({
      generatedAssets: state.generatedAssets.filter(asset => asset.id !== assetId && asset.url !== assetId)
    }));
    
    // Sync to Firebase
    const user = auth?.currentUser;
    if (user && db) {
      try {
        const docRef = doc(db, 'user_workspaces', user.uid);
        const currentAssets = get().generatedAssets;
        await setDoc(docRef, { generatedAssets: currentAssets }, { merge: true });
      } catch (err) {
        console.warn("Could not sync generated assets to Firebase.", err);
      }
    }
  },

  // Cross-Module State (Sending data between tabs)
  canvasTargetImage: null,
  setCanvasTargetImage: (url) => set({ canvasTargetImage: url }),

  videoSourceImage: null,
  setVideoSourceImage: (url) => set({ videoSourceImage: url }),

  inpaintSourceImage: null,
  setInpaintSourceImage: (url) => set({ inpaintSourceImage: url }),

  img2imgSourceImage: null,
  setImg2ImgSourceImage: (url) => set({ img2imgSourceImage: url }),
}), {
  name: 'omnigen-workspace-storage',
  storage: createJSONStorage(() => idbStorage),
}));

export default useWorkspaceStore;
