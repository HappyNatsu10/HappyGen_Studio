import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layers, Brush, Bell, Video, ShieldCheck, 
  Search, Download, Check, Sparkles, CheckCircle2,
  Lock, Unlock, Fingerprint
} from 'lucide-react';

/* ──────────────────────────────────────────────────────────────
   Exact Bento Grid Feature Showcase matching media_1792512934090.png
   Clean, authentic, high-contrast, zero AI-slop
────────────────────────────────────────────────────────────── */
const CIVITAI_TABS_DATA = {
  Checkpoint: [
    {
      name: 'SDXL Unstable Diffusers v8',
      meta: '1.2M Downloads • Checkpoint',
      badge: 'Active',
      badgeColor: '#fbbf24',
      badgeBg: 'rgba(251, 191, 36, 0.15)',
      badgeBorder: 'rgba(251, 191, 36, 0.45)'
    },
    {
      name: 'DetailSlider_v1',
      meta: '840k Downloads • LoRA (0.60)',
      badge: 'Stacked',
      badgeColor: '#c084fc',
      badgeBg: 'rgba(192, 132, 252, 0.15)',
      badgeBorder: 'rgba(192, 132, 252, 0.45)'
    }
  ],
  LoRA: [
    {
      name: 'CinematicRimLight_v2',
      meta: '640k Downloads • LoRA (0.80)',
      badge: 'Stacked',
      badgeColor: '#c084fc',
      badgeBg: 'rgba(192, 132, 252, 0.15)',
      badgeBorder: 'rgba(192, 132, 252, 0.45)'
    },
    {
      name: 'SubsurfaceGlow_v1',
      meta: '490k Downloads • LoRA (0.55)',
      badge: 'Stacked',
      badgeColor: '#c084fc',
      badgeBg: 'rgba(192, 132, 252, 0.15)',
      badgeBorder: 'rgba(192, 132, 252, 0.45)'
    }
  ],
  Embedding: [
    {
      name: 'FastNegative_SDXL_v2',
      meta: '520k Downloads • Neg. Text',
      badge: 'Active',
      badgeColor: '#fbbf24',
      badgeBg: 'rgba(251, 191, 36, 0.15)',
      badgeBorder: 'rgba(251, 191, 36, 0.45)'
    },
    {
      name: 'BadHandsFix_v5',
      meta: '380k Downloads • Neg. Filter',
      badge: 'Active',
      badgeColor: '#fbbf24',
      badgeBg: 'rgba(251, 191, 36, 0.15)',
      badgeBorder: 'rgba(251, 191, 36, 0.45)'
    }
  ]
};

