import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Layers, Sliders, Copy, Check, Terminal, 
  Cpu, Zap, Smartphone, Monitor, Shield, ArrowUpRight 
} from 'lucide-react';

const PRESETS = [
  {
    id: 'photo',
    name: 'Cinematic Portrait',
    badge: 'SDXL Realistic',
    image: '/styles/photorealistic.png',
    baseModel: 'Realistic Vision XL v6.0',
    loras: [
      { name: 'CinematicRimLight_v2', weight: 0.8 },
      { name: 'SubsurfaceGlow_v1', weight: 0.55 }
    ],
    prompt: 'masterpiece, 8k portrait of young woman, soft golden hour rim light, 85mm f/1.4 lens, hyperdetailed skin texture, subsurface scattering, cinematic color grading',
    negative: 'bad hands, lowres, distorted anatomy, blurry, plastic skin, oversaturated',
    steps: 32,
    cfg: 6.5,
    sampler: 'DPM++ 2M Karras',
    seed: '849102847',
    speed: '3.4s'
  },
  {
    id: 'cyber',
    name: 'Cyberpunk Mecha',
    badge: 'Sci-Fi Action',
    image: '/styles/cyberpunk.png',
    baseModel: 'Cyberpunk Odyssey XL',
    loras: [
      { name: 'NeonCityReflections_v3', weight: 0.85 },
      { name: 'ExosuitArmorDetails_v2', weight: 0.70 }
    ],
    prompt: 'cyberpunk street samurai in neon rain, volumetric holographic reflections, matte titanium plating, vibrant blue and magenta neon, rain droplets on visor, unreal engine 5 render',
    negative: 'lowres, cartoon, muddy colors, bad proportions, watermark',
    steps: 30,
    cfg: 7.0,
    sampler: 'Euler a',
    seed: '912448102',
    speed: '3.1s'
  },
  {
    id: 'anime',
    name: 'Dark Fantasy Anime',
    badge: 'Animagine XL',
    image: '/styles/anime.png',
    baseModel: 'Animagine XL 3.1',
    loras: [
      { name: 'EtherealAstralGlow_v2', weight: 0.75 },
      { name: 'CrispLineartDetail_v1', weight: 0.50 }
    ],
    prompt: '1girl, celestial sorceress, glowing runic circles, flowing astral hair, ornate gold embroidery, masterpiece anime aesthetic, vivid eyes, ethereal lighting',
    negative: 'worst quality, bad hands, extra limbs, dull colors, jpeg artifacts',
    steps: 28,
    cfg: 6.0,
    sampler: 'DPM++ SDE Karras',
    seed: '571930284',
    speed: '2.9s'
  },
  {
    id: 'fantasy',
    name: 'Concept World',
    badge: 'Juggernaut XL',
    image: '/styles/fantasy.png',
    baseModel: 'Juggernaut XL v9',
    loras: [
      { name: 'EpicScaleAtmosphere', weight: 0.80 }
    ],
    prompt: 'floating crystal monoliths over enchanted ancient valley, bioluminescent waterfalls, misty twilight, cinematic concept art, breathtaking scale, 8k resolution',
    negative: 'foggy blur, bad composition, pixelated, flat lighting',
    steps: 35,
    cfg: 7.5,
    sampler: 'DPM++ 2M Karras',
    seed: '301948211',
    speed: '3.8s'
  }
];

