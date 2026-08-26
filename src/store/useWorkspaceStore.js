import { create } from 'zustand';

const useWorkspaceStore = create((set, get) => ({
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
}));

export default useWorkspaceStore;
