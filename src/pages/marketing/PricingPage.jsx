import React, { useEffect, useRef } from 'react';
import { Check, Star, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { BackgroundGradient } from '../../components/marketing/BackgroundGradient';

export default function PricingPage() {
  const bgRef = useRef(null);

  useEffect(() => {
    gsap.to(bgRef.current, {
      y: 40,
      rotation: 5,
      duration: 6,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  }, []);

  return (
    <div className="relative w-full pt-32 pb-24 overflow-hidden">
      <div ref={bgRef} className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-[150px] mix-blend-screen pointer-events-none" />
      
      <div className="relative z-10 w-full px-6 md:px-12 xl:px-24 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold mb-6 text-white"
          >
            Simple, Transparent Pricing
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-400"
          >
            Start creating for free, upgrade when you need more power and speed.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Tier */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel p-10 rounded-[22px] border border-[var(--border-subtle)] bg-[var(--surface-1)]/80"
          >
            <h3 className="text-2xl font-bold mb-2 text-white">Starter</h3>
            <p className="text-slate-400 mb-6">Perfect for exploring and casual generation.</p>
            <div className="mb-8">
              <span className="text-5xl font-extrabold text-white">$0</span>
              <span className="text-slate-400">/forever</span>
            </div>
            <ul className="space-y-4 mb-8">
              {['100 daily credits', 'Standard generation speed', 'Basic models (SD 1.5, SDXL)', 'Public gallery'].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300">
                  <Check className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button className="btn btn-secondary w-full py-4 rounded-xl border border-slate-700 font-semibold text-lg hover:bg-[var(--surface-3)] transition-colors">Get Started Free</button>
          </motion.div>

          {/* Pro Tier */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="h-full flex"
          >
            <BackgroundGradient containerClassName="h-full flex flex-col w-full" className="rounded-[22px] p-10 bg-[var(--surface-1)] sm:p-10 h-full flex flex-col">
              <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl rounded-tr-[22px] z-10">POPULAR</div>
              
              <h3 className="text-2xl font-bold mb-2 text-white flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-400 fill-current" /> Pro Creator
              </h3>
              <p className="text-purple-200/70 mb-6">For professionals and heavy workflows.</p>
              <div className="mb-8">
                <span className="text-5xl font-extrabold text-white">$19</span>
                <span className="text-slate-400">/month</span>
              </div>
              <ul className="space-y-4 mb-8 relative z-10 flex-grow">
                {['Unlimited generation', 'Priority GPU queue (Lightning fast)', 'Premium models (Flux.1, Sora)', 'Private vaults & 18+ mode', 'API Access'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-200">
                    <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button className="btn btn-primary btn-primary-glow w-full py-4 rounded-xl relative z-10 font-semibold text-lg mt-auto">Subscribe Now</button>
            </BackgroundGradient>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
