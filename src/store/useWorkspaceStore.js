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

const useWorkspaceStore = create(persist((set, get) => ({
  // Global Assets
  generatedAssets: [],
  setGeneratedAssets: (assets) => set({ generatedAssets: assets }),
  addGeneratedAssets: (newAssets) => set((state) => ({ 
    generatedAssets: [...newAssets, ...state.generatedAssets] 
  })),

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