export function InteractiveStudioHero() {
  const [selectedId, setSelectedId] = useState('photo');
  const [copied, setCopied] = useState(false);

  const current = PRESETS.find(p => p.id === selectedId) || PRESETS[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(current.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto my-12">
      {/* Studio Workstation Window Mockup */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/90 backdrop-blur-xl shadow-[0_20px_70px_rgba(0,0,0,0.8)] overflow-hidden">
        
        {/* Workstation Window Top Bar */}
        <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block border border-red-600/40"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block border border-yellow-600/40"></span>
              <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block border border-green-600/40"></span>
            </div>
            <span className="ml-3 font-semibold text-slate-300 hidden sm:inline">HappyGen Studio Workstation v2.0</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Desktop & Mobile Native
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Backend: Connected (Nvidia CUDA / Colab T4)</span>
            </div>
          </div>
        </div>

        {/* Preset Selector Tabs */}
        <div className="px-4 py-2.5 bg-slate-900/50 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-2 hidden md:inline">
            Aesthetic Styles:
          </span>
          {PRESETS.map((preset) => {
            const isActive = preset.id === selectedId;
            return (
              <button
                key={preset.id}
                onClick={() => setSelectedId(preset.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 scale-[1.02]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span>{preset.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${isActive ? 'bg-indigo-700/60 text-indigo-100' : 'bg-slate-800 text-slate-400'}`}>
                  {preset.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Main Workstation Body: 2 Columns */}
        <div className="grid lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          
          {/* Left Canvas: Generated Image Preview */}
          <div className="lg:col-span-7 relative bg-slate-950 flex items-center justify-center p-4 sm:p-6 overflow-hidden min-h-[380px] sm:min-h-[440px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-slate-800 shadow-2xl group"
              >
                <img
                  src={current.image}
                  alt={current.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="eager"
                />

                {/* Live Model Badge on Canvas */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10 pointer-events-none">
                  <span className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-semibold text-white shadow-lg">
                    🧠 {current.baseModel}
                  </span>
                  {current.loras.map(lora => (
                    <span key={lora.name} className="px-2 py-0.5 rounded-md bg-purple-950/80 backdrop-blur-md border border-purple-500/30 text-[10px] font-medium text-purple-200 shadow-lg">
                      🎨 {lora.name} ({lora.weight})
                    </span>
                  ))}
                </div>

                {/* Render Stats Strip */}
                <div className="absolute bottom-3 right-3 z-10 pointer-events-none">
                  <div className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-emerald-400 flex items-center gap-2 shadow-lg">
                    <Zap className="w-3 h-3 text-emerald-400" />
                    <span>Rendered in {current.speed}</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Panel: Active Model Bar & Prompt Inspection */}
          <div className="lg:col-span-5 p-5 sm:p-6 flex flex-col justify-between bg-slate-900/40 text-left">
            <div>
              {/* Active Model Stack */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Active Base Model
                  </span>
                  <span className="text-[11px] font-mono text-indigo-400">CivitAI Verified</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-sm">
                      🧠
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-white truncate">{current.baseModel}</div>
                      <div className="text-[10px] text-slate-400">SDXL 1.0 • 6.46 GB Checkpoint</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stacked LoRAs */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Stacked LoRAs ({current.loras.length})
                  </span>
                  <span className="text-[10px] text-purple-400 font-mono">Dynamic Weights</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {current.loras.map(lora => (
                    <div key={lora.name} className="px-3 py-2 rounded-lg bg-slate-900/70 border border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium truncate max-w-[160px]">{lora.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full" style={{ width: `${lora.weight * 100}%` }}></div>
                        </div>
                        <span className="font-mono text-[11px] text-purple-300">{lora.weight}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prompt Inspection */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Prompt Input
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-indigo-400 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Prompt</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 leading-relaxed max-h-24 overflow-y-auto scrollbar-thin">
                  {current.prompt}
                </div>
              </div>

              {/* Technical Parameters Pill Grid */}
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <span className="text-slate-500 block text-[9px] uppercase">Sampler</span>
                  <span className="text-slate-200 font-semibold">{current.sampler}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <span className="text-slate-500 block text-[9px] uppercase">Steps / CFG</span>
                  <span className="text-slate-200 font-semibold">{current.steps} / {current.cfg}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <span className="text-slate-500 block text-[9px] uppercase">Seed</span>
                  <span className="text-slate-200 font-semibold truncate block">{current.seed}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <span className="text-slate-500 block text-[9px] uppercase">Resolution</span>
                  <span className="text-slate-200 font-semibold">1024 × 1024</span>
                </div>
              </div>
            </div>

            {/* Bottom Workstation Capabilities Footer */}
            <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span>100% Offline & Private Capability</span>
              </span>
              <a href="#download" className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1">
                <span>Download App</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
