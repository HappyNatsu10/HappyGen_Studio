import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Layers, Brush, Bell, Video, Cpu, ShieldCheck, 
  Search, Download, Play, CheckCircle2, Sparkles, Smartphone, Eye 
} from 'lucide-react';

export function WorkstationBentoGrid() {
  const [activeModelTab, setActiveModelTab] = useState('Checkpoint');
  const [videoPlaying, setVideoPlaying] = useState(true);

  return (
    <div className="w-full max-w-6xl mx-auto my-20 px-4 sm:px-6">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 mb-4">
          <Layers className="w-3.5 h-3.5" />
          <span>Workstation Architecture</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight">
          Engineered for Creators. <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
            Uncompromising Native Performance.
          </span>
        </h2>
        <p className="text-base sm:text-lg text-slate-400">
          Everything you need to conceptualize, generate, refine, and animate professional AI media in one cohesive workstation.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid md:grid-cols-3 gap-6">

        {/* Card 1: CivitAI Live Model Explorer (Span 2 cols) */}
        <div className="md:col-span-2 p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-950/70 backdrop-blur-xl flex flex-col justify-between relative overflow-hidden group hover:border-indigo-500/40 transition-all duration-300 text-left">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
                CivitAI Live Integration
              </span>
              <span className="text-xs font-mono text-slate-500">50,000+ Models</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">CivitAI Model Explorer & Instant Downloader</h3>
            <p className="text-sm text-slate-400 max-w-lg mb-6 leading-relaxed">
              Search, filter, and inspect base models, LoRAs, and embeddings directly from the CivitAI ecosystem without ever leaving the app. Click to set active base model or stack with single-click ease.
            </p>

            {/* Interactive Model Card Simulation */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-inner">
              <div className="flex items-center gap-2 mb-3">
                {['Checkpoint', 'LoRA', 'Embedding'].map(t => (
                  <button
                    key={t}
                    onClick={() => setActiveModelTab(t)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      activeModelTab === t ? 'bg-indigo-600 text-white' : 'bg-slate-800/80 text-slate-400 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="truncate pr-2">
                    <div className="font-bold text-white truncate">SDXL Unstable Diffusers v8</div>
                    <div className="text-[10px] text-slate-400">1.2M Downloads • Checkpoint</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20">Active</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="truncate pr-2">
                    <div className="font-bold text-white truncate">DetailSlider_v1</div>
                    <div className="text-[10px] text-slate-400">840k Downloads • LoRA (0.60)</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20">Stacked</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Background Tasks & Push Notifications (1 col) */}
        <div className="p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-950/70 backdrop-blur-xl flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300 text-left">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5" />
                <span>Background Tasks</span>
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Minimize & Keep Generating</h3>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Batch renders continue silently in the background on Desktop and Mobile. Native push notifications alert you the instant your images are ready.
            </p>

            {/* Simulated Notification Toast */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-emerald-500/30 shadow-xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-sm">
                🔔
              </div>
              <div className="flex-1 text-xs">
                <div className="font-bold text-white">Generation Complete!</div>
                <div className="text-[11px] text-slate-400">"Cyberpunk Samurai" rendered in 3.4s</div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Inpainting & Infinite Canvas (1 col) */}
        <div className="p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-950/70 backdrop-blur-xl flex flex-col justify-between relative overflow-hidden group hover:border-blue-500/40 transition-all duration-300 text-left">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/15 border border-blue-500/30 text-blue-300 flex items-center gap-1.5">
                <Brush className="w-3.5 h-3.5" />
                <span>Canvas Studio</span>
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Inpaint & Infinite Canvas</h3>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed">
              Brush over any region to swap faces, fix hands, or add new elements with feathered edge-blending and prompt guidance.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between">
            <span>Denoising Strength</span>
            <span className="text-blue-400 font-bold">0.65 (Balanced)</span>
          </div>
        </div>

        {/* Card 4: Video Generation Studio (1 col) */}
        <div className="p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-950/70 backdrop-blur-xl flex flex-col justify-between relative overflow-hidden group hover:border-amber-500/40 transition-all duration-300 text-left">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5" />
                <span>Motion Studio</span>
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Image-to-Video Animation</h3>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed">
              Turn still concept art into fluid cinematic animations using Stable Video Diffusion and motion interpolation.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between">
            <span>Motion Bucket ID</span>
            <span className="text-amber-400 font-bold">127 • 25 FPS</span>
          </div>
        </div>

        {/* Card 5: Biometric Vault & Local Storage (1 col) */}
        <div className="p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-950/70 backdrop-blur-xl flex flex-col justify-between relative overflow-hidden group hover:border-purple-500/40 transition-all duration-300 text-left">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/15 border border-purple-500/30 text-purple-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Local Privacy</span>
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Native Biometric Vault</h3>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed">
              Secure your private project folders and confidential creations with native Face ID and Fingerprint hardware security.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between">
            <span>Biometric Lock</span>
            <span className="text-purple-400 font-bold">Face ID / Touch ID</span>
          </div>
        </div>

      </div>
    </div>
  );
}
