/**
 * HappyGen Studio v2.0 — AI Generation Service
 * Communicates with configured backend (Local GPU / Google Colab).
 */

const DEFAULT_NEGATIVE_PROMPT = "bad quality, low quality, blurry, bad anatomy, bad hands, extra fingers, missing fingers, deformed, watermark, text, worst quality";

let lastUsedModelName = null;

const flushMemoryIfModelChanged = async (backendUrl, targetModelName) => {
  if (targetModelName && lastUsedModelName && targetModelName !== lastUsedModelName) {
    try {
      console.log(`[AI Service] Model changed from ${lastUsedModelName} to ${targetModelName}. Flushing VRAM...`);
      await fetch(`${backendUrl}/sdapi/v1/unload-checkpoint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' }
      });
      // Pause briefly to allow backend garbage collection to run
      await new Promise(r => setTimeout(r, 1500));
    } catch (e) {
      console.warn("[AI Service] Failed to flush VRAM:", e);
    }
  }
  if (targetModelName) lastUsedModelName = targetModelName;
};

export const flushVRAM = async () => {
  const rawBackendUrl = typeof window !== 'undefined'
    ? (localStorage.getItem('omnigen_backend_url') || 'http://localhost:8000')
    : 'http://localhost:8000';
  const backendUrl = rawBackendUrl.trim().replace(/\/+$/, '');
  
  try {
    const res = await fetch(`${backendUrl}/sdapi/v1/unload-checkpoint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' }
    });
    if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    throw new Error(`Failed to flush VRAM: ${err.message}`);
  }
};

