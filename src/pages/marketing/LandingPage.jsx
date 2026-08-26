import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Layers, FolderOpen, Play, Brush, ShieldCheck } from 'lucide-react';
import gsap from 'gsap';

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

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="relative overflow-hidden min-h-screen bg-[var(--surface-0)] w-full">
      {/* Hero Section */}
      <div className="relative w-full overflow-hidden min-h-[90vh] flex flex-col pt-40">
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="rgba(168, 85, 247, 0.5)" // Purple tint
        />
        
        <div className="relative z-10 w-full px-6 md:px-12 xl:px-24 mx-auto flex flex-col items-center">
          <motion.div 
            className="text-center w-full max-w-5xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 font-medium text-sm mb-10 shadow-lg shadow-purple-500/10 mt-8">
              <Sparkles className="w-4 h-4" />
              <span>Introducing HappyGen Studio v2.0</span>
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-extrabold tracking-tight mb-8 leading-tight text-white drop-shadow-2xl">
              The Ultimate <br className="hidden md:block" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">
                AI Workstation
              </span>
            </motion.h1>
            
            <motion.div variants={itemVariants} className="text-lg md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed h-[80px]">
              <TextGenerateEffect words="Professional-grade image, video, and inpainting tools powered by the latest open-source models. Stack LoRAs and edit on infinite canvas." />
            </motion.div>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8">
              <Link to="/studio" className="btn btn-primary btn-primary-glow px-10 py-5 text-xl font-semibold flex items-center gap-3 w-full sm:w-auto justify-center rounded-2xl">
                <Play className="w-6 h-6 fill-current" />
                Launch Studio Free
              </Link>
              <Link to="/pricing" className="btn btn-secondary px-10 py-5 text-xl font-semibold flex items-center gap-3 w-full sm:w-auto justify-center rounded-2xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 transition-all">
                View Pricing
              </Link>
            </motion.div>

            {/* Dashboard Preview Images */}
            <motion.div 
              variants={itemVariants} 
              className="mt-24 relative w-full max-w-6xl mx-auto"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-0)] via-transparent to-transparent z-20 h-full" />
              <div className="relative rounded-2xl border border-[var(--border-subtle)] overflow-hidden shadow-2xl shadow-purple-500/20 group">
                <img 
                  src="/ui-preview.webp" 
                  alt="HappyGen Studio Workspace" 
                  className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" 
                />
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="absolute bottom-10 right-10 rounded-2xl border border-[var(--border-subtle)] overflow-hidden shadow-2xl w-1/3 hidden md:block z-30"
                >
                  <img 
                    src="/models-explorer.webp" 
                    alt="Models Explorer" 
                    className="w-full h-auto object-cover" 
                  />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Engine Marquee */}
        <motion.div 
          className="mt-32 w-full"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="text-center mb-8">
            <h2 className="text-sm font-bold tracking-[0.2em] text-slate-500 uppercase">Powered by Industry-Leading AI Engines</h2>
          </div>
          <div className="flex flex-col antialiased items-center justify-center relative overflow-hidden w-full">
            {/* Added speed="slow" which maps to our new 160s duration */}
            <InfiniteMovingCards
              items={allEngines}
              direction="right"
              speed="slow"
              className="w-full max-w-[100vw]"
            />
          </div>
        </motion.div>
      </div>

      {/* Feature Section with Background Beams and Bento Grid */}
      <div className="relative w-full py-32 bg-[var(--surface-0)] border-t border-[var(--border-subtle)] overflow-hidden">
        <BackgroundBeams />
        
        <div className="relative z-10 w-full px-6 md:px-12 xl:px-24 mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Designed for Creators</h2>
            <p className="text-xl text-slate-400">Everything you need to build stunning assets without leaving your browser.</p>
          </div>

          <BentoGrid className="max-w-6xl mx-auto">
            <BentoGridItem
              title="Live CivitAI Integration"
              description="Instantly browse and stack thousands of base models and LoRAs directly from CivitAI. No manual downloads required."
              header={
                <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-purple-500/20 to-transparent border border-purple-500/10 items-center justify-center relative overflow-hidden group">
                  <Layers className="w-16 h-16 text-purple-400 group-hover:scale-110 transition-transform duration-500" />
                </div>
              }
              className="md:col-span-2"
            />
            <BentoGridItem
              title="Pro Inpainting & Canvas"
              description="Send generations to the infinite canvas. Erase mistakes, add new elements with text prompts, and mask with precision."
              header={
                <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-pink-500/20 to-transparent border border-pink-500/10 items-center justify-center relative overflow-hidden group">
                  <Brush className="w-16 h-16 text-pink-400 group-hover:scale-110 transition-transform duration-500" />
                </div>
              }
              className="md:col-span-1"
            />
            <BentoGridItem
              title="Isolated Asset Vaults"
              description="Organize your creations. Keep content locked behind secure partitions."
              header={
                <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-indigo-500/20 to-transparent border border-indigo-500/10 items-center justify-center relative overflow-hidden group">
                  <FolderOpen className="w-16 h-16 text-indigo-400 group-hover:scale-110 transition-transform duration-500" />
                </div>
              }
              className="md:col-span-1"
            />
            <BentoGridItem
              title="C2PA Verification"
              description="Every image generated includes cryptographic metadata to ensure transparency and authenticity for enterprise standards."
              header={
                <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-emerald-500/20 to-transparent border border-emerald-500/10 items-center justify-center relative overflow-hidden group">
                  <ShieldCheck className="w-16 h-16 text-emerald-400 group-hover:scale-110 transition-transform duration-500" />
                </div>
              }
              className="md:col-span-2"
            />
          </BentoGrid>
        </div>
      </div>
    </div>
  );
}
