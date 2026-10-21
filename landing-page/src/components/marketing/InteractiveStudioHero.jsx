import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Image as ImageIcon, Video, Brush, Layers, FolderOpen, Settings,
  Sparkles, Download, Copy, Check, Server, Maximize2, ImagePlus,
  RefreshCw, Plus, X, ChevronDown, User, ChevronLeft, Sliders,
  HelpCircle, Sun, Moon, Smartphone, Monitor
} from 'lucide-react';

/* ──────────────────────────────────────────────────────────────
   Real Studio Presets matching UI-white.png & actual HappyGen
────────────────────────────────────────────────────────────── */
const STUDIO_PRESETS = [
  {
    id: 'schoolgirl',
    label: 'Anime High-Res',
    loraName: 'xipa Style - ANI/SchoolLife_v2',
    loraThumb: '/studio/anime-schoolgirl.jpg',
    defaultWeight: 0.80,
    image: '/studio/anime-schoolgirl.jpg',
    prompt: 'breasts, collared shirt, indoors, medium hair, grin, sweater, open jacket, blue skirt, black pantyhose, window, chair, blazer, blue jacket, side braid, desk, sweater vest, waving, classroom, school desk, green necktie, school chair, side view',
    negative: 'lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark',
    dimensions: '896×1152',
    seed: '1907752235',
    backend: 'Google Colab Cloud GPU (NVIDIA Tesla T4)'
  },
  {
    id: 'cheongsam',
    label: 'Silk Cheongsam',
    loraName: 'Traditional Silk Cheongsam v3',
    loraThumb: '/studio/anime-cheongsam.jpg',
    defaultWeight: 0.85,
    image: '/studio/anime-cheongsam.jpg',
    prompt: 'masterpiece, ultra-detailed, 1girl, elegant young woman, white silk cheongsam qipao with crimson floral embroidery, natural courtyard window lighting, vintage carved rosewood armchair',
    negative: 'lowres, bad anatomy, bad hands, text, error, missing fingers, cropped, worst quality, low quality',
    dimensions: '896×1152',
    seed: '918274019',
    backend: 'Kaggle Dual Cloud GPU (2x Tesla T4 • 30GB)'
  }
];

