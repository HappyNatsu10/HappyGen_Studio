import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ScanFace, Brush, SlidersHorizontal, ArrowLeftRight, Wand2 } from 'lucide-react';

export function BeforeAfterSlider() {
  const [sliderPos, setSliderPos] = useState(50);
  const [activeTab, setActiveTab] = useState('anime'); // 'anime' | 'face' | 'inpaint'
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSliderPos(percent);
  }, []);

  const handleTouchStart = (e) => {
    if (e.touches && e.touches[0]) {
      setIsDragging(true);
      handleMove(e.touches[0].clientX);
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const demoData = {
    anime: {
      before: '/studio/superres-before.jpg',
      after: '/studio/superres-after.jpg',
      beforeLabel: 'Standard 512px Draft',
      afterLabel: 'HappyGen 4K Neural Super-Resolution',
      title: 'Anime RealESRGAN & High-Res Fix',
      subtitle: 'Instantly enhance line art crispness, fine hair textures, and lighting speculars from quick low-res drafts up to print-ready 4K with zero artifacting.',
      badge: 'RealESRGAN 4K'
    },
    face: {
      before: '/studio/adetailer-before.jpg',
      after: '/studio/adetailer-after.jpg',
      beforeLabel: 'Raw SDXL Output',
      afterLabel: 'ADetailer + GFPGAN 4K Restore',
      title: 'Neural Face Restoration',
      subtitle: 'Surgical YOLO-v8 face detection with automated prompt-guided inpainting that refines eyes, skin pores, and micro-expressions without altering art style.',
      badge: 'ADetailer Engine'
    },
    inpaint: {
      before: '/studio/inpaint-before.jpg',
      after: '/studio/inpaint-after.jpg',
      beforeLabel: 'Original Composition',
      afterLabel: 'Inpainted & Styled Output',
      title: 'Precision Inpainting Studio',
      subtitle: 'Brush over unwanted elements, regenerate hands, or overlay new objects seamlessly with boundary edge-feathering and prompt conditioning.',
      badge: 'Inpaint Studio'
    }
  };

  const current = demoData[activeTab];

  return (
    <div className="w-full max-w-5xl lg:max-w-[1240px] mx-auto my-8 sm:my-14 px-3 sm:px-6">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-6 sm:mb-7 text-left">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 mb-2">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Interactive Split-Screen</span>
          </div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
            {current.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mt-1 leading-relaxed">
            {current.subtitle}
          </p>
        </div>

        {/* 3-Tab Toggle */}
        <div className="flex items-center p-1 sm:p-1.5 rounded-xl sm:rounded-2xl bg-[#090c20] border border-[#1e2345] shadow-inner w-full sm:w-auto justify-between sm:justify-start gap-1 overflow-x-auto no-scrollbar flex-shrink-0">
          <button
            onClick={() => { setActiveTab('anime'); setSliderPos(50); }}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] min-[380px]:text-[11px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'anime'
                ? 'bg-[#4f46e5] text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wand2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>4K Super-Res</span>
          </button>
          <button
            onClick={() => { setActiveTab('face'); setSliderPos(50); }}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] min-[380px]:text-[11px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'face'
                ? 'bg-[#4f46e5] text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ScanFace className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>ADetailer Fix</span>
          </button>
          <button
            onClick={() => { setActiveTab('inpaint'); setSliderPos(50); }}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] min-[380px]:text-[11px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'inpaint'
                ? 'bg-[#4f46e5] text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Brush className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Inpainting</span>
          </button>
        </div>
      </div>

      {/* Comparison Viewport */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
        style={{ touchAction: 'none' }}
        className="relative w-full h-[280px] min-[400px]:h-[340px] sm:h-[480px] md:h-[560px] rounded-[18px] sm:rounded-[24px] overflow-hidden border border-[#1e2345] bg-[#05060f] shadow-[0_25px_60px_rgba(0,0,0,0.85)] select-none cursor-ew-resize group"
      >
        {/* Layer 1: Restored / After (Full Background) */}
        <img
          src={current.after}
          alt={current.afterLabel}
          className="absolute inset-0 w-full h-full object-contain object-center pointer-events-none"
          loading="lazy"
        />

        {/* Layer 2: Raw / Before (Clipped on top) */}
        <div
          className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
        >
          <img
            src={current.before}
            alt={current.beforeLabel}
            className="absolute inset-0 w-full h-full object-contain object-center"
            loading="lazy"
          />
        </div>

        {/* Divider Line & Handle */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-400 via-white to-indigo-400 pointer-events-none z-20 shadow-[0_0_12px_rgba(99,102,241,0.9)]"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[#070914] border-2 border-white shadow-xl flex items-center justify-center text-white backdrop-blur-md transition-transform duration-150 group-hover:scale-110">
            <ArrowLeftRight className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-indigo-300" />
          </div>
        </div>

        {/* Left Badge: Before */}
        <div className="absolute bottom-2 sm:bottom-3.5 left-2 sm:left-3.5 z-10 pointer-events-none">
          <div className="px-2 py-0.5 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-black/85 backdrop-blur-md border border-white/10 text-[9px] min-[380px]:text-[10px] sm:text-[11px] font-semibold text-slate-300 flex items-center gap-1.5 shadow-xl">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-400"></span>
            <span>{current.beforeLabel}</span>
          </div>
        </div>

        {/* Right Badge: After */}
        <div className="absolute bottom-2 sm:bottom-3.5 right-2 sm:right-3.5 z-10 pointer-events-none">
          <div className="px-2 py-0.5 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-[#1e1338]/90 backdrop-blur-md border border-purple-500/30 text-[9px] min-[380px]:text-[10px] sm:text-[11px] font-bold text-purple-200 flex items-center gap-1.5 shadow-xl">
            <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-400" />
            <span>{current.afterLabel}</span>
          </div>
        </div>

        {/* Top Hint Bar */}
        <div className="absolute top-2.5 sm:top-3.5 left-1/2 -translate-x-1/2 z-10 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
          <div className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/15 text-[9px] sm:text-[10px] font-medium text-slate-300 shadow-lg whitespace-nowrap">
            ← Drag slider to compare →
          </div>
        </div>
      </div>
    </div>
  );
}
