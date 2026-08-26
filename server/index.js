import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const PORT = process.env.PORT || 8000;
const CLOUD_API_KEY = process.env.CLOUD_API_KEY || null;
const CLOUD_PROVIDER = process.env.CLOUD_PROVIDER || 'mock'; // 'fal', 'replicate', or 'mock'

console.log(`[PROXY] Starting OmniGen Cloud Proxy Server...`);
console.log(`[PROXY] Provider mode: ${CLOUD_PROVIDER.toUpperCase()}`);

// Utility: Simple async sleep
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Utility: Returns a tiny 1x1 purple PNG as base64 for mock mode
const getMockImageBase64 = () => {
  // 1x1 pixel purple PNG
  return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAFBgIAX8jM3QAAAABJRU5ErkJggg==';
};

// Utility: Call Together.ai REST API
const callTogetherAPI = async (endpoint, payload) => {
  if (!CLOUD_API_KEY) throw new Error("CLOUD_API_KEY is not configured.");
  const response = await fetch(`https://api.together.xyz/v1${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CLOUD_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || err.message || `Together API error: ${response.status}`);
  }
  return await response.json();
};

// ==========================================
// Proxy Routes
// ==========================================

// 1. Text to Image
app.post('/api/generate', async (req, res) => {
  const { prompt, width, height, base_model, steps } = req.body;
  console.log(`[PROXY] POST /api/generate - Model: ${base_model}`);

  if (CLOUD_PROVIDER === 'mock') {
    await sleep(2000);
    return res.json({
      status: "ok",
      source: `Cloud Proxy (${base_model || 'default'})`,
      images: [getMockImageBase64()]
    });
  }

  try {
    // Default to SDXL, switch to Flux if requested
    let modelId = 'stabilityai/stable-diffusion-xl-base-1.0';
    if (base_model && base_model.includes('flux')) modelId = 'black-forest-labs/FLUX.1-schnell';

    const payload = {
      model: modelId,
      prompt,
      width: parseInt(width) || 1024,
      height: parseInt(height) || 1024,
      steps: parseInt(steps) || (modelId.includes('schnell') ? 4 : 20),
      n: 1,
      response_format: "b64_json"
    };

    // NOTE: Together.ai does NOT support dynamic LoRA URLs natively like Fal.ai.
    // The `loras` array from the frontend is intentionally ignored here.

    const data = await callTogetherAPI('/images/generations', payload);
    const imageUrl = data.data && data.data[0] ? data.data[0].b64_json : getMockImageBase64();
    
    return res.json({
      status: "ok",
      source: `Together.ai (${modelId})`,
      images: [imageUrl]
    });
  } catch (error) {
    console.error("[PROXY ERROR]", error.message);
    return res.status(500).json({ error: error.message });
  }
});

// 2. Image to Image
app.post('/api/img2img', async (req, res) => {
  const { prompt, init_images, denoising_strength } = req.body;
  console.log(`[PROXY] POST /api/img2img`);

  if (CLOUD_PROVIDER === 'mock') {
    await sleep(2000);
    const source = init_images && init_images[0] ? init_images[0] : getMockImageBase64();
    return res.json({ status: "ok", source: "Cloud Proxy (img2img)", images: [source.replace(/^data:image\/\w+;base64,/, '')] });
  }

  return res.status(501).json({ error: "Together.ai does not fully support raw dynamic img2img via v1/images endpoints natively without specific models." });
});

// 3. Inpaint
app.post('/api/inpaint', async (req, res) => {
  console.log(`[PROXY] POST /api/inpaint`);

  if (CLOUD_PROVIDER === 'mock') {
    await sleep(2500);
    const { init_images } = req.body;
    const source = init_images && init_images[0] ? init_images[0] : getMockImageBase64();
    return res.json({ status: "ok", source: "Cloud Proxy (inpaint)", images: [source.replace(/^data:image\/\w+;base64,/, '')] });
  }

  return res.status(501).json({ error: "Together.ai does not fully support raw dynamic inpaint via v1/images endpoints natively." });
});

// 4. Video Generation
app.post('/api/video', async (req, res) => {
  console.log(`[PROXY] POST /api/video`);

  if (CLOUD_PROVIDER === 'mock') {
    await sleep(4000);
    return res.json({ status: "ok", source: "Cloud Proxy (SVD)", video_url: "https://www.w3schools.com/html/mov_bbb.mp4" });
  }

  return res.status(501).json({ error: "Together.ai does not support video generation." });
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: "running",
    provider: CLOUD_PROVIDER,
    key_configured: !!CLOUD_API_KEY
  });
});

app.listen(PORT, () => {
  console.log(`[ONLINE] Proxy Server running on http://localhost:${PORT}`);
});
