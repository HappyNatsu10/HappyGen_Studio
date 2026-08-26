import React from 'react';
import { motion } from 'framer-motion';
import { Download, Monitor, Smartphone, Apple } from 'lucide-react';
import { BackgroundBeams } from '../../components/marketing/BackgroundBeams';

export default function DownloadPage() {
  return (
    <div className="relative min-h-screen pt-32 pb-24 overflow-hidden w-full">
      <BackgroundBeams />
      <div className="relative z-10 w-full px-6 md:px-12 xl:px-24 mx-auto max-w-[1600px]">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold mb-6 text-white drop-shadow-lg"
          >
            Download HappyGen Studio
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-300"
          >
            Experience the full power of native workstation performance or take the studio on the go.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Windows */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-panel p-10 rounded-[22px] border border-[var(--border-subtle)] bg-[var(--surface-1)]/60 backdrop-blur-sm shadow-xl text-center group"
          >
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Monitor className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Windows (x64)</h3>
            <p className="text-sm text-slate-400 mb-6">Requires Windows 10/11. Local GPU acceleration available for Nvidia cards.</p>
            <button className="btn btn-secondary w-full py-3 rounded-xl flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> Download .exe
            </button>
          </motion.div>

          {/* Mac */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="glass-panel p-10 rounded-[22px] border border-[var(--border-subtle)] bg-[var(--surface-1)]/60 backdrop-blur-sm shadow-xl text-center group"
          >
            <div className="w-16 h-16 bg-slate-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Apple className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">macOS (Apple Silicon)</h3>
            <p className="text-sm text-slate-400 mb-6">Optimized for M1/M2/M3 chips. Requires macOS 12+.</p>
            <button className="btn btn-secondary w-full py-3 rounded-xl flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> Download .dmg
            </button>
          </motion.div>

          {/* Mobile */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="glass-panel p-10 rounded-[22px] border border-purple-500/30 bg-[var(--surface-1)]/60 backdrop-blur-sm shadow-xl text-center group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-purple-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">NEW</div>
            <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Smartphone className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Mobile App</h3>
            <p className="text-sm text-slate-400 mb-6">Generate on the go. Available for iOS and Android.</p>
            <div className="flex gap-2">
              <button className="btn btn-primary w-full py-2.5 rounded-xl text-sm">App Store</button>
              <button className="btn btn-primary w-full py-2.5 rounded-xl text-sm">Google Play</button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
