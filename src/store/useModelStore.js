import { create } from 'zustand';

const STORAGE_KEY_BASE = 'omnigen_selected_base_model';
const STORAGE_KEY_LORAS = 'omnigen_active_loras';
const STORAGE_KEY_EMBEDDINGS = 'omnigen_active_embeddings';

const useModelStore = create((set, get) => ({
  // Engines
  imageEngine: 'flux_1',
  setImageEngine: (engine) => set({ imageEngine: engine }),

  videoEngine: 'sora_2',
  setVideoEngine: (engine) => set({ videoEngine: engine }),

  // Base model
  baseModel: (() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BASE);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })(),
  setBaseModel: (model) => {
    const currentBase = get().baseModel;
    if (model) {
      localStorage.setItem(STORAGE_KEY_BASE, JSON.stringify(model));
      const oldArch = currentBase?.version?.baseModel;
      const newArch = model.version?.baseModel;
      if (oldArch && newArch && oldArch !== newArch) {
        get().clearLoras();
      }
    } else {
      localStorage.removeItem(STORAGE_KEY_BASE);
      get().clearLoras();
    }
    set({ baseModel: model });
  },

  // LoRA stack
  loras: (() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LORAS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  })(),
  
  addLora: (lora) => set((state) => {
    if (state.loras.some(l => l.id === lora.id)) return state;
    const newLoras = [...state.loras, {
      id: lora.id,
      versionId: lora.versionId || lora.version?.id,
      name: lora.name,
      weight: lora.weight ?? 0.8,
      triggerWords: lora.triggerWords || lora.version?.trainedWords || [],
      thumbnailUrl: lora.thumbnailUrl || null,
      baseModel: lora.baseModel || lora.version?.baseModel || 'Unknown',
      downloadUrl: lora.downloadUrl || lora.version?.downloadUrl || null,
      fileName: lora.fileName || lora.version?.fileName || null,
    }];
    localStorage.setItem(STORAGE_KEY_LORAS, JSON.stringify(newLoras));
    return { loras: newLoras };
  }),

  removeLora: (loraId) => set((state) => {
    const newLoras = state.loras.filter(l => l.id !== loraId);
    localStorage.setItem(STORAGE_KEY_LORAS, JSON.stringify(newLoras));
    return { loras: newLoras };
  }),

  updateLoraWeight: (loraId, weight) => set((state) => {
    const newLoras = state.loras.map(l =>
      l.id === loraId ? { ...l, weight: Math.max(0.1, Math.min(1.5, weight)) } : l
    );
    localStorage.setItem(STORAGE_KEY_LORAS, JSON.stringify(newLoras));
    return { loras: newLoras };
  }),

  clearLoras: () => {
    localStorage.setItem(STORAGE_KEY_LORAS, JSON.stringify([]));
    set({ loras: [] });
  },

  // Embeddings
  embeddings: (() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EMBEDDINGS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  })(),

  addEmbedding: (embedding) => set((state) => {
    if (state.embeddings.some(e => e.id === embedding.id)) return state;
    const newEmbeds = [...state.embeddings, {
      id: embedding.id,
      versionId: embedding.versionId || embedding.version?.id,
      name: embedding.name,
      triggerWords: embedding.triggerWords || embedding.version?.trainedWords || [],
      thumbnailUrl: embedding.thumbnailUrl || null,
      baseModel: embedding.baseModel || embedding.version?.baseModel || 'Unknown',
      downloadUrl: embedding.downloadUrl || embedding.version?.downloadUrl || null,
      fileName: embedding.fileName || embedding.version?.fileName || null,
    }];
    localStorage.setItem(STORAGE_KEY_EMBEDDINGS, JSON.stringify(newEmbeds));
    return { embeddings: newEmbeds };
  }),

  removeEmbedding: (embeddingId) => set((state) => {
    const newEmbeds = state.embeddings.filter(e => e.id !== embeddingId);
    localStorage.setItem(STORAGE_KEY_EMBEDDINGS, JSON.stringify(newEmbeds));
    return { embeddings: newEmbeds };
  }),

  clearEmbeddings: () => {
    localStorage.setItem(STORAGE_KEY_EMBEDDINGS, JSON.stringify([]));
    set({ embeddings: [] });
  },

  // Computed selector for trigger words
  getCombinedTriggerWords: () => {
    const loraWords = get().loras.reduce((acc, l) => {
      return [...acc, ...(l.triggerWords || [])];
    }, []);
    const embedWords = get().embeddings.reduce((acc, e) => {
      return [...acc, ...(e.triggerWords || [])];
    }, []);
    return [...loraWords, ...embedWords];
  }
}));

export default useModelStore;
