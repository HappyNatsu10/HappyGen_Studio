import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Sparkles, Layers, Download, Monitor, Smartphone, 
  Zap, ArrowRight, ChevronRight, Star, Users, 
  Box, Eye, Cpu, ShieldCheck, ArrowDownToLine, CheckCircle2 
} from 'lucide-react';

import { InfiniteMovingCards } from '../../components/marketing/InfiniteMovingCards';
import { IMAGE_ENGINES, VIDEO_ENGINES } from '../../config/engines';
import { Spotlight } from '../../components/marketing/Spotlight';
import { InteractiveStudioHero } from '../../components/marketing/InteractiveStudioHero';
import { BeforeAfterSlider } from '../../components/marketing/BeforeAfterSlider';
import { ColabGuideSection } from '../../components/marketing/ColabGuideSection';
import { WorkstationBentoGrid } from '../../components/marketing/WorkstationBentoGrid';
import { DownloadHub } from '../../components/marketing/DownloadHub';

const allEngines = [
  ...IMAGE_ENGINES.flatMap(provider => provider.models.map(m => ({ ...m, provider: provider.provider, type: 'Image' }))),
  ...VIDEO_ENGINES.flatMap(provider => provider.models.map(m => ({ ...m, provider: provider.provider, type: 'Video' })))
];

const fadeInUp = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.12 }
  }
};

const STATS = [
  { value: '50,000+', label: 'CivitAI Models & LoRAs', icon: Box },
  { value: '100%', label: 'Free & Open Source (MIT)', icon: Star },
  { value: '$0 / mo', label: 'Zero Subscription Fees', icon: Zap },
  { value: '4 Native OS', label: 'Windows • Android • iOS • Mac', icon: Monitor },
];

