import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const DEFAULT_NEGATIVE = "lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry";

const useGenerateStore = create(persist((set) => ({
  generationMode: 'create',
  setGenerationMode: (mode) => set({ generationMode: mode }),

  prompt: '',
  setPrompt: (prompt) => set({ prompt }),

  loraPrompt: '',
  setLoraPrompt: (loraPrompt) => set({ loraPrompt }),

  negativePrompt: DEFAULT_NEGATIVE,
  setNegativePrompt: (negativePrompt) => set({ negativePrompt }),

  aspectRatio: '1:1',
  setAspectRatio: (aspectRatio) => set({ aspectRatio }),

  qualityPreset: 'quality',
  setQualityPreset: (qualityPreset) => set({ qualityPreset }),

  steps: 20,
  setSteps: (steps) => set({ steps }),

  cfg: 6.5,
  setCfg: (cfg) => set({ cfg }),

  seed: '-1',
  setSeed: (seed) => set({ seed }),

  batchCount: 1,
  setBatchCount: (batchCount) => set({ batchCount }),

  sampler: 'Euler a',
  setSampler: (sampler) => set({ sampler }),

  denoisingStrength: 0.5,
  setDenoisingStrength: (denoisingStrength) => set({ denoisingStrength }),

  upscaleScale: 2,
  setUpscaleScale: (upscaleScale) => set({ upscaleScale }),

  upscaleModel: 'R-ESRGAN 4x+ Anime6B',
  setUpscaleModel: (upscaleModel) => set({ upscaleModel }),

}), { name: 'omnigen-generate-storage' }));

export default useGenerateStore;
