import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ScanFace, Brush, SlidersHorizontal, ArrowLeftRight } from 'lucide-react';

export function BeforeAfterSlider() {
  const [sliderPos, setSliderPos] = useState(50);
  const [activeTab, setActiveTab] = useState('face'); // 'face' | 'inpaint'
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSliderPos(percent);
  }, []);

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
    face: {
      before: '/styles/face_raw.jpg',
      after: '/styles/face_restored.jpg',
      beforeLabel: 'Raw SDXL Output',
      afterLabel: 'ADetailer + GFPGAN 4K Restore',
      title: 'Neural Face Restoration',
      subtitle: 'Surgical YOLO-v8 face detection with automated prompt-guided inpainting that refines eyes, skin pores, and micro-expressions without altering art style.',
      badge: 'ADetailer Engine'
    },
    inpaint: {
      before: '/styles/inpaint_before.jpg',
      after: '/styles/inpaint_after.jpg',
      beforeLabel: 'Original Composition',
      afterLabel: 'Inpainted & Styled Output',
      title: 'Precision Inpainting Studio',
      subtitle: 'Brush over unwanted elements, regenerate hands, or overlay new objects seamlessly with boundary edge-feathering and prompt conditioning.',
      badge: 'Inpaint Studio'
    }
  };

  const current = demoData[activeTab];

  return (
    <div className="w-full max-w-5xl mx-auto my-12">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 mb-2">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Interactive Split-Screen</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {current.title}
          </h3>
          <p className="text-sm text-slate-400 max-w-xl mt-1">
            {current.subtitle}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-800 shadow-inner">
          <button
            onClick={() => { setActiveTab('face'); setSliderPos(50); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'face'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ScanFace className="w-4 h-4" />
            <span>Face Fix (ADetailer)</span>
          </button>
          <button
            onClick={() => { setActiveTab('inpaint'); setSliderPos(50); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'inpaint'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Brush className="w-4 h-4" />
            <span>Inpainting Studio</span>
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
        onTouchMove={handleTouchMove}
        className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl select-none cursor-ew-resize group"
      >
        {/* Layer 1: Restored / After (Full Background) */}
        <img
          src={current.after}
          alt={current.afterLabel}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
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
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Divider Line & Handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-400 via-white to-indigo-400 pointer-events-none z-20 shadow-[0_0_15px_rgba(99,102,241,0.8)]"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-slate-950/90 border-2 border-white shadow-xl flex items-center justify-center text-white backdrop-blur-md transition-transform duration-150 group-hover:scale-110">
            <ArrowLeftRight className="w-4 h-4 text-indigo-300" />
          </div>
        </div>

        {/* Left Badge: Before */}
        <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
          <div className="px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-xs font-semibold text-slate-300 flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-amber-400/80"></span>
            <span>{current.beforeLabel}</span>
          </div>
        </div>

        {/* Right Badge: After */}
        <div className="absolute bottom-4 right-4 z-10 pointer-events-none">
          <div className="px-3 py-1.5 rounded-lg bg-indigo-950/80 backdrop-blur-md border border-indigo-500/30 text-xs font-bold text-indigo-200 flex items-center gap-2 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>{current.afterLabel}</span>
          </div>
        </div>

        {/* Top Hint Bar */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
          <div className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10 text-[11px] font-medium text-slate-300">
            ← Drag slider to inspect details →
          </div>
        </div>
      </div>
    </div>
  );
}
