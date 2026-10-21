import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Image as ImageIcon, Video, Brush, Layers, FolderOpen, Settings,
  Sparkles, Download, Copy, Check, Server, Maximize2, ImagePlus,
  RefreshCw, Plus, X, ChevronDown, User, ChevronLeft, Sliders,
  HelpCircle, Sun, Moon
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
  const [selectedPresetId, setSelectedPresetId] = useState('schoolgirl');
  const [loraWeight, setLoraWeight] = useState(0.80);
  const [batchSize, setBatchSize] = useState(2);
  const [activeNav, setActiveNav] = useState('generate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedSeed, setCopiedSeed] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

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

  return (
    <div className="relative w-full max-w-[1560px] mx-auto px-2 sm:px-4">
      
      {/* ── Main Workstation Window Frame (Matches UI-white.png) ─────────── */}
      <div 
        className="w-full rounded-[18px] sm:rounded-[24px] overflow-hidden select-none text-left transition-colors duration-200 shadow-2xl"
        style={{
          background: theme.windowBg,
          border: `1px solid ${theme.border}`,
          boxShadow: isDark 
            ? '0 30px 100px -15px rgba(0, 0, 0, 0.95), 0 0 40px -10px rgba(99, 102, 241, 0.12)' 
            : '0 25px 70px -12px rgba(15, 23, 42, 0.12), 0 0 30px -5px rgba(124, 58, 237, 0.06)'
        }}
      >
        {/* ── Studio TopBar (Exact match to UI-white.png) ──────────────── */}
        <div 
          className="h-11 sm:h-14 px-2.5 sm:px-5 flex items-center justify-between border-b transition-colors gap-2"
          style={{
            background: theme.topBarBg,
            borderColor: theme.border
          }}
        >
          {/* Left: Window Controls, Logo & Breadcrumb */}
          <div className="flex items-center gap-1.5 sm:gap-4 min-w-0">
            <div className="flex items-center gap-1 sm:gap-2 mr-0.5 sm:mr-1 flex-shrink-0">
              <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#ff5f56]" />
              <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#ffbd2e]" />
              <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#27c93f]" />
            </div>

            <div className="flex items-center gap-1 sm:gap-2 truncate">
              <img src="/logo.png" alt="HappyGen" className="w-4 h-4 sm:w-6 sm:h-6 object-contain flex-shrink-0" onError={e => e.target.style.display='none'} />
              <span className="text-[11px] sm:text-sm font-bold tracking-tight truncate" style={{ color: theme.textPrimary }}>
                HappyGen <span className="font-normal text-slate-400 text-[9px] sm:text-xs">v2</span>
              </span>
            </div>

            <div className="h-3.5 w-px bg-slate-300 dark:bg-slate-700 hidden sm:block flex-shrink-0" />

            <span className="text-xs sm:text-sm font-bold hidden sm:inline flex-shrink-0" style={{ color: theme.textPrimary }}>
              Create
            </span>
          </div>

          {/* Center Announcement Banner (Exact copy from UI-white.png) */}
          <div className="hidden xl:flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-pink-50 via-purple-50 to-pink-50 border border-pink-200/60 text-slate-700">
            <span>🚀 More base models and the advanced Video Suite are coming soon! Stay tuned.</span>
          </div>

          {/* Right: Theme Toggle, Connection & Profile */}
          <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
            {/* Theme Toggle (Light / Dark) */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-1 sm:p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
              style={{
                background: theme.cardInner,
                borderColor: theme.border,
                color: theme.textSecondary
              }}
              title={isDark ? "Switch to White Theme" : "Switch to Dark Theme"}
            >
              {isDark ? <Sun className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" /> : <Moon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-600" />}
              <span className="hidden sm:inline text-[11px]">{isDark ? 'Dark' : 'White'}</span>
            </button>

            {/* Connection Status Pill (Green dot + Connected) */}
            <div 
              className="flex items-center gap-1 sm:gap-2 px-1.5 py-0.5 sm:px-3 sm:py-1.5 rounded-md text-xs font-medium"
              style={{
                background: isDark ? 'rgba(52, 211, 153, 0.1)' : '#f0fdf4',
                border: isDark ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid #bbf7d0',
                color: '#16a34a'
              }}
            >
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] flex-shrink-0" />
              <Server className="w-3.5 h-3.5 text-emerald-600 hidden sm:inline" />
              <span className="font-semibold text-[9px] min-[380px]:text-[10px] sm:text-[11px]">Connected</span>
            </div>

            {/* User Profile Avatar (HappyNatsu from UI-white.png) */}
            <div className="flex items-center gap-1 sm:gap-2">
              <div 
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden border flex items-center justify-center font-bold text-[9px] sm:text-xs"
                style={{
                  background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
                  color: '#ffffff',
                  borderColor: theme.border
                }}
              >
                HN
              </div>
            </div>
          </div>
        </div>

        {/* ── Studio Body: Sidebar + Workbench + Canvas ──────────────── */}
        <div className="flex flex-col md:flex-row w-full min-h-[580px] lg:min-h-[660px]">
          
          {/* ══════════════════════════════════════════════════
              LEFT SIDEBAR (Matches UI-white.png)
          ══════════════════════════════════════════════════ */}
          <div 
            className="hidden md:flex flex-col w-[190px] border-r flex-shrink-0 py-4 px-2.5 justify-between"
            style={{
              background: theme.sidebarBg,
              borderColor: theme.border
            }}
          >
            {/* Navigation Groups */}
            <div className="space-y-4">
              {/* CREATE group */}
              <div className="space-y-1">
                <div className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  CREATE
                </div>
                
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

              {/* DISCOVER group */}
              <div className="space-y-1">
                <div className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  DISCOVER
                </div>
                <div 
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium hover:bg-slate-50 dark:hover:bg-white/[0.03] cursor-pointer"
                  style={{ color: theme.textSecondary }}
                >
                  <Layers className="w-4 h-4" />
                  <span>Model Explorer</span>
                </div>
              </div>

              {/* LIBRARY group */}
              <div className="space-y-1">
                <div className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  LIBRARY
                </div>
                <div 
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium hover:bg-slate-50 dark:hover:bg-white/[0.03] cursor-pointer"
                  style={{ color: theme.textSecondary }}
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>Gallery</span>
                </div>
              </div>

              {/* SYSTEM group */}
              <div className="space-y-1">
                <div className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  SYSTEM
                </div>
                <div 
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium hover:bg-slate-50 dark:hover:bg-white/[0.03] cursor-pointer"
                  style={{ color: theme.textSecondary }}
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </div>
              </div>
            </div>

            {/* Bottom User Account Pill (HappyNatsu - Free User from UI-white.png) */}
            <div 
              className="p-2.5 rounded-xl border flex items-center justify-between"
              style={{
                background: theme.cardInner,
                borderColor: theme.border
              }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                  HN
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold truncate" style={{ color: theme.textPrimary }}>
                    HappyNatsu
                  </div>
                  <div className="text-[9px] text-slate-400">
                    Free User
                  </div>
                </div>
              </div>
              <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          {/* ══════════════════════════════════════════════════
              MAIN WORKSPACE: Left Control Card + Right Canvas
          ══════════════════════════════════════════════════ */}
          <div 
            className="flex-1 flex flex-col lg:flex-row gap-4 sm:gap-5 p-2.5 sm:p-5 overflow-hidden transition-colors"
            style={{ background: theme.workspaceBg }}
          >
            
            {/* ── LEFT CARD: Generator Controls (Exact UI-white.png) ── */}
            <div 
              className="w-full lg:w-[410px] flex-shrink-0 flex flex-col gap-3.5 sm:gap-4 p-3 sm:p-5 rounded-[18px] sm:rounded-[22px] border shadow-sm"
              style={{
                background: theme.cardBg,
                borderColor: theme.border
              }}
            >
              {/* 1. Active LoRAs (1) Card with weight slider */}
              <div className="space-y-2">
                <div 
                  className="p-3 rounded-xl border space-y-2"
                  style={{
                    background: theme.cardInner,
                    borderColor: theme.border
                  }}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                      <Layers className="w-3.5 h-3.5 text-purple-600" />
                      <span>Active LoRAs (1)</span>
                      <HelpCircle className="w-3 h-3 text-slate-400" />
                    </div>
                  </div>

                  <div 
                    className="p-2.5 rounded-lg border flex items-center gap-3 bg-white dark:bg-[#0B0B1A]"
                    style={{ borderColor: theme.border }}
                  >
                    <img 
                      src={current.loraThumb} 
                      alt="" 
                      className="w-8 h-8 rounded-md object-cover flex-shrink-0 border"
                      style={{ borderColor: theme.border }}
                    />
                    
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-bold truncate" style={{ color: theme.textPrimary }}>
                        {current.loraName}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="range"
                          min="0"
                          max="1.5"
                          step="0.05"
                          value={loraWeight}
                          onChange={e => setLoraWeight(parseFloat(e.target.value))}
                          className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                        <span className="font-mono text-[10px] font-bold text-purple-600 w-7 text-right">
                          {loraWeight.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <button className="text-slate-400 hover:text-slate-600 p-1">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Add LoRA / Add Embedding buttons */}
                <div className="flex items-center gap-2">
                  <button 
                    className="flex-1 py-1.5 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors cursor-pointer"
                    style={{ borderColor: theme.border }}
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add LoRA</span>
                  </button>
                  <button 
                    className="flex-1 py-1.5 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors cursor-pointer"
                    style={{ borderColor: theme.border }}
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Embedding</span>
                  </button>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                </div>
              </div>

              {/* 2. Prompt Editor (Prompt + Image to Prompt + Chars Count) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold" style={{ color: theme.textPrimary }}>
                      Prompt
                    </label>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      Image To Prompt
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400">
                    {(customPrompt || current.prompt).length} chars
                  </span>
                </div>

                <textarea
                  rows={3}
                  value={customPrompt || current.prompt}
                  onChange={e => setCustomPrompt(e.target.value)}
                  className="w-full p-3 rounded-xl text-xs font-mono leading-relaxed outline-none resize-none transition-colors"
                  style={{
                    background: theme.inputBg,
                    border: `1px solid ${theme.border}`,
                    color: theme.textPrimary,
                    caretColor: '#7c3aed'
                  }}
                />

                {/* Quick Tags (Exact pills from UI-white.png) */}
                <div className="pt-1">
                  <div className="text-[10px] font-semibold text-slate-400 mb-1 flex items-center justify-between">
                    <span>💡 Quick Tags</span>
                    <span className="sm:hidden text-[9px] text-slate-500 font-mono">Swipe →</span>
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5 sm:flex-wrap">
                    {['1girl', 'solo', 'masterpiece', 'best quality', 'detailed eyes', 'long hair', 'smile', 'outdoors', 'school uniform'].map(tag => (
                      <button
                        key={tag}
                        onClick={() => addTag(tag)}
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-medium transition-colors cursor-pointer hover:opacity-80 flex-shrink-0"
                        style={{
                          background: theme.tagBg,
                          color: theme.tagText,
                          border: `1px solid ${theme.borderSubtle}`
                        }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Negative Prompt (Exact box from UI-white.png) */}
              <div className="space-y-1">
                <label className="text-xs font-bold" style={{ color: theme.textPrimary }}>
                  Negative Prompt
                </label>
                <div 
                  className="w-full p-2.5 rounded-xl text-[11px] font-mono leading-relaxed max-h-16 overflow-y-auto"
                  style={{
                    background: theme.inputBg,
                    border: `1px solid ${theme.border}`,
                    color: theme.textMuted
                  }}
                >
                  {current.negative}
                </div>
              </div>

              {/* 4. Batch Size Slider (Exact UI-white.png) */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold" style={{ color: theme.textPrimary }}>
                    Batch Size
                  </span>
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

              {/* 5. Advanced Settings Button */}
              <button 
                className="w-full py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors cursor-pointer"
                style={{
                  background: theme.cardBg,
                  borderColor: theme.border,
                  color: theme.textSecondary
                }}
              >
                <Settings className="w-3.5 h-3.5 text-purple-600" />
                <span>Advanced Settings</span>
              </button>

              {/* 6. Generate Button (Purple pill button matching UI-white.png) */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-3.5 rounded-xl text-sm font-bold tracking-wide text-white flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-600/25 transition-all hover:brightness-105 active:scale-[0.99]"
                style={{
                  background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)'
                }}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4 text-white" />
                    <span>Generate</span>
                  </>
                )}
              </button>

            </div>

            {/* ── RIGHT CANVAS: Generated Artwork (Exact UI-white.png) ── */}
            <div className="flex-1 flex flex-col min-w-0">
              <div 
                className="relative flex-1 rounded-[22px] border overflow-hidden flex flex-col justify-between group shadow-sm transition-colors"
                style={{
                  background: theme.cardBg,
                  borderColor: theme.border
                }}
              >
                {/* Artwork Center Stage */}
                <div 
                  className="relative flex-1 flex items-center justify-center p-2.5 sm:p-4 overflow-hidden min-h-[300px] sm:min-h-[440px]"
                  style={{ background: theme.canvasBg }}
                >
                  <AnimatePresence mode="wait">
                    {isGenerating ? (
                      <motion.div 
                        key="generating"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center gap-3 py-16 sm:py-24"
                      >
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                          <RefreshCw className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600 animate-spin" />
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-center px-2" style={{ color: theme.textPrimary }}>
                          Rendering Latent Diffusion...
                        </div>
                        <div className="text-[11px] sm:text-xs font-mono text-slate-400 text-center px-2">
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
                        className="max-h-[340px] sm:max-h-[520px] w-auto max-w-full rounded-xl object-contain shadow-md"
                      />
                    )}
                  </AnimatePresence>

                  {/* Floating Action Pill Bar on Hover / Mobile */}
                  {!isGenerating && (
                    <div 
                      className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border shadow-xl backdrop-blur-md opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 max-w-[calc(100%-20px)] overflow-x-auto no-scrollbar"
                      style={{
                        background: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.95)',
                        borderColor: theme.border
                      }}
                    >
                      <button 
                        onClick={() => alert(`Full Resolution Preview: ${current.dimensions}`)}
                        className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                        title="Full Screen View"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="w-px h-3.5 bg-slate-300 dark:bg-white/15 mx-0.5" />
                      <button 
                        onClick={() => alert('Download PNG')}
                        className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                        title="Download"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => alert('Upscaling 4K...')}
                        className="p-1.5 rounded-full hover:bg-purple-50 text-purple-600 transition-colors cursor-pointer"
                        title="Upscale 4K"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => alert('Create Variant')}
                        className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                        title="Create Variant"
                      >
                        <ImagePlus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Bottom Metadata Bar & Thumbnails (Exact strip from UI-white.png) */}
                <div 
                  className="px-3 sm:px-5 py-2.5 sm:py-3 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs"
                  style={{
                    background: theme.cardBg,
                    borderColor: theme.border
                  }}
                >
                  {/* Left: Metadata info */}
                  <div className="flex flex-wrap items-center gap-1.5 min-[380px]:gap-2 sm:gap-3 font-mono text-[9px] min-[380px]:text-[10px] sm:text-[11px] text-slate-500">
                    <span className="font-bold text-slate-700 dark:text-slate-200">{current.dimensions}</span>
                    <span>•</span>
                    <button 
                      onClick={handleCopySeed}
                      className="flex items-center gap-1 hover:text-purple-600 cursor-pointer"
                    >
                      <span>Seed: {current.seed}</span>
                      {copiedSeed ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-slate-400" />}
                    </button>
                    <span>•</span>
                    <span className="text-purple-600 font-semibold truncate max-w-[200px] min-[400px]:max-w-none">{current.backend}</span>
                  </div>

                  {/* Right: History Thumbnails Switcher */}
                  <div className="flex items-center gap-1.5 sm:gap-2 self-end sm:self-auto">
                    {STUDIO_PRESETS.map((preset) => {
                      const isSelected = preset.id === current.id;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => {
                            setSelectedPresetId(preset.id);
                            setCustomPrompt('');
                          }}
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                            isSelected 
                              ? 'border-purple-600 shadow-md scale-105' 
                              : 'border-transparent opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img 
                            src={preset.image} 
                            alt={preset.label} 
                            className="w-full h-full object-cover" 
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
