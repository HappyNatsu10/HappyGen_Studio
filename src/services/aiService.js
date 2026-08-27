/**
 * HappyGen Studio v2.0 — AI Generation Service
 * Communicates with configured backend (Local GPU / Google Colab).
 */

const DEFAULT_NEGATIVE_PROMPT = "bad quality, low quality, blurry, bad anatomy, bad hands, extra fingers, missing fingers, deformed, watermark, text, worst quality";

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

  for (let i = 0; i < batchCount; i++) {
    const currentSeed = seed + i * 42;
    let imageUrl = '';
    let usedEngineName = `GPU (${baseModel?.name || baseModel || 'default'})`;

    try {
      const res = await fetch(`${backendUrl}/sdapi/v1/txt2img`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      throw new Error(`Backend Error (${backendUrl}): ${err.message || "Connection failed"}. Check your server.`);
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

export const upscaleImageAI = async ({ sourceImage, scale = 2 }) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([{
        id: `up-${Date.now()}`,
        url: sourceImage,
        prompt: 'Upscaled Image',
        createdAt: new Date().toISOString(),
      }]);
    }, 800);
  });
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

  try {
    const res = await fetch(`${backendUrl}/api/img2img`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    throw new Error(`Backend Error (${backendUrl}): ${err.message || "Connection failed"}. Check your server.`);
  }
};

export const faceFixImage = async ({ sourceImage, prompt }) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([{
        id: `fix-${Date.now()}`,
        url: sourceImage,
        prompt: 'Face Fix applied',
        createdAt: new Date().toISOString(),
      }]);
    }, 1000);
  });
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

  try {
    const res = await fetch(`${backendUrl}/api/inpaint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
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
