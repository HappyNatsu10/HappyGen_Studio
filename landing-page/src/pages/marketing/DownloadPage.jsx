import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Download, Monitor, Smartphone, Globe, CheckCircle2, ArrowRight } from 'lucide-react';
import { BackgroundBeams } from '../../components/marketing/BackgroundBeams';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const PLATFORMS = [
  {
    name: 'Windows',
    subtitle: 'Windows 10/11 (x64)',
    description: 'Full desktop experience with native GPU acceleration for Nvidia GPUs. Electron-based for a smooth, native feel.',
    icon: Monitor,
    color: 'blue',
    downloadLabel: 'Download .exe',
    href: '#',
    features: ['Local GPU Support', 'Auto-Updates', 'System Tray Integration'],
  },
  {
    name: 'macOS',
    subtitle: 'Apple Silicon (M1/M2/M3+)',
    description: 'Optimized for Apple Silicon chips. Beautiful native window management and smooth scrolling.',
    icon: Monitor,
    color: 'slate',
    downloadLabel: 'Download .dmg',
    href: '#',
    features: ['Apple Silicon Optimized', 'Native macOS UI', 'Spotlight Support'],
    comingSoon: true,
  },
  {
    name: 'Android',
    subtitle: 'Android 8.0+',
    description: 'Generate art on the go. Save directly to your gallery and share instantly. Full feature parity with the web version.',
    icon: Smartphone,
    color: 'purple',
    downloadLabel: 'Google Play',
    href: '#',
    badge: 'NEW',
    features: ['Gallery Save', 'Share to Apps', 'Offline Gallery'],
  },
  {
    name: 'iOS',
    subtitle: 'iOS 15+',
    description: 'Designed for iPhone and iPad. Optimized touch interface with native haptic feedback and smooth gestures.',
    icon: Smartphone,
    color: 'purple',
    downloadLabel: 'App Store',
    href: '#',
    badge: 'NEW',
    features: ['iPad Support', 'Haptic Feedback', 'iCloud Sync'],
    comingSoon: true,
  },
];

export default function DownloadPage() {
  return (
    <div className="relative min-h-screen pt-32 pb-24 overflow-hidden w-full">
      <BackgroundBeams />
      <div className="relative z-10 w-full px-6 md:px-12 xl:px-24 mx-auto max-w-6xl">
        
        {/* Header */}
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.p variants={fadeInUp} className="text-xs font-bold tracking-[0.25em] text-purple-400 uppercase mb-4">Download</motion.p>
          <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl font-extrabold mb-6 text-white">
            Get HappyGen Studio
          </motion.h1>
          <motion.p variants={fadeInUp} className="text-lg text-slate-400">
            Choose your platform and start generating in minutes. Every version is completely free.
          </motion.p>
        </motion.div>

        {/* Platform Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {PLATFORMS.map((platform, i) => (
            <motion.div 
              key={platform.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 * i }}
              className={`p-8 rounded-2xl border ${platform.badge ? 'border-purple-500/25' : 'border-[var(--border-subtle)]'} bg-[var(--surface-1)]/60 backdrop-blur-sm group hover:border-${platform.color}-500/40 transition-all duration-300 relative overflow-hidden`}
            >
              {platform.badge && (
                <div className="absolute top-4 right-4 bg-purple-500 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full">{platform.badge}</div>
              )}
              
              <div className="flex items-start gap-5 mb-6">
                <div className={`w-14 h-14 bg-${platform.color}-500/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <platform.icon className={`w-7 h-7 text-${platform.color}-400`} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{platform.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{platform.subtitle}</p>
                </div>
              </div>
              
              <p className="text-sm text-slate-400 leading-relaxed mb-6">{platform.description}</p>
              
              <ul className="space-y-2 mb-6">
                {platform.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              
              {platform.comingSoon ? (
                <div className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-slate-800/30 border border-slate-700/50 text-slate-500 font-semibold text-sm cursor-not-allowed">
                  Coming soon
                </div>
              ) : (
                <a href={platform.href} className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-${platform.color}-500/15 border border-${platform.color}-500/25 text-${platform.color}-300 font-semibold text-sm hover:bg-${platform.color}-500/25 transition-colors`}>
                  <Download className="w-4 h-4" />
                  {platform.downloadLabel}
                </a>
              )}
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