export default function LandingPage() {
  const [detectedPlatform, setDetectedPlatform] = useState({ name: 'Windows', icon: '🪟', file: '.exe' });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = window.navigator.userAgent.toLowerCase();
      if (ua.includes('android')) {
        setDetectedPlatform({ name: 'Android', icon: '🤖', file: 'APK' });
      } else if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
        setDetectedPlatform({ name: 'iOS', icon: '🍎', file: 'IPA' });
      } else if (ua.includes('mac')) {
        setDetectedPlatform({ name: 'macOS', icon: '💻', file: '.dmg' });
      } else {
        setDetectedPlatform({ name: 'Windows', icon: '🪟', file: '.exe' });
      }
    }
  }, []);

  return (
    <div className="relative overflow-hidden min-h-screen bg-[var(--surface-0)] w-full">

      {/* ═══════════════════════════════════════════
          SECTION 1: EXPANSIVE HERO WORKSTATION
      ═══════════════════════════════════════════ */}
      <div className="relative w-full overflow-hidden min-h-[90vh] flex flex-col pt-20 sm:pt-28 md:pt-32">
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="rgba(99, 102, 241, 0.35)"
        />
        
        <div className="relative z-10 w-full max-w-[1600px] px-3.5 sm:px-6 lg:px-10 mx-auto my-10 flex flex-col items-center">
          
          {/* Hero Header & Action Text (Centered & Clean) */}
          <motion.div 
            className="text-center w-full max-w-4xl mx-auto mb-6"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            {/* Version & Architecture Pill */}
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-[#161a33] border border-[#272f5c] text-indigo-300 font-semibold text-[11px] sm:text-xs mb-4 sm:mb-6 shadow-sm max-w-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"></span>
              <span className="truncate">HappyGen Studio v2.0 • Native Creative Workstation</span>
            </motion.div>
            
            {/* Main Headline (Bold, High-Contrast, Authoritative) */}
            <motion.h1 variants={fadeInUp} className="text-3xl min-[400px]:text-4xl sm:text-6xl md:text-7xl lg:text-[4.75rem] font-black tracking-tight mb-4 sm:mb-6 leading-[1.08] text-white">
              The Native Generative Workstation. <br />
              <span className="text-slate-300 font-extrabold">
                Zero Cloud Fees. Total Control.
              </span>
            </motion.h1>
            
            {/* Subtitle (Technical, Grounded, No Clichés) */}
            <motion.p variants={fadeInUp} className="text-xs min-[400px]:text-sm sm:text-lg md:text-xl text-slate-400 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-1">
              Run SDXL base models, multi-LoRA dynamic stacks, inpainting, and motion pipelines directly on your GPU or connect free Google Colab & Kaggle cloud GPU instances. Uncensored, 100% offline-ready, and forever open source.
            </motion.p>
            
            {/* Direct OS-Detected Download Action */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mb-5 sm:mb-6 w-full max-w-sm sm:max-w-none mx-auto">
              <Link 
                to="/download" 
                className="btn-primary btn-primary-glow px-6 py-3.5 sm:px-10 sm:py-4 text-sm sm:text-base font-bold flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto justify-center rounded-2xl shadow-xl shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <ArrowDownToLine className="w-5 h-5 text-white" />
                <span>Download for {detectedPlatform.name} ({detectedPlatform.file})</span>
              </Link>

              <button 
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
                  window.history.replaceState(null, '', window.location.pathname);
                }} 
                className="px-6 py-3.5 sm:px-10 sm:py-4 text-sm sm:text-base font-bold flex items-center gap-2.5 w-full sm:w-auto justify-center rounded-2xl border border-slate-700 bg-slate-900/70 hover:bg-slate-800 text-slate-200 transition-all hover:text-white cursor-pointer"
              >
                <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
                <span>Explore Workstation Demo</span>
              </button>
            </motion.div>

            {/* Quick System Architecture Specs */}
            <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 text-xs text-slate-400 mb-15 px-1">
              <span className="px-2.5 py-1 sm:px-3 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300 font-mono text-[10px] sm:text-[11px] flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                <span>Direct CUDA 12.1 & MPS</span>
              </span>
              <span className="px-2.5 py-1 sm:px-3 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300 font-mono text-[10px] sm:text-[11px] flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5 text-purple-400" />
                <span>CivitAI Live Model Hub</span>
              </span>
              <span className="px-2.5 py-1 sm:px-3 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300 font-mono text-[10px] sm:text-[11px] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Private Offline Vault</span>
              </span>
              <span className="px-2.5 py-1 sm:px-3 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300 font-mono text-[10px] sm:text-[11px] flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Free Colab & Kaggle GPUs</span>
              </span>
            </motion.div>
          </motion.div>

          {/* ═══════════════════════════════════════════
              UN-NESTED FULL-WIDTH STUDIO WORKSTATION HERO
          ═══════════════════════════════════════════ */}
          <div id="demo" className="w-full max-w-[1600px] scroll-mt-28">
            <InteractiveStudioHero />
          </div>

        </div>
      </div>

      {/* ═══════════════════════════════════════════
          SECTION 2: ENGINE MARQUEE
      ═══════════════════════════════════════════ */}
      <div className="py-14 w-full border-t border-b border-[var(--border-subtle)] bg-slate-950/40">
        <div className="text-center mb-6">
          <p className="text-xs font-mono font-bold tracking-[0.25em] text-slate-400 uppercase">
            Compatible with Leading Open & Closed Generative Engines
          </p>
        </div>
        <div className="flex flex-col antialiased items-center justify-center relative overflow-hidden w-full">
          <InfiniteMovingCards
            items={allEngines}
            direction="right"
            speed="slow"
            className="w-full max-w-[100vw]"
          />
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          SECTION 3: NEURAL RESOLUTION COMPARISON
      ═══════════════════════════════════════════ */}
      <div className="py-16 w-full border-b border-[var(--border-subtle)]">
        {/* Split Screen Slider */}
        <BeforeAfterSlider />
      </div>

      {/* ═══════════════════════════════════════════
          SECTION 4: GOOGLE COLAB FREE CLOUD GPU
      ═══════════════════════════════════════════ */}
      <div id="colab" className="scroll-mt-24 border-b border-[var(--border-subtle)]">
        <ColabGuideSection />
      </div>

      {/* ═══════════════════════════════════════════
          SECTION 5: WORKSTATION BENTO GRID
      ═══════════════════════════════════════════ */}
      <div id="features" className="scroll-mt-24 border-b border-[var(--border-subtle)]">
        <WorkstationBentoGrid />
      </div>

      {/* ═══════════════════════════════════════════
          SECTION 6: OFFICIAL DOWNLOAD HUB
      ═══════════════════════════════════════════ */}
      <DownloadHub />

      {/* ═══════════════════════════════════════════
          SECTION 7: STATS & SOCIAL PROOF
      ═══════════════════════════════════════════ */}
      <div className="relative w-full py-12 sm:py-20 border-t border-[var(--border-subtle)] overflow-hidden bg-slate-950/60">
        <div className="relative z-10 w-full px-3.5 sm:px-6 lg:px-10 mx-auto max-w-[1440px]">
          <motion.div 
            className="text-center mb-8 sm:mb-12 max-w-3xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2 variants={fadeInUp} className="text-2xl sm:text-4xl font-extrabold text-white mb-2 sm:mb-3">
              Crafted for Artists & Engineering Autonomy
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xs sm:text-base text-slate-400 leading-relaxed px-1">
              Real local hardware performance, zero subscription limits, and total privacy.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="relative p-4 sm:p-7 rounded-[16px] sm:rounded-[22px] border border-slate-800 bg-slate-900/60 backdrop-blur-xl text-center group hover:border-indigo-500/40 transition-all duration-300"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-2.5 sm:mb-4 group-hover:scale-110 transition-transform">
                  <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
                </div>
                <div className="text-xl sm:text-3xl font-black text-white mb-1">{stat.value}</div>
                <div className="text-[10px] sm:text-xs text-slate-400 font-mono font-bold uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          SECTION 8: FINAL CTA
      ═══════════════════════════════════════════ */}
      <div className="relative w-full py-14 sm:py-24 border-t border-[var(--border-subtle)] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-pink-500/10 pointer-events-none" />
        
        <div className="relative z-10 w-full px-4 sm:px-6 mx-auto max-w-4xl text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2 variants={fadeInUp} className="text-2xl sm:text-4xl md:text-5xl font-black text-white mb-3 sm:mb-4 leading-tight">
              Start creating with zero limits today.
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xs sm:text-base md:text-lg text-slate-400 mb-6 sm:mb-8 max-w-xl mx-auto leading-relaxed px-1">
              Download the native workstation on Desktop or Mobile, connect your local GPU or free Google Colab & Kaggle cloud instances, and experience true creative ownership.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-sm sm:max-w-none mx-auto">
              <Link 
                to="/download" 
                className="btn-primary btn-primary-glow px-6 py-3.5 sm:px-10 sm:py-4 text-sm sm:text-base font-bold flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto justify-center rounded-2xl shadow-xl shadow-indigo-500/25"
              >
                <ArrowDownToLine className="w-5 h-5" />
                <span>Get HappyGen Studio (Free)</span>
              </Link>
              <Link 
                to="/walkthrough" 
                className="px-6 py-3.5 sm:px-8 sm:py-4 text-sm sm:text-base font-bold flex items-center gap-2 w-full sm:w-auto justify-center rounded-2xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-all"
              >
                <Eye className="w-4 h-4 text-indigo-400" />
                <span>Read Full Walkthrough</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

    </div>
  );
}