export function InteractiveStudioHero() {
  const [isDark, setIsDark] = useState(false); // Default to White Theme as requested!
  const [deviceMode, setDeviceMode] = useState('desktop');
  const [selectedPresetId, setSelectedPresetId] = useState('schoolgirl');
  const [loraWeight, setLoraWeight] = useState(0.80);
  const [batchSize, setBatchSize] = useState(2);
  const [activeNav, setActiveNav] = useState('generate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedSeed, setCopiedSeed] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

  // Automatically default to mobile view on small screens/phones
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMobileScreen = window.innerWidth < 1024;
      setDeviceMode(isMobileScreen ? 'mobile' : 'desktop');
    }
  }, []);

  const current = STUDIO_PRESETS.find(p => p.id === selectedPresetId) || STUDIO_PRESETS[0];

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(customPrompt || current.prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 1800);
  };

  const handleCopySeed = () => {
    navigator.clipboard.writeText(current.seed);
    setCopiedSeed(true);
    setTimeout(() => setCopiedSeed(false), 1800);
  };

  const handleGenerate = () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 1200);
  };

  const addTag = (tag) => {
    const base = customPrompt || current.prompt;
    if (!base.includes(tag)) {
      setCustomPrompt(`${base}, ${tag}`);
    }
  };

  // Color tokens based on theme
  const theme = isDark ? {
    windowBg: '#0B0B1A',
    topBarBg: '#0e1022',
    sidebarBg: '#0B0B1A',
    workspaceBg: '#050511',
    cardBg: '#0B0B1A',
    cardInner: '#14142B',
    border: 'rgba(255, 255, 255, 0.08)',
    borderSubtle: 'rgba(255, 255, 255, 0.05)',
    textPrimary: '#ffffff',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    inputBg: '#050511',
    tagBg: '#14142B',
    tagText: '#94a3b8',
    activeNavBg: '#1F1F3D',
    activeNavText: '#a855f7',
    canvasBg: '#05060f'
  } : {
    windowBg: '#ffffff',
    topBarBg: '#ffffff',
    sidebarBg: '#ffffff',
    workspaceBg: '#f8fafc',
    cardBg: '#ffffff',
    cardInner: '#f8fafc',
    border: '#e2e8f0',
    borderSubtle: '#f1f5f9',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    inputBg: '#f8fafc',
    tagBg: '#f1f5f9',
    tagText: '#475569',
    activeNavBg: '#f3f0ff',
    activeNavText: '#7c3aed',
    canvasBg: '#f8fafc'
  };

  // Mobile Bottom Tab Bar Items (Matching actual HappyGen Studio MobileTabBar)
  const MOBILE_TABS = [
    { id: 'generate', label: 'Create', icon: ImageIcon },
    { id: 'video', label: 'Video', icon: Video },
    { id: 'inpaint', label: 'Inpaint', icon: Brush },
    { id: 'models', label: 'Explore', icon: Layers },
    { id: 'gallery', label: 'Gallery', icon: FolderOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  /* ──────────────────────────────────────────────────────────
     Reusable Generator Controls (Prompt, LoRA, Seed, Button)
  ────────────────────────────────────────────────────────── */
  const renderGeneratorControls = (isCompact = false) => (
    <div className="flex flex-col gap-3 sm:gap-3.5">
      {/* 1. Active LoRA Card */}
      <div 
        className="p-3 sm:p-3.5 rounded-xl border flex flex-col gap-2.5 transition-colors"
        style={{ background: theme.cardInner, borderColor: theme.border }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-xs" style={{ color: theme.textPrimary }}>
            <Layers className="w-3.5 h-3.5 text-purple-600" />
            <span>Active LoRAs (1)</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">CivitAI</span>
        </div>

        <div className="p-2 sm:p-2.5 rounded-lg border bg-white dark:bg-[#0B0B1A] flex flex-col gap-2 shadow-2xs" style={{ borderColor: theme.border }}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <img src={current.loraThumb} alt="LoRA thumb" className="w-7 h-7 sm:w-8 sm:h-8 rounded-md object-cover flex-shrink-0" />
              <div className="truncate text-xs font-semibold" style={{ color: theme.textPrimary }}>
                {current.loraName}
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-purple-600">{loraWeight.toFixed(2)}</span>
          </div>

          <input
            type="range"
            min="0"
            max="1.5"
            step="0.05"
            value={loraWeight}
            onChange={e => setLoraWeight(parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
        </div>
      </div>

      {/* 2. Prompt Area */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <label className="font-bold" style={{ color: theme.textPrimary }}>Prompt</label>
          <button 
            onClick={handleCopyPrompt}
            className="flex items-center gap-1 text-[11px] font-semibold text-purple-600 hover:text-purple-700 cursor-pointer"
          >
            {copiedPrompt ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            <span>{copiedPrompt ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <textarea
          value={customPrompt || current.prompt}
          onChange={e => setCustomPrompt(e.target.value)}
          rows={isCompact ? 3 : 4}
          className="w-full p-2.5 sm:p-3 rounded-xl text-xs font-mono leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
          style={{
            background: theme.inputBg,
            border: `1px solid ${theme.border}`,
            color: theme.textPrimary
          }}
        />

        {/* Quick Tags */}
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <span className="text-[10px] text-slate-400 font-semibold">Tags:</span>
          {['1girl', 'masterpiece', 'cinematic lighting', 'detailed eyes', 'smile'].map(tag => (
            <button
              key={tag}
              onClick={() => addTag(tag)}
              className="text-[10px] px-2 py-0.5 rounded-md font-medium transition-all cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/40 hover:text-purple-600"
              style={{ background: theme.tagBg, color: theme.tagText }}
            >
              +{tag}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Negative Prompt (Collapsible on mobile) */}
      <div className="space-y-1">
        <label className="text-xs font-bold" style={{ color: theme.textPrimary }}>Negative Prompt</label>
        <div 
          className="w-full p-2 rounded-xl text-[10px] sm:text-[11px] font-mono leading-relaxed max-h-14 overflow-y-auto"
          style={{
            background: theme.inputBg,
            border: `1px solid ${theme.border}`,
            color: theme.textMuted
          }}
        >
          {current.negative}
        </div>
      </div>

      {/* 4. Batch Size Slider */}
      <div className="space-y-1 pt-0.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold" style={{ color: theme.textPrimary }}>Batch Count</span>
          <span className="font-mono text-purple-600 font-bold">{batchSize}</span>
        </div>
        <input
          type="range"
          min="1"
          max="4"
          step="1"
          value={batchSize}
          onChange={e => setBatchSize(parseInt(e.target.value))}
          className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
        />
      </div>

      {/* 5. Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-bold tracking-wide text-white flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-600/25 transition-all hover:brightness-105 active:scale-[0.99]"
        style={{ background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)' }}
      >
        {isGenerating ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin text-white" />
            <span>Generating with Cloud GPU...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-white" />
            <span>Generate Artwork</span>
          </>
        )}
      </button>
    </div>
  );

  /* ──────────────────────────────────────────────────────────
     Artwork Display Stage (Canvas with Image & Metadata)
  ────────────────────────────────────────────────────────── */
  const renderCanvasOutput = (isCompact = false) => (
    <div 
      className="relative rounded-[18px] sm:rounded-[22px] border overflow-hidden flex flex-col justify-between group shadow-sm transition-colors w-full"
      style={{ background: theme.cardBg, borderColor: theme.border }}
    >
      <div 
        className={`relative flex items-center justify-center p-3 sm:p-4 overflow-hidden ${
          isCompact ? 'min-h-[280px]' : 'min-h-[340px] lg:min-h-[460px]'
        }`}
        style={{ background: theme.canvasBg }}
      >
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div 
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center gap-3 py-12 sm:py-20 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-purple-600 animate-spin" />
              </div>
              <div className="text-xs sm:text-sm font-bold" style={{ color: theme.textPrimary }}>
                Rendering Latent Diffusion...
              </div>
              <div className="text-[10px] sm:text-xs font-mono text-slate-400">
                {current.backend}
              </div>
            </motion.div>
          ) : (
            <motion.img
              key={current.id}
              src={current.image}
              alt="HappyGen Output"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className={`rounded-xl object-contain shadow-md ${
                isCompact ? 'max-h-[300px]' : 'max-h-[380px] lg:max-h-[500px]'
              }`}
            />
          )}
        </AnimatePresence>

        {/* Hover Action Pill */}
        {!isGenerating && (
          <div 
            className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-xl backdrop-blur-md z-10"
            style={{
              background: isDark ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.96)',
              borderColor: theme.border
            }}
          >
            <button 
              onClick={() => alert(`Full Resolution Preview: ${current.dimensions}`)}
              className="p-1 rounded-full text-slate-600 dark:text-slate-300 hover:text-purple-600 transition-colors cursor-pointer"
              title="Full Resolution"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-3 bg-slate-300 dark:bg-white/15" />
            <button 
              onClick={() => alert('Download PNG')}
              className="p-1 rounded-full text-slate-600 dark:text-slate-300 hover:text-purple-600 transition-colors cursor-pointer"
              title="Download"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => alert('Upscaling 4K...')}
              className="p-1 rounded-full text-purple-600 transition-colors cursor-pointer"
              title="Upscale 4K"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Metadata strip */}
      <div 
        className="px-3 sm:px-4 py-2 sm:py-2.5 border-t flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-xs font-mono text-slate-500"
        style={{ background: theme.cardBg, borderColor: theme.border }}
      >
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700 dark:text-slate-200">{current.dimensions}</span>
          <span>•</span>
          <button onClick={handleCopySeed} className="flex items-center gap-1 hover:text-purple-600 cursor-pointer">
            <span>Seed: {current.seed}</span>
            {copiedSeed ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-slate-400" />}
          </button>
        </div>
        <span className="text-purple-600 font-semibold truncate max-w-[220px]">{current.backend}</span>
      </div>
    </div>
  );

  return (
    <div className="relative w-full max-w-[1560px] mx-auto px-2 sm:px-4">

      {/* ── Experience Mode Selector & Style Presets Bar ────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 w-full">
        {/* Device View Toggle (Mobile App vs Desktop Workstation) */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <span className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
            Experience:
          </span>
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-900/80 dark:bg-white/10 border border-slate-800 dark:border-white/10">
            <button
              onClick={() => setDeviceMode('mobile')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                deviceMode === 'mobile'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile App</span>
            </button>
            <button
              onClick={() => setDeviceMode('desktop')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                deviceMode === 'desktop'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop Workstation</span>
            </button>
          </div>
        </div>

        {/* Style Presets */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-400 hidden sm:inline">Presets:</span>
          {STUDIO_PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => {
                setSelectedPresetId(preset.id);
                setLoraWeight(preset.defaultWeight);
                setCustomPrompt('');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedPresetId === preset.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          VIEW 1: AUTHENTIC MOBILE APP EXPERIENCE
          (Zero Mac traffic lights, no desktop sidebar, true mobile tab bar)
      ══════════════════════════════════════════════════════════════════ */}
      {deviceMode === 'mobile' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-[440px] mx-auto rounded-[32px] sm:rounded-[38px] border-4 border-slate-800/80 shadow-2xl overflow-hidden flex flex-col relative"
          style={{ background: theme.windowBg }}
        >
          {/* Phone Dynamic Island / Notch */}
          <div className="h-6 bg-slate-900 text-white px-5 flex items-center justify-between text-[10px] font-semibold flex-shrink-0">
            <span>9:41</span>
            <div className="w-20 h-3.5 bg-black rounded-full" />
            <div className="flex items-center gap-1">
              <span>5G</span>
              <div className="w-3.5 h-2 border border-white/70 rounded-2xs flex items-center p-0.5">
                <div className="w-full h-full bg-white rounded-3xs" />
              </div>
            </div>
          </div>

          {/* Authentic Mobile TopBar (Matches HappyGen Studio TopBar.jsx) */}
          <div 
            className="h-12 px-3.5 flex items-center justify-between border-b flex-shrink-0"
            style={{ background: theme.topBarBg, borderColor: theme.border }}
          >
            <div className="flex items-center gap-1.5">
              <img src="/logo.png" alt="HappyGen" className="w-5 h-5 object-contain" />
              <span className="text-xs font-bold" style={{ color: theme.textPrimary }}>HappyGen</span>
              <span className="text-slate-400 text-xs">/</span>
              <span className="text-xs font-bold text-purple-600">Create</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDark(!isDark)}
                className="p-1 rounded-md border text-[10px] cursor-pointer"
                style={{ background: theme.cardInner, borderColor: theme.border, color: theme.textSecondary }}
                title="Toggle Theme"
              >
                {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
              </button>

              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Connected</span>
              </div>

              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-white text-[10px] font-bold flex items-center justify-center">
                HN
              </div>
            </div>
          </div>

          {/* Mobile Scrollable Viewport (Generator + Canvas) */}
          <div 
            className="p-3 sm:p-4 space-y-4 max-h-[580px] overflow-y-auto custom-scrollbar"
            style={{ background: theme.workspaceBg }}
          >
            {/* Generator Card */}
            <div 
              className="p-3.5 rounded-2xl border shadow-xs"
              style={{ background: theme.cardBg, borderColor: theme.border }}
            >
              {renderGeneratorControls(true)}
            </div>

            {/* Generated Canvas Card */}
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">
                Generated Artwork
              </div>
              {renderCanvasOutput(true)}
            </div>
          </div>

          {/* Authentic Mobile Bottom Tab Bar (Matches MobileTabBar.jsx!) */}
          <div 
            className="h-14 border-t flex items-center justify-around px-1 flex-shrink-0"
            style={{ background: theme.topBarBg, borderColor: theme.border }}
          >
            {MOBILE_TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = tab.id === 'generate';
              return (
                <div 
                  key={tab.id}
                  className="flex flex-col items-center justify-center flex-1 h-full relative cursor-pointer"
                  style={{ color: isActive ? '#7c3aed' : theme.textMuted }}
                >
                  {isActive && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-b-full bg-gradient-to-r from-purple-600 to-indigo-600" />
                  )}
                  <Icon className={`w-4 h-4 ${isActive ? 'scale-110 text-purple-600' : ''}`} />
                  <span className="text-[9px] font-semibold mt-0.5">{tab.label}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          VIEW 2: DESKTOP WORKSTATION EXPERIENCE
          (Mac window title bar, desktop left sidebar, side-by-side workspace)
      ══════════════════════════════════════════════════════════════════ */}
      {deviceMode === 'desktop' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full rounded-[18px] sm:rounded-[24px] overflow-hidden select-none text-left transition-colors duration-200 shadow-2xl"
          style={{
            background: theme.windowBg,
            border: `1px solid ${theme.border}`,
            boxShadow: isDark 
              ? '0 30px 100px -15px rgba(0, 0, 0, 0.95), 0 0 40px -10px rgba(99, 102, 241, 0.12)' 
              : '0 25px 70px -12px rgba(15, 23, 42, 0.12), 0 0 30px -5px rgba(124, 58, 237, 0.06)'
          }}
        >
          {/* Desktop TopBar */}
          <div 
            className="h-12 sm:h-14 px-3 sm:px-5 flex items-center justify-between border-b transition-colors gap-2"
            style={{ background: theme.topBarBg, borderColor: theme.border }}
          >
            {/* Left: Traffic Lights & Title */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <div className="flex items-center gap-1.5 mr-1 flex-shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
              </div>

              <div className="flex items-center gap-2 truncate">
                <img src="/logo.png" alt="HappyGen" className="w-5 h-5 sm:w-6 sm:h-6 object-contain flex-shrink-0" />
                <span className="text-xs sm:text-sm font-bold tracking-tight truncate" style={{ color: theme.textPrimary }}>
                  HappyGen <span className="font-normal text-slate-400 text-xs">v2</span>
                </span>
              </div>

              <div className="h-3.5 w-px bg-slate-300 dark:bg-slate-700 hidden sm:block flex-shrink-0" />
              <span className="text-xs sm:text-sm font-bold hidden sm:inline flex-shrink-0" style={{ color: theme.textPrimary }}>
                Create
              </span>
            </div>

            {/* Announcement Banner */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/40 text-purple-700 dark:text-purple-300">
              <span>🚀 More base models and advanced Video Suite are live. Free Cloud GPUs ready.</span>
            </div>

            {/* Right: Theme Toggle, Connection & Profile */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <button
                onClick={() => setIsDark(!isDark)}
                className="p-1 sm:p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                style={{ background: theme.cardInner, borderColor: theme.border, color: theme.textSecondary }}
                title="Toggle Theme"
              >
                {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
                <span className="hidden sm:inline text-[11px]">{isDark ? 'Dark' : 'White'}</span>
              </button>

              <div 
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
                style={{
                  background: isDark ? 'rgba(52, 211, 153, 0.1)' : '#f0fdf4',
                  border: isDark ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid #bbf7d0',
                  color: '#16a34a'
                }}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                <span className="font-semibold text-[11px]">Connected</span>
              </div>

              <div 
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center font-bold text-xs"
                style={{ background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)', color: '#ffffff', borderColor: theme.border }}
              >
                HN
              </div>
            </div>
          </div>

          {/* Desktop Body: Left Sidebar + Main Workspace */}
          <div className="flex flex-col lg:flex-row w-full min-h-[580px] lg:min-h-[640px]">
            {/* Desktop Left Sidebar */}
            <div 
              className="hidden lg:flex flex-col w-[190px] border-r flex-shrink-0 py-4 px-2.5 justify-between"
              style={{ background: theme.sidebarBg, borderColor: theme.border }}
            >
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">CREATE</div>
                  <button
                    onClick={() => setActiveNav('generate')}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    style={{
                      background: activeNav === 'generate' ? theme.activeNavBg : 'transparent',
                      color: activeNav === 'generate' ? theme.activeNavText : theme.textSecondary
                    }}
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Generate</span>
                  </button>
                  <button
                    onClick={() => setActiveNav('video')}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-all cursor-pointer"
                    style={{
                      background: activeNav === 'video' ? theme.activeNavBg : 'transparent',
                      color: activeNav === 'video' ? theme.activeNavText : theme.textSecondary
                    }}
                  >
                    <Video className="w-4 h-4" />
                    <span>Video Suite</span>
                  </button>
                  <button
                    onClick={() => setActiveNav('inpaint')}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-all cursor-pointer"
                    style={{
                      background: activeNav === 'inpaint' ? theme.activeNavBg : 'transparent',
                      color: activeNav === 'inpaint' ? theme.activeNavText : theme.textSecondary
                    }}
                  >
                    <Brush className="w-4 h-4" />
                    <span>Inpaint Studio</span>
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">DISCOVER</div>
                  <button
                    onClick={() => setActiveNav('models')}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-all cursor-pointer"
                    style={{
                      background: activeNav === 'models' ? theme.activeNavBg : 'transparent',
                      color: activeNav === 'models' ? theme.activeNavText : theme.textSecondary
                    }}
                  >
                    <Layers className="w-4 h-4" />
                    <span>Model Explorer</span>
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">LIBRARY</div>
                  <button
                    onClick={() => setActiveNav('gallery')}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-all cursor-pointer"
                    style={{
                      background: activeNav === 'gallery' ? theme.activeNavBg : 'transparent',
                      color: activeNav === 'gallery' ? theme.activeNavText : theme.textSecondary
                    }}
                  >
                    <FolderOpen className="w-4 h-4" />
                    <span>Gallery</span>
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">SYSTEM</div>
                  <button
                    onClick={() => setActiveNav('settings')}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-all cursor-pointer"
                    style={{
                      background: activeNav === 'settings' ? theme.activeNavBg : 'transparent',
                      color: activeNav === 'settings' ? theme.activeNavText : theme.textSecondary
                    }}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                </div>
              </div>

              {/* Bottom Profile Pill */}
              <div 
                className="p-2 rounded-xl border flex items-center justify-between"
                style={{ background: theme.cardInner, borderColor: theme.border }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-white text-[10px] font-bold flex items-center justify-center">
                    HN
                  </div>
                  <div className="text-[11px] font-semibold truncate" style={{ color: theme.textPrimary }}>
                    HappyNatsu
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Main Workspace: Left Controls + Right Canvas */}
            <div 
              className="flex-1 flex flex-col xl:flex-row gap-4 sm:gap-5 p-3 sm:p-5 overflow-hidden transition-colors"
              style={{ background: theme.workspaceBg }}
            >
              {/* Generator Controls Card */}
              <div 
                className="w-full xl:w-[410px] flex-shrink-0 flex flex-col gap-4 p-4 sm:p-5 rounded-[20px] border shadow-xs"
                style={{ background: theme.cardBg, borderColor: theme.border }}
              >
                {renderGeneratorControls(false)}
              </div>

              {/* Canvas Output */}
              <div className="flex-1 flex flex-col min-w-0">
                {renderCanvasOutput(false)}
              </div>
            </div>
          </div>
        </motion.div>
      )}

    </div>
  );
}
