import React from 'react';
import { useTranslation } from 'react-i18next';
import { Server, Cpu, Key, FileText, Zap, BookOpen, DownloadCloud } from 'lucide-react';

export default function SystemDocs() {
  const { t } = useTranslation();
  return (
    <div className="space-y-8 text-slate-300 text-sm leading-relaxed p-2">
      
      <div className="border-b border-[var(--border-subtle)] pb-6 mb-6">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-purple-400" />
          {t('docs.header.title', 'HappyGen Studio Architecture')}
        </h2>
        <p className="text-slate-400 text-base">
          {t('docs.header.desc', 'A comprehensive guide to the HappyGen Studio system, its backend requirements, and feature architecture.')}
        </p>
      </div>

      {/* System Overview */}
      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <Server className="w-5 h-5 text-blue-400" /> {t('docs.overview.title', 'System Overview')}
        </h3>
        <p>{t('docs.overview.p1', 'HappyGen Studio is a premium frontend workstation designed for AI image generation. It acts as an advanced GUI (Graphical User Interface) that communicates with various external backends and APIs to perform complex ML tasks.')}</p>
        <p>{t('docs.overview.p2', 'The application itself is completely decoupled from the AI inference logic. It is built using React, Vite, and TailwindCSS. It relies entirely on standard REST APIs to communicate with the engine doing the actual heavy lifting.')}</p>
      </section>

      {/* Backend Architecture */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <Cpu className="w-5 h-5 text-green-400" /> {t('docs.backend.title', 'Backend Engine Requirements')}
        </h3>
        <div className="bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-xl p-5">
          <h4 className="font-semibold text-[var(--text-primary)] mb-2">{t('docs.backend.a1111Title', 'AUTOMATIC1111 / Forge / ComfyUI')}</h4>
          <p className="mb-3">{t('docs.backend.a1111Desc', 'HappyGen Studio is designed to connect to any backend server that implements the standard AUTOMATIC1111 (A1111) API specification. This includes the A1111 WebUI itself, SD-WebUI-Forge, or any API-compatible wrapper.')}</p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400">
            <li><strong>{t('docs.backend.localGpu', 'Local GPU:')}</strong> {t('docs.backend.localGpuDesc', 'You can run the backend on your own machine. Make sure to launch your backend with the --api and --cors-allow-origins="*" flags.')}</li>
            <li><strong>{t('docs.backend.cloudGpu', 'Google Colab / Cloud GPU:')}</strong> {t('docs.backend.cloudGpuDesc', 'You can host the backend on a cloud instance and paste the generated public URL (e.g., ngrok or Cloudflare tunnel) into the Studio\'s Backend Settings.')}</li>
          </ul>
        </div>
      </section>

      {/* CivitAI API Integration */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <DownloadCloud className="w-5 h-5 text-orange-400" /> {t('docs.civitai.title', 'CivitAI Model Integration')}
        </h3>
        <p>{t('docs.civitai.desc', 'The Model Explorer tab connects directly to the CivitAI REST API to fetch thousands of community-trained models, LoRAs, and Textual Inversion embeddings.')}</p>
        <div className="bg-orange-500/10 border border-orange-500/20 text-orange-200 rounded-lg p-4">
          <h4 className="font-semibold flex items-center gap-2 mb-1">
            <Key className="w-4 h-4" /> {t('docs.civitai.warningTitle', 'CivitAI API Key Required')}
          </h4>
          <p className="text-xs opacity-90">{t('docs.civitai.warningDesc', 'To download models directly from the Studio into your backend, or to view NSFW models (if 18+ mode is enabled), you must provide a valid CivitAI API Key in the Studio Settings. Without it, downloads will fail due to CivitAI\'s rate limiting and authentication requirements.')}</p>
        </div>
      </section>

      {/* Core Features */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" /> {t('docs.features.title', 'Core Features')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[var(--surface-2)] p-4 rounded-xl border border-[var(--border-subtle)]">
            <h4 className="font-semibold text-[var(--text-primary)] mb-1">{t('docs.features.t2iTitle', 'Text to Image')}</h4>
            <p className="text-xs text-slate-400">{t('docs.features.t2iDesc', 'Generates images from scratch based on a text prompt. Supports infinite LoRA stacking, custom samplers, and CFG scaling.')}</p>
          </div>
          <div className="bg-[var(--surface-2)] p-4 rounded-xl border border-[var(--border-subtle)]">
            <h4 className="font-semibold text-[var(--text-primary)] mb-1">{t('docs.features.i2iTitle', 'Image to Image')}</h4>
            <p className="text-xs text-slate-400">{t('docs.features.i2iDesc', 'Uses a reference image to guide the generation. The Denoising Strength slider controls how much the reference image is altered.')}</p>
          </div>
          <div className="bg-[var(--surface-2)] p-4 rounded-xl border border-[var(--border-subtle)]">
            <h4 className="font-semibold text-[var(--text-primary)] mb-1">{t('docs.features.inpaintTitle', 'Inpainting')}</h4>
            <p className="text-xs text-slate-400">{t('docs.features.inpaintDesc', 'Allows you to draw a mask over a specific part of an image and generate new content only inside the masked area.')}</p>
          </div>
          <div className="bg-[var(--surface-2)] p-4 rounded-xl border border-[var(--border-subtle)]">
            <h4 className="font-semibold text-[var(--text-primary)] mb-1">{t('docs.features.upscaleTitle', 'AI Upscaling & Face Fix')}</h4>
            <p className="text-xs text-slate-400">{t('docs.features.upscaleDesc', 'Uses models like ESRGAN for high-resolution upscaling, and GFPGAN/ADetailer for restoring distorted faces in generated images.')}</p>
          </div>
        </div>
      </section>

      {/* VLM Proxy */}
      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <FileText className="w-5 h-5 text-pink-400" /> {t('docs.vlm.title', 'Interrogation (VLM Proxy)')}
        </h3>
        <p>{t('docs.vlm.desc', 'The "Extract Prompt" (Interrogate) feature uses a Vision Language Model to analyze an uploaded image and extract a descriptive prompt. To protect API secrets, this feature proxies the request through a Vercel Serverless Function which securely authenticates with Google\'s Gemini VLM APIs.')}</p>
      </section>

    </div>
  );
}
