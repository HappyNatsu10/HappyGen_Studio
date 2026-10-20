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
import { LoraWeightSimulator } from '../../components/marketing/LoraWeightSimulator';
import { ColabGuideSection } from '../../components/marketing/ColabGuideSection';
import { WorkstationBentoGrid } from '../../components/marketing/WorkstationBentoGrid';
import { DownloadHub } from '../../components/marketing/DownloadHub';

const allEngines = [
  ...IMAGE_ENGINES.flatMap(provider => provider.models.map(m => ({ ...m, provider: provider.provider, type: 'Image' }))),
  ...VIDEO_ENGINES.flatMap(provider => provider.models.map(m => ({ ...m, provider: provider.provider, type: 'Video' })))
];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const STATS = [
  { value: '50,000+', label: 'CivitAI Models & LoRAs', icon: Box },
  { value: '100%', label: 'Free & Open Source', icon: Star },
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
          SECTION 1: HERO
      ═══════════════════════════════════════════ */}
      <div className="relative w-full overflow-hidden min-h-[90vh] flex flex-col pt-28 md:pt-36">
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="rgba(99, 102, 241, 0.45)"
        />
        
        <div className="relative z-10 w-full px-4 sm:px-8 xl:px-16 mx-auto flex flex-col items-center">
          <motion.div 
            className="text-center w-full max-w-5xl mx-auto"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            {/* Status Pill */}
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-semibold text-xs mb-8 shadow-lg shadow-indigo-500/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>HappyGen Studio v2.0 • Native Workstation for Desktop & Mobile</span>
            </motion.div>
            
            {/* Main Headline */}
            <motion.h1 variants={fadeInUp} className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 leading-[1.08] text-white">
              The Native AI Workstation <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
                Zero Subscriptions. Total Control.
              </span>
            </motion.h1>
            
            {/* Subtitle */}
            <motion.p variants={fadeInUp} className="text-base sm:text-lg md:text-xl text-slate-400 mb-10 max-w-3xl mx-auto leading-relaxed">
              Say goodbye to $30/month cloud web subscriptions, censored queues, and token caps. Generate locally on your GPU or connect free Google Colab cloud GPUs with full CivitAI LoRA stacking, surgical inpainting, and video creation.
            </motion.p>
            
            {/* Direct OS-Detected Download Action */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 mb-6">
              <a 
                href="#download" 
                className="btn-primary btn-primary-glow px-8 py-4 sm:px-10 sm:py-4 text-base sm:text-lg font-bold flex items-center gap-3 w-full sm:w-auto justify-center rounded-2xl shadow-xl shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5"
              >
                <ArrowDownToLine className="w-5 h-5 text-white" />
                <span>Download for {detectedPlatform.name} ({detectedPlatform.file})</span>
              </a>

              <a 
                href="#demo" 
                className="px-8 py-4 sm:px-10 sm:py-4 text-base sm:text-lg font-bold flex items-center gap-2.5 w-full sm:w-auto justify-center rounded-2xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 transition-all hover:text-white"
              >
                <Eye className="w-5 h-5 text-indigo-400" />
                <span>Explore Interactive Demo</span>
              </a>
            </motion.div>

            {/* Quick Platform Badges */}
            <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400 mb-14">
              <span className="text-slate-500 font-medium">Available natively on:</span>
              <a href="#download" className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors">
                <span>🪟 Windows (.exe)</span>
              </a>
              <a href="#download" className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-emerald-400 flex items-center gap-1.5 transition-colors">
                <span>🤖 Android (APK Ready)</span>
              </a>
              <a href="#download" className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 hover:border-purple-500/40 text-purple-300 flex items-center gap-1.5 transition-colors">
                <span>🍎 iOS (.ipa)</span>
              </a>
              <a href="#download" className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors">
                <span>💻 macOS (.dmg)</span>
              </a>
            </motion.div>

            {/* ═══════════════════════════════════════════
                INTERACTIVE STUDIO WORKSTATION HERO
            ═══════════════════════════════════════════ */}
            <div id="demo" className="scroll-mt-28">
              <InteractiveStudioHero />
            </div>

          </motion.div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          SECTION 2: ENGINE MARQUEE
      ═══════════════════════════════════════════ */}
      <div className="py-16 w-full border-t border-b border-[var(--border-subtle)] bg-slate-950/40">
        <div className="text-center mb-8">
          <p className="text-xs font-bold tracking-[0.25em] text-slate-400 uppercase">
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
          SECTION 3: INTERACTIVE VISUAL PROOF
      ═══════════════════════════════════════════ */}
      <div className="py-20 w-full border-b border-[var(--border-subtle)]">
        {/* Split Screen Slider */}
        <BeforeAfterSlider />

        {/* Live LoRA Weight Simulator */}
        <LoraWeightSimulator />
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
      <div className="relative w-full py-20 border-t border-[var(--border-subtle)] overflow-hidden bg-slate-950/60">
        <div className="relative z-10 w-full px-6 md:px-12 xl:px-24 mx-auto max-w-6xl">
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
              Crafted for Artists & Creators
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
              Real local hardware performance, zero subscription limits, and total privacy.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="relative p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl text-center group hover:border-indigo-500/40 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <stat.icon className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          SECTION 8: FINAL CTA
      ═══════════════════════════════════════════ */}
      <div className="relative w-full py-24 border-t border-[var(--border-subtle)] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-pink-500/10 pointer-events-none" />
        
        <div className="relative z-10 w-full px-6 mx-auto max-w-4xl text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-5xl font-black text-white mb-4 leading-tight">
              Start creating with zero limits today.
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-base sm:text-lg text-slate-400 mb-8 max-w-xl mx-auto">
              Download the native workstation on Desktop or Mobile, connect your GPU or free Google Colab, and experience true creative ownership.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href="#download" 
                className="btn-primary btn-primary-glow px-10 py-4 text-base sm:text-lg font-bold flex items-center gap-3 w-full sm:w-auto justify-center rounded-2xl shadow-xl shadow-indigo-500/25"
              >
                <ArrowDownToLine className="w-5 h-5" />
                <span>Get HappyGen Studio (Free)</span>
              </a>
              <Link 
                to="/walkthrough" 
                className="px-8 py-4 text-base font-bold flex items-center gap-2 w-full sm:w-auto justify-center rounded-2xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-all"
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