export function WorkstationBentoGrid() {
  const [activeTab, setActiveTab] = useState('Checkpoint');
  const [denoise, setDenoise] = useState(0.65);
  const [motionBucket, setMotionBucket] = useState(127);
  const [isLocked, setIsLocked] = useState(true);
  const [simulatingBatch, setSimulatingBatch] = useState(false);

  const triggerSimulation = () => {
    if (simulatingBatch) return;
    setSimulatingBatch(true);
    setTimeout(() => setSimulatingBatch(false), 2400);
  };

  return (
    <div className="w-full max-w-[1540px] mx-auto py-12 sm:py-20 lg:py-24 px-3.5 sm:px-6 lg:px-8">
      
      {/* ── Section Header ────────────────────────────────────────── */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
        <div 
          className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-3 sm:mb-4"
          style={{
            color: '#818cf8',
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.28)'
          }}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Studio Feature Architecture</span>
        </div>
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-3 sm:mb-4 leading-tight">
          Every tool you need. <br />
          <span className="text-slate-400 font-extrabold">Built into the local workspace.</span>
        </h2>
        <p className="text-xs sm:text-base text-slate-400 leading-relaxed px-2">
          From the integrated CivitAI model repository to hardware-accelerated inpainting and biometric vaults.
        </p>
      </div>

      {/* ── Bento Grid: Exact Layout matching media_1792512934090.png ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-left">
        
        {/* ══════════════════════════════════════════════
            CARD 1 (TOP LEFT, SPAN 2 COLS):
            CivitAI Model Explorer & Instant Downloader
        ══════════════════════════════════════════════ */}
        <div 
          className="md:col-span-2 rounded-[20px] sm:rounded-[24px] p-4 sm:p-7 lg:p-8 flex flex-col justify-between transition-all duration-300 hover:border-indigo-500/40"
          style={{
            background: '#070914',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.7)'
          }}
        >
          <div>
            {/* Top Badge & Count */}
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <span 
                className="px-2.5 py-0.5 sm:px-3.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold"
                style={{
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.35)',
                  color: '#a5b4fc'
                }}
              >
                CivitAI Live Integration
              </span>
              <span className="text-[11px] sm:text-xs font-mono text-slate-400">
                50,000+ Models
              </span>
            </div>

            {/* Title & Description */}
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white mb-2 sm:mb-2.5 tracking-tight">
              CivitAI Model Explorer & Instant Downloader
            </h3>
            <p className="text-xs sm:text-sm lg:text-base text-slate-400 leading-relaxed mb-4 sm:mb-6">
              Search, filter, and inspect base models, LoRAs, and embeddings directly from the CivitAI ecosystem without ever leaving the app. Click to set active base model or stack with single-click ease.
            </p>
          </div>

          {/* Inner Interactive Card */}
          <div 
            className="rounded-xl sm:rounded-2xl p-3 sm:p-5"
            style={{
              background: '#0c1022',
              border: '1px solid rgba(255, 255, 255, 0.07)'
            }}
          >
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4 overflow-x-auto no-scrollbar pb-0.5">
              {['Checkpoint', 'LoRA', 'Embedding'].map(tab => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex-shrink-0"
                    style={{
                      background: isActive ? '#5542f6' : '#141834',
                      color: isActive ? '#ffffff' : '#94a3b8',
                      boxShadow: isActive ? '0 4px 14px rgba(85, 66, 246, 0.4)' : 'none'
                    }}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Models Rows */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {CIVITAI_TABS_DATA[activeTab].map((item, idx) => (
                <div 
                  key={idx}
                  className="p-3 sm:p-3.5 rounded-xl flex items-center justify-between gap-2.5 sm:gap-3 transition-colors"
                  style={{
                    background: '#080b18',
                    border: '1px solid rgba(255, 255, 255, 0.06)'
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs sm:text-sm font-bold text-white truncate">
                      {item.name}
                    </div>
                    <div className="text-[10px] sm:text-[11px] font-mono text-slate-400 truncate mt-0.5">
                      {item.meta}
                    </div>
                  </div>

                  <span 
                    className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-md text-[11px] sm:text-xs font-mono font-bold flex-shrink-0"
                    style={{
                      color: item.badgeColor,
                      background: item.badgeBg,
                      border: `1px solid ${item.badgeBorder}`
                    }}
                  >
                    {item.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            CARD 2 (TOP RIGHT, SPAN 1 COL):
            Minimize & Keep Generating (Background Tasks)
        ══════════════════════════════════════════════ */}
        <div 
          className="md:col-span-1 rounded-[20px] sm:rounded-[24px] p-4 sm:p-7 lg:p-8 flex flex-col justify-between transition-all duration-300 hover:border-emerald-500/40"
          style={{
            background: '#070914',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.7)'
          }}
        >
          <div>
            {/* Top Badge */}
            <div className="mb-3 sm:mb-4">
              <span 
                className="inline-flex items-center gap-1.5 px-3 py-0.5 sm:px-3.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold"
                style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  color: '#34d399'
                }}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Background Tasks</span>
              </span>
            </div>

            {/* Title & Description */}
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white mb-2 sm:mb-2.5 tracking-tight">
              Minimize & Keep Generating
            </h3>
            <p className="text-xs sm:text-sm lg:text-base text-slate-400 leading-relaxed mb-4 sm:mb-6">
              Batch renders continue silently in the background on Desktop and Mobile. Native push notifications alert you the instant your images are ready.
            </p>
          </div>

          {/* Inner Notification Card */}
          <div 
            onClick={triggerSimulation}
            className="rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center gap-3 cursor-pointer transition-all duration-200 hover:scale-[1.02]"
            style={{
              background: '#0c1022',
              border: simulatingBatch ? '1px solid rgba(52, 211, 153, 0.6)' : '1px solid rgba(52, 211, 153, 0.25)'
            }}
            title="Click to simulate notification"
          >
            <div 
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-base sm:text-lg flex-shrink-0"
              style={{
                background: 'rgba(52, 211, 153, 0.15)',
                border: '1px solid rgba(52, 211, 153, 0.3)'
              }}
            >
              🔔
            </div>
            
            <div className="min-w-0 flex-1">
              <div className="text-xs sm:text-sm font-bold text-white flex items-center justify-between">
                <span>{simulatingBatch ? 'Rendering Batch 2/4...' : 'Generation Complete!'}</span>
                {simulatingBatch && <span className="text-[10px] text-emerald-400 font-mono animate-pulse">Running</span>}
              </div>
              <div className="text-[11px] sm:text-xs font-mono text-slate-400 truncate mt-0.5">
                {simulatingBatch ? 'Colab & Kaggle Cloud GPU • 2.1s remaining' : '"Cyberpunk Samurai" rendered in 3.4s'}
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            CARD 3 (BOTTOM LEFT, SPAN 1 COL):
            Inpaint & Infinite Canvas
        ══════════════════════════════════════════════ */}
        <div 
          className="md:col-span-1 rounded-[20px] sm:rounded-[24px] p-4 sm:p-7 lg:p-8 flex flex-col justify-between transition-all duration-300 hover:border-cyan-500/40"
          style={{
            background: '#070914',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.7)'
          }}
        >
          <div>
            {/* Top Badge */}
            <div className="mb-3 sm:mb-4">
              <span 
                className="inline-flex items-center gap-1.5 px-3 py-0.5 sm:px-3.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold"
                style={{
                  background: 'rgba(56, 189, 248, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  color: '#38bdf8'
                }}
              >
                <Brush className="w-3.5 h-3.5" />
                <span>Canvas Studio</span>
              </span>
            </div>

            {/* Title & Description */}
            <h3 className="text-xl sm:text-2xl font-black text-white mb-2 sm:mb-2.5 tracking-tight">
              Inpaint & Infinite Canvas
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4 sm:mb-6">
              Brush over any region to swap faces, fix hands, or add new elements with feathered edge-blending and prompt guidance.
            </p>
          </div>

          {/* Inner Control Bar */}
          <div 
            className="rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center justify-between"
            style={{
              background: '#0c1022',
              border: '1px solid rgba(255, 255, 255, 0.07)'
            }}
          >
            <span className="text-xs font-mono font-medium text-slate-300">
              Denoising Strength
            </span>
            <span 
              className="text-xs font-mono font-bold"
              style={{ color: '#38bdf8' }}
            >
              0.65 (Balanced)
            </span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            CARD 4 (BOTTOM CENTER, SPAN 1 COL):
            Image-to-Video Animation
        ══════════════════════════════════════════════ */}
        <div 
          className="md:col-span-1 rounded-[20px] sm:rounded-[24px] p-4 sm:p-7 lg:p-8 flex flex-col justify-between transition-all duration-300 hover:border-amber-500/40"
          style={{
            background: '#070914',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.7)'
          }}
        >
          <div>
            {/* Top Badge */}
            <div className="mb-3 sm:mb-4">
              <span 
                className="inline-flex items-center gap-1.5 px-3 py-0.5 sm:px-3.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold"
                style={{
                  background: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  color: '#fbbf24'
                }}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Motion Studio</span>
              </span>
            </div>

            {/* Title & Description */}
            <h3 className="text-xl sm:text-2xl font-black text-white mb-2 sm:mb-2.5 tracking-tight">
              Image-to-Video Animation
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4 sm:mb-6">
              Turn still concept art into fluid cinematic animations using Stable Video Diffusion and motion interpolation.
            </p>
          </div>

          {/* Inner Control Bar */}
          <div 
            className="rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center justify-between"
            style={{
              background: '#0c1022',
              border: '1px solid rgba(255, 255, 255, 0.07)'
            }}
          >
            <span className="text-xs font-mono font-medium text-slate-300">
              Motion Bucket ID
            </span>
            <span 
              className="text-xs font-mono font-bold"
              style={{ color: '#fbbf24' }}
            >
              127 • 25 FPS
            </span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            CARD 5 (BOTTOM RIGHT, SPAN 1 COL):
            Native Biometric Vault
        ══════════════════════════════════════════════ */}
        <div 
          className="md:col-span-1 rounded-[20px] sm:rounded-[24px] p-4 sm:p-7 lg:p-8 flex flex-col justify-between transition-all duration-300 hover:border-purple-500/40"
          style={{
            background: '#070914',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.7)'
          }}
        >
          <div>
            {/* Top Badge */}
            <div className="mb-3 sm:mb-4">
              <span 
                className="inline-flex items-center gap-1.5 px-3 py-0.5 sm:px-3.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold"
                style={{
                  background: 'rgba(192, 132, 252, 0.12)',
                  border: '1px solid rgba(192, 132, 252, 0.35)',
                  color: '#c084fc'
                }}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Local Privacy</span>
              </span>
            </div>

            {/* Title & Description */}
            <h3 className="text-xl sm:text-2xl font-black text-white mb-2 sm:mb-2.5 tracking-tight">
              Native Biometric Vault
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4 sm:mb-6">
              Secure your private project folders and confidential creations with native Face ID and Fingerprint hardware security.
            </p>
          </div>

          {/* Inner Control Bar */}
          <div 
            className="rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center justify-between"
            style={{
              background: '#0c1022',
              border: '1px solid rgba(255, 255, 255, 0.07)'
            }}
          >
            <span className="text-xs font-mono font-medium text-slate-300">
              Biometric Lock
            </span>
            <span 
              className="text-xs font-mono font-bold"
              style={{ color: '#c084fc' }}
            >
              Face ID / Touch ID
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
