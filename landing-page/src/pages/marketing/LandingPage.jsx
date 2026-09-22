import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Sparkles, Layers, FolderOpen, Play, Brush, ShieldCheck, 
  Download, Monitor, Smartphone, Zap, Image as ImageIcon, 
  Video, Wand2, ArrowRight, ChevronRight, Star, Users, 
  Box, Eye, Cpu, Palette, ScanFace, Globe, CheckCircle2
} from 'lucide-react';

import { InfiniteMovingCards } from '../../components/marketing/InfiniteMovingCards';
import { IMAGE_ENGINES, VIDEO_ENGINES } from '../../config/engines';
import { Spotlight } from '../../components/marketing/Spotlight';
import { TextGenerateEffect } from '../../components/marketing/TextGenerateEffect';
import { BackgroundBeams } from '../../components/marketing/BackgroundBeams';
import { BentoGrid, BentoGridItem } from '../../components/marketing/BentoGrid';

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

const FEATURES = [
  {
    icon: ImageIcon,
    title: 'Text-to-Image Generation',
    description: 'Create stunning images from text prompts using Stable Diffusion XL, SD 1.5, Flux, and more. Full control over sampling, CFG, seeds, and batch generation.',
    color: 'purple',
    gradient: 'from-purple-500/20 to-purple-900/5',
    border: 'border-purple-500/15',
  },
  {
    icon: Wand2,
    title: 'Image-to-Image & Variations',
    description: 'Upload a reference image and transform it with AI. Adjust denoising strength to control how much the AI changes. Generate multiple variations instantly.',
    color: 'pink',
    gradient: 'from-pink-500/20 to-pink-900/5',
    border: 'border-pink-500/15',
  },
  {
    icon: Brush,
    title: 'Inpainting & Infinite Canvas',
    description: 'Mask specific areas to regenerate. Paint over mistakes, swap objects, or add new elements. The infinite canvas lets you compose scenes with multiple generations.',
    color: 'blue',
    gradient: 'from-blue-500/20 to-blue-900/5',
    border: 'border-blue-500/15',
  },
  {
    icon: ScanFace,
    title: 'Face Fix (GFPGAN + ADetailer)',
    description: 'Two face restoration engines: GFPGAN for quick face enhancement, and ADetailer for surgical YOLO-based face detection + inpainting that matches your art style.',
    color: 'cyan',
    gradient: 'from-cyan-500/20 to-cyan-900/5',
    border: 'border-cyan-500/15',
  },
  {
    icon: Video,
    title: 'Video Generation',
    description: 'Turn your images into animated sequences using Stable Video Diffusion. Support for multiple video AI engines including Sora, Runway Gen-3, and Dream Machine.',
    color: 'amber',
    gradient: 'from-amber-500/20 to-amber-900/5',
    border: 'border-amber-500/15',
  },
  {
    icon: Layers,
    title: 'CivitAI Model Explorer',
    description: 'Browse and download thousands of base models, LoRAs, and embeddings directly from CivitAI. Stack multiple LoRAs with adjustable weights for unique styles.',
    color: 'emerald',
    gradient: 'from-emerald-500/20 to-emerald-900/5',
    border: 'border-emerald-500/15',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Connect Your Backend',
    description: 'Run our free Google Colab notebook to get a cloud GPU, or connect your own local GPU. Paste the tunnel URL and you\'re ready.',
    icon: Globe,
  },
  {
    step: '02',
    title: 'Choose Your Model',
    description: 'Browse thousands of AI models from CivitAI. Pick a base model, stack LoRAs for specific styles, and configure your generation settings.',
    icon: Cpu,
  },
  {
    step: '03',
    title: 'Generate & Refine',
    description: 'Write your prompt and hit generate. Upscale, fix faces, create variations, inpaint details — all from one unified workspace.',
    icon: Sparkles,
  },
];