export const generateImageAI = async ({
  prompt,
  baseModel = '',
  loras = [],
  width = 512,
  height = 768,
  seed = Math.floor(Math.random() * 2147483647),
  batchCount = 1,
  steps = 20,
  guidanceScale = 6.5,
  isAdultMode = false,
  negativePrompt = '',
}) => {
  const activeNegativePrompt = negativePrompt?.trim() || DEFAULT_NEGATIVE_PROMPT;

  const images = [];
  const rawBackendUrl = typeof window !== 'undefined'
    ? (localStorage.getItem('omnigen_backend_url') || 'http://localhost:8000')
    : 'http://localhost:8000';
  const backendUrl = rawBackendUrl.trim().replace(/\/+$/, '');
  const civitaiApiKey = typeof window !== 'undefined' ? (localStorage.getItem('omnigen_civitai_key') || '') : '';

  const currentModelName = typeof baseModel === 'object' && baseModel ? baseModel.name : baseModel;
  await flushMemoryIfModelChanged(backendUrl, currentModelName);

  for (let i = 0; i < batchCount; i++) {
    const currentSeed = seed + i * 42;
    let imageUrl = '';
    let usedEngineName = `GPU (${baseModel?.name || baseModel || 'default'})`;

    try {
      const res = await fetch(`${backendUrl}/sdapi/v1/txt2img`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' },
        body: JSON.stringify({
          prompt,
          negative_prompt: activeNegativePrompt,
          steps: steps || 20,
          cfg_scale: guidanceScale || 6.5,
          width,
          height,
          seed: currentSeed,
          base_model: typeof baseModel === 'object' && baseModel ? {
            name: baseModel.name,
            fileName: baseModel.version?.fileName || baseModel.fileName,
            downloadUrl: baseModel.version?.downloadUrl || baseModel.downloadUrl,
            architecture: baseModel.version?.baseModel || "SDXL 1.0"
          } : baseModel,
          loras: loras.map(l => ({
            name: l.id || l.name,
            weight: l.weight ?? 0.8,
            downloadUrl: l.version?.downloadUrl || l.downloadUrl,
            fileName: l.version?.fileName || l.fileName
          })),
          civitai_api_key: civitaiApiKey,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.error) {
          throw new Error(data.error);
        }
        if (data.images?.length > 0) {
          const rawB64 = data.images[0];
          imageUrl = rawB64.startsWith('data:') ? rawB64 : `data:image/png;base64,${rawB64}`;
          if (data.source) usedEngineName = data.source;
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.message || `Server returned HTTP ${res.status}`);
      }
    } catch (err) {
      let errorMessage = err.message || "Connection failed";
      if (errorMessage.includes("Failed to fetch") || errorMessage.includes("NetworkError")) {
        errorMessage = "Connection dropped. If you just changed models, the backend might still be downloading it. Cloudflare/proxies often timeout after 100s. Please wait 1-2 minutes and try again.";
      }
      throw new Error(`Backend Error (${backendUrl}): ${errorMessage}`);
    }

    if (!imageUrl) {
      throw new Error("No image data returned from inference server.");
    }

    images.push({
      id: `img-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
      url: imageUrl,
      prompt,
      negativePrompt: activeNegativePrompt,
      modelUsed: usedEngineName,
      width,
      height,
      seed: currentSeed,
      createdAt: new Date().toISOString(),
      isAdult: isAdultMode,
    });
  }

  return images;
};

export const interrogateImage = async ({ sourceImage, model = 'clip' }) => {
  const rawBackendUrl = typeof window !== 'undefined'
    ? (localStorage.getItem('omnigen_backend_url') || 'http://localhost:8000')
    : 'http://localhost:8000';
  const backendUrl = rawBackendUrl.trim().replace(/\/+$/, '');

  // Send image as-is (backend handles stripping the data URI prefix)
  const imagePayload = sourceImage;

  try {
    const res = await fetch(`${backendUrl}/sdapi/v1/interrogate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' },
      body: JSON.stringify({
        image: imagePayload,
        model: model,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.caption) {
        return data.caption;
      }
      throw new Error('No caption returned from the server.');
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || errData.message || `Server returned HTTP ${res.status}`);
  } catch (err) {
    let errorMessage = err.message || "Connection failed";
    if (errorMessage.includes("Failed to fetch") || errorMessage.includes("NetworkError")) {
      errorMessage = "Connection dropped. The interrogation may take a while on the first run as the model loads. Please try again.";
    }
    throw new Error(`Backend Error (${backendUrl}): ${errorMessage}`);
  }
};

export const upscaleImageAI = async ({ sourceImage, scale = 2 }) => {
  const rawBackendUrl = typeof window !== 'undefined'
    ? (localStorage.getItem('omnigen_backend_url') || 'http://localhost:8000')
    : 'http://localhost:8000';
  const backendUrl = rawBackendUrl.trim().replace(/\/+$/, '');

  try {
    const res = await fetch(`${backendUrl}/sdapi/v1/extra-single-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' },
      body: JSON.stringify({
        image: sourceImage,
        upscaling_resize: scale,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.images?.length > 0) {
        const rawB64 = data.images[0];
        const imageUrl = rawB64.startsWith('data:') ? rawB64 : `data:image/png;base64,${rawB64}`;
        return [{
          id: `up-${Date.now()}`,
          url: imageUrl,
          prompt: 'Upscaled Image',
          modelUsed: data.source || 'Real-ESRGAN',
          createdAt: new Date().toISOString(),
        }];
      }
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || errData.detail || `Server returned HTTP ${res.status}`);
  } catch (err) {
    let errorMessage = err.message || "Connection failed";
    if (errorMessage.includes("Failed to fetch") || errorMessage.includes("NetworkError")) {
      errorMessage = "Connection dropped. Upscaling may take a while on first use as the model loads. Please try again.";
    }
    throw new Error(`Backend Error (${backendUrl}): ${errorMessage}`);
  }
};

export const upscaleImage = upscaleImageAI;

export const generateImg2Img = async ({
  prompt,
  negativePrompt = '',
  sourceImage,
  denoisingStrength = 0.5,
  width = 512,
  height = 768,
  seed = Math.floor(Math.random() * 2147483647),
  baseModel = '',
  loras = [],
  steps = 20,
  guidanceScale = 6.5,
  isAdultMode = false,
}) => {
  const activeNegativePrompt = negativePrompt?.trim() || DEFAULT_NEGATIVE_PROMPT;
  const rawBackendUrl = typeof window !== 'undefined'
    ? (localStorage.getItem('omnigen_backend_url') || 'http://localhost:8000')
    : 'http://localhost:8000';
  const backendUrl = rawBackendUrl.trim().replace(/\/+$/, '');
  const civitaiApiKey = typeof window !== 'undefined' ? (localStorage.getItem('omnigen_civitai_key') || '') : '';

  const currentModelName = typeof baseModel === 'object' && baseModel ? baseModel.name : baseModel;
  await flushMemoryIfModelChanged(backendUrl, currentModelName);

  try {
    const res = await fetch(`${backendUrl}/sdapi/v1/img2img`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' },
      body: JSON.stringify({
        prompt,
        negative_prompt: activeNegativePrompt,
        init_images: [sourceImage],
        denoising_strength: denoisingStrength,
        steps: steps || 20,
        cfg_scale: guidanceScale || 6.5,
        width,
        height,
        seed,
        base_model: typeof baseModel === 'object' && baseModel ? {
          name: baseModel.name,
          fileName: baseModel.version?.fileName || baseModel.fileName,
          downloadUrl: baseModel.version?.downloadUrl || baseModel.downloadUrl,
          architecture: baseModel.version?.baseModel || "SDXL 1.0"
        } : baseModel,
        loras: loras.map(l => ({
          name: l.id || l.name,
          weight: l.weight ?? 0.8,
          downloadUrl: l.version?.downloadUrl || l.downloadUrl,
          fileName: l.version?.fileName || l.fileName
        })),
        civitai_api_key: civitaiApiKey,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      if (data.images?.length > 0) {
        const rawB64 = data.images[0];
        const imageUrl = rawB64.startsWith('data:') ? rawB64 : `data:image/png;base64,${rawB64}`;
        return [{
          id: `img2img-${Date.now()}`,
          url: imageUrl,
          prompt,
          seed,
          createdAt: new Date().toISOString(),
          isAdult: isAdultMode,
        }];
      }
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || errData.message || `Server returned HTTP ${res.status}`);
  } catch (err) {
    let errorMessage = err.message || "Connection failed";
    if (errorMessage.includes("Failed to fetch") || errorMessage.includes("NetworkError")) {
      errorMessage = "Connection dropped. If you just changed models, the backend might still be downloading it. Cloudflare/proxies often timeout after 100s. Please wait 1-2 minutes and try again.";
    }
    throw new Error(`Backend Error (${backendUrl}): ${errorMessage}`);
  }
};

export const faceFixImage = async ({ sourceImage, prompt }) => {
  const rawBackendUrl = typeof window !== 'undefined'
    ? (localStorage.getItem('omnigen_backend_url') || 'http://localhost:8000')
    : 'http://localhost:8000';
  const backendUrl = rawBackendUrl.trim().replace(/\/+$/, '');

  try {
    const res = await fetch(`${backendUrl}/sdapi/v1/face-fix`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' },
      body: JSON.stringify({
        image: sourceImage,
        prompt: prompt || '',
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.images?.length > 0) {
        const rawB64 = data.images[0];
        const imageUrl = rawB64.startsWith('data:') ? rawB64 : `data:image/png;base64,${rawB64}`;
        return [{
          id: `fix-${Date.now()}`,
          url: imageUrl,
          prompt: 'Face Fix applied',
          modelUsed: data.source || 'GFPGAN',
          createdAt: new Date().toISOString(),
        }];
      }
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || errData.detail || `Server returned HTTP ${res.status}`);
  } catch (err) {
    let errorMessage = err.message || "Connection failed";
    if (errorMessage.includes("Failed to fetch") || errorMessage.includes("NetworkError")) {
      errorMessage = "Connection dropped. Face fix may take a while on first use as the model loads. Please try again.";
    }
    throw new Error(`Backend Error (${backendUrl}): ${errorMessage}`);
  }
};

export const inpaintImage = async ({
  prompt,
  negativePrompt = '',
  sourceImage,
  maskImage,
  width = 512,
  height = 768,
  seed = Math.floor(Math.random() * 2147483647),
  baseModel = '',
  loras = [],
  steps = 20,
  guidanceScale = 6.5,
  isAdultMode = false,
}) => {
  const activeNegativePrompt = negativePrompt?.trim() || DEFAULT_NEGATIVE_PROMPT;
  const rawBackendUrl = typeof window !== 'undefined'
    ? (localStorage.getItem('omnigen_backend_url') || 'http://localhost:8000')
    : 'http://localhost:8000';
  const backendUrl = rawBackendUrl.trim().replace(/\/+$/, '');
  const civitaiApiKey = typeof window !== 'undefined' ? (localStorage.getItem('omnigen_civitai_key') || '') : '';

  const currentModelName = typeof baseModel === 'object' && baseModel ? baseModel.name : baseModel;
  await flushMemoryIfModelChanged(backendUrl, currentModelName);

  try {
    const res = await fetch(`${backendUrl}/sdapi/v1/img2img`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' },
      body: JSON.stringify({
        prompt,
        negative_prompt: activeNegativePrompt,
        init_images: [sourceImage],
        mask: maskImage,
        denoising_strength: 0.75, // Standard for inpaint
        steps: steps || 20,
        cfg_scale: guidanceScale || 6.5,
        width,
        height,
        seed,
        base_model: typeof baseModel === 'object' && baseModel ? {
          name: baseModel.name,
          fileName: baseModel.version?.fileName || baseModel.fileName,
          downloadUrl: baseModel.version?.downloadUrl || baseModel.downloadUrl,
          architecture: baseModel.version?.baseModel || "SDXL 1.0"
        } : baseModel,
        loras: loras.map(l => ({
          name: l.id || l.name,
          weight: l.weight ?? 0.8,
          downloadUrl: l.version?.downloadUrl || l.downloadUrl,
          fileName: l.version?.fileName || l.fileName
        })),
        civitai_api_key: civitaiApiKey,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      if (data.images?.length > 0) {
        const rawB64 = data.images[0];
        const imageUrl = rawB64.startsWith('data:') ? rawB64 : `data:image/png;base64,${rawB64}`;
        return [{
          id: `inpaint-${Date.now()}`,
          url: imageUrl,
          prompt,
          seed,
          createdAt: new Date().toISOString(),
          isAdult: isAdultMode,
        }];
      }
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || errData.message || `Server returned HTTP ${res.status}`);
  } catch (err) {
    throw new Error(`Backend Error (${backendUrl}): ${err.message || "Connection failed"}. Check your server.`);
  }
};

export const generateVideoAI = async ({
  prompt,
  motion = 'pan_right',
  duration = 5,
  sourceImage = null,
  isAdultMode = false,
}) => {
  const rawBackendUrl = typeof window !== 'undefined'
    ? (localStorage.getItem('omnigen_backend_url') || 'http://localhost:8000')
    : 'http://localhost:8000';
  const backendUrl = rawBackendUrl.trim().replace(/\/+$/, '');

  try {
    const res = await fetch(`${backendUrl}/api/video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' },
      body: JSON.stringify({
        prompt,
        init_image: sourceImage,
        motion,
        duration
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        id: `vid-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: prompt.substring(0, 40) + '...',
        prompt,
        motion,
        duration,
        posterUrl: sourceImage || '/vite.svg',
        videoUrl: data.video_url || '',
        createdAt: new Date().toISOString(),
        isAdult: isAdultMode,
        fps: 30,
        resolution: '1280x720',
        source: data.source || 'Unknown'
      };
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || errData.message || `Server returned HTTP ${res.status}`);
  } catch (err) {
    throw new Error(`Video Backend Error (${backendUrl}): ${err.message || "Connection failed"}. Check your proxy server.`);
  }
};