const STATS = [
  { value: '50,000+', label: 'AI Models Available', icon: Box },
  { value: '30+', label: 'AI Engines Supported', icon: Cpu },
  { value: '100%', label: 'Free & Open Source', icon: Star },
  { value: '4+', label: 'Platforms Supported', icon: Globe },
];

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden min-h-screen bg-[var(--surface-0)] w-full">

      {/* ═══════════════════════════════════════════
          SECTION 1: HERO 
      ═══════════════════════════════════════════ */}
      <div className="relative w-full overflow-hidden min-h-[95vh] flex flex-col pt-32 md:pt-40">
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="rgba(168, 85, 247, 0.5)"
        />
        
        <div className="relative z-10 w-full px-6 md:px-12 xl:px-24 mx-auto flex flex-col items-center">
          <motion.div 
            className="text-center w-full max-w-5xl mx-auto"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 text-purple-300 font-medium text-sm mb-8 shadow-lg shadow-purple-500/10 animate-pulse-slow">
              <Sparkles className="w-4 h-4" />
              <span>Now with Multi-Language & Theme Support</span>
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="text-5xl sm:text-6xl md:text-8xl font-extrabold tracking-tight mb-8 leading-[1.1] text-white">
              The Ultimate <br className="hidden md:block" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">
                AI Workstation
              </span>
            </motion.h1>
            
            <motion.div variants={fadeInUp} className="text-lg md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed min-h-[80px]">
              <TextGenerateEffect words="Professional-grade image and video generation. Browse 50,000+ models from CivitAI, stack LoRAs, fix faces with AI, and generate videos with 30+ engines." />
            </motion.div>
            
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              <a href="#download" className="btn btn-primary btn-primary-glow px-8 py-4 md:px-10 md:py-5 text-lg md:text-xl font-semibold flex items-center gap-3 w-full sm:w-auto justify-center rounded-2xl">
                <Download className="w-5 h-5 md:w-6 md:h-6" />
                Download App
              </a>
              <Link to="/walkthrough" className="px-8 py-4 md:px-10 md:py-5 text-lg md:text-xl font-semibold flex items-center gap-3 w-full sm:w-auto justify-center rounded-2xl border border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 transition-all text-white">
                <Eye className="w-5 h-5 md:w-6 md:h-6" />
                View Walkthrough
              </Link>
            </motion.div>

            {/* Hero Mockups */}
            <motion.div 
              variants={fadeInUp} 
              className="mt-16 md:mt-24 relative w-full max-w-[1400px] mx-auto flex flex-col items-center"
            >
              {/* <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-0)] via-transparent to-transparent z-20 h-full pointer-events-none" /> */}
              
              <div className="relative w-full max-w-5xl mx-auto mt-12 md:mt-16 scale-[1.05] md:scale-[1.1] lg:scale-[1.15] transform-origin-top mb-16 md:mb-24">
                {/* Laptop Mockup */}
                <div className="relative z-10 mx-auto border-[8px] md:border-[12px] border-slate-800 rounded-t-2xl md:rounded-t-3xl bg-slate-900 w-full shadow-2xl">
                  <div className="rounded-lg md:rounded-xl overflow-hidden relative bg-black" style={{ aspectRatio: '1980/1000' }}>
                    <img src="/hero-desktop.png" alt="HappyGen Studio Desktop" className="w-full h-full object-cover object-top" />
                  </div>
                </div>
                {/* Laptop Base */}
                <div className="relative z-10 mx-auto w-[105%] -ml-[2.5%] h-4 sm:h-6 bg-slate-700 rounded-b-3xl rounded-t-sm shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex justify-center">
                  <div className="w-1/4 h-2 bg-slate-600 rounded-b-md"></div>
                </div>

                {/* Mobile Phone Mockup (overlapping) */}
                <motion.div 
                  initial={{ opacity: 0, y: 50, x: 20 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="absolute -bottom-16 -right-2 sm:-right-12 md:-right-16 z-30 w-32 sm:w-48 md:w-[280px] border-[6px] md:border-[8px] border-slate-800 rounded-[2rem] md:rounded-[2.5rem] bg-slate-900 shadow-2xl"
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-4 md:h-5 bg-slate-800 rounded-b-xl md:rounded-b-2xl z-10"></div>
                  <div className="rounded-[1.5rem] md:rounded-[2rem] overflow-hidden relative bg-black" style={{ aspectRatio: '570/1080' }}>
                    <img src="/hero-mobile.png" alt="HappyGen Studio Mobile" className="w-full h-full object-cover object-center" />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          SECTION 2: ENGINE MARQUEE 
      ═══════════════════════════════════════════ */}
      <div className="py-20 w-full border-t border-b border-[var(--border-subtle)]">
        <div className="text-center mb-10">
          <p className="text-xs font-bold tracking-[0.25em] text-slate-500 uppercase">Powered by Industry-Leading AI Engines</p>
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
          SECTION 3: HOW IT WORKS 
      ═══════════════════════════════════════════ */}
      <div className="relative w-full py-24 md:py-32">
        <div className="relative z-10 w-full px-6 md:px-12 xl:px-24 mx-auto max-w-[1400px]">
          <motion.div 
            className="text-center mb-16 md:mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.p variants={fadeInUp} className="text-xs font-bold tracking-[0.25em] text-purple-400 uppercase mb-4">How It Works</motion.p>
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-white mb-6">Up and running in minutes</motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-slate-400 max-w-2xl mx-auto">No complex setup. No expensive hardware required. Just connect, choose, and generate.</motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {HOW_IT_WORKS.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="relative p-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-1)]/60 backdrop-blur-sm group hover:border-purple-500/30 transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-5xl font-black text-purple-500/20 group-hover:text-purple-500/40 transition-colors">{item.step}</span>
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                    <item.icon className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
                {i < HOW_IT_WORKS.length - 1 && (
                  <ArrowRight className="hidden md:block absolute -right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-600 z-10" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          SECTION 4: FEATURE DEEP-DIVES 
      ═══════════════════════════════════════════ */}
      <div className="relative w-full py-24 md:py-32 border-t border-[var(--border-subtle)] overflow-hidden">
        <BackgroundBeams />
        
        <div className="relative z-10 w-full px-6 md:px-12 xl:px-24 mx-auto max-w-[1400px]">
          <motion.div 
            className="text-center mb-16 md:mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.p variants={fadeInUp} className="text-xs font-bold tracking-[0.25em] text-purple-400 uppercase mb-4">Features</motion.p>
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-white mb-6">Everything you need to create</motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-slate-400 max-w-2xl mx-auto">A complete creative suite with professional-grade tools, all in one unified workspace.</motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className={`p-8 rounded-2xl border ${feature.border} bg-gradient-to-br ${feature.gradient} backdrop-blur-sm group hover:scale-[1.02] transition-all duration-300 cursor-default`}
              >
                <div className={`w-14 h-14 rounded-2xl bg-${feature.color}-500/15 border border-${feature.color}-500/25 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-7 h-7 text-${feature.color}-400`} />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          SECTION 5: PLATFORM SHOWCASE 
      ═══════════════════════════════════════════ */}
      <div className="relative w-full py-24 md:py-32 border-t border-[var(--border-subtle)]">
        <div className="relative z-10 w-full px-6 md:px-12 xl:px-24 mx-auto max-w-[1400px]">
          <motion.div 
            className="text-center mb-16 md:mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.p variants={fadeInUp} className="text-xs font-bold tracking-[0.25em] text-purple-400 uppercase mb-4">Cross-Platform</motion.p>
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-white mb-6">Create anywhere, on any device</motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-slate-400 max-w-2xl mx-auto">Available as a web app, desktop application, and mobile app. Your creative workspace follows you everywhere.</motion.p>
          </motion.div>

          <div className="flex flex-col items-center justify-center">
            {/* Desktop mockup */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative w-full max-w-5xl"
            >
              <div className="rounded-xl overflow-hidden border border-[var(--border-subtle)] shadow-2xl shadow-purple-500/10">
                {/* Window chrome */}
                <div className="bg-[var(--surface-2)] border-b border-[var(--border-subtle)] px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/70" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                    <div className="w-3 h-3 rounded-full bg-green-500/70" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="bg-[var(--surface-3)] rounded-lg px-4 py-1 text-xs text-slate-500 font-mono">HappyGen Studio</div>
                  </div>
                </div>
                <img src="/ui-preview.png" alt="HappyGen Studio Desktop App" className="w-full h-auto" />
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-full px-5 py-2 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold text-slate-300">Desktop / Web App</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          SECTION 6: DOWNLOAD 
      ═══════════════════════════════════════════ */}
      <div id="download" className="relative w-full py-24 md:py-32 border-t border-[var(--border-subtle)] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 w-full px-6 md:px-12 xl:px-24 mx-auto max-w-[1400px]">
          <motion.div 
            className="text-center mb-16 md:mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.p variants={fadeInUp} className="text-xs font-bold tracking-[0.25em] text-purple-400 uppercase mb-4">Download</motion.p>
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-white mb-6">Get HappyGen Studio</motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-slate-400 max-w-2xl mx-auto">Download for your platform and start creating in minutes. All versions are completely free.</motion.p>
          </motion.div>



          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Windows */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-1)]/60 backdrop-blur-sm text-center group hover:border-blue-500/30 transition-all duration-300"
            >
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                <Monitor className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Windows</h3>
              <p className="text-xs text-slate-500 mb-5">Windows 10/11 (x64)</p>
              <a href="#" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-blue-500/15 border border-blue-500/25 text-blue-300 font-semibold text-sm hover:bg-blue-500/25 transition-colors">
                <Download className="w-4 h-4" />
                Download .exe
              </a>
            </motion.div>

            {/* macOS */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-1)]/60 backdrop-blur-sm text-center group transition-all duration-300 relative"
            >
              <div className="absolute top-3 right-3 bg-slate-700 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">COMING SOON</div>
              <div className="w-14 h-14 bg-slate-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Monitor className="w-7 h-7 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">macOS</h3>
              <p className="text-xs text-slate-500 mb-5">Apple Silicon (M1+)</p>
              <div className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-800/30 border border-slate-700/50 text-slate-500 font-semibold text-sm cursor-not-allowed">
                Coming soon
              </div>
            </motion.div>

            {/* Android */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="p-6 rounded-2xl border border-purple-500/20 bg-[var(--surface-1)]/60 backdrop-blur-sm text-center group hover:border-purple-500/40 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-3 right-3 bg-purple-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">NEW</div>
              <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                <Smartphone className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Android</h3>
              <p className="text-xs text-slate-500 mb-5">Android 8.0+</p>
              <a href="#" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-purple-500/15 border border-purple-500/25 text-purple-300 font-semibold text-sm hover:bg-purple-500/25 transition-colors">
                <Download className="w-4 h-4" />
                Google Play
              </a>
            </motion.div>

            {/* iOS */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-1)]/60 backdrop-blur-sm text-center group transition-all duration-300 relative"
            >
              <div className="absolute top-3 right-3 bg-slate-700 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">COMING SOON</div>
              <div className="w-14 h-14 bg-slate-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Smartphone className="w-7 h-7 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">iOS</h3>
              <p className="text-xs text-slate-500 mb-5">iPhone & iPad</p>
              <div className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-800/30 border border-slate-700/50 text-slate-500 font-semibold text-sm cursor-not-allowed">
                Coming soon
              </div>
            </motion.div>
          </div>


        </div>
      </div>

      {/* ═══════════════════════════════════════════
          SECTION 7: STATS / SOCIAL PROOF 
      ═══════════════════════════════════════════ */}
      <div className="relative w-full py-24 md:py-32 border-t border-[var(--border-subtle)] overflow-hidden">
        <div className="absolute inset-0 bg-purple-500/5 pointer-events-none" />
        
        <div className="relative z-10 w-full px-6 md:px-12 xl:px-24 mx-auto max-w-6xl">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-white mb-6">Trusted by Creators</motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-slate-400 max-w-2xl mx-auto">The scale and flexibility you need to bring your wildest ideas to life.</motion.p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="relative p-8 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-1)]/80 backdrop-blur-xl group hover:border-purple-500/50 transition-all duration-500 overflow-hidden text-center"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-500">
                    <stat.icon className="w-7 h-7 text-purple-400" />
                  </div>
                  
                  <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 mb-2">{stat.value}</div>
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          SECTION 8: FINAL CTA 
      ═══════════════════════════════════════════ */}
      <div className="relative w-full py-24 md:py-32 border-t border-[var(--border-subtle)] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/5 to-indigo-500/10 pointer-events-none" />
        <div className="absolute inset-0 bg-[var(--surface-0)]/50 pointer-events-none" />
        
        <div className="relative z-10 w-full px-6 md:px-12 xl:px-24 mx-auto max-w-4xl text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-white mb-6">
              Start creating today
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-slate-400 mb-10 max-w-xl mx-auto">
              Join thousands of artists, designers, and creators using HappyGen Studio to bring their imagination to life.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/walkthrough" className="btn btn-primary btn-primary-glow px-10 py-5 text-xl font-semibold flex items-center gap-3 w-full sm:w-auto justify-center rounded-2xl">
                <Eye className="w-6 h-6" />
                View Walkthrough
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
