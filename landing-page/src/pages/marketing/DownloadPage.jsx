import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Download, CheckCircle2, ArrowRight } from 'lucide-react';
import { BackgroundBeams } from '../../components/marketing/BackgroundBeams';

const AndroidIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
    <path d="M17.523 15.341c-.551 0-.999-.448-.999-1 0-.551.448-1 .999-1s1 .449 1 1c0 .552-.448 1-1 1m-11.046 0c-.551 0-.999-.448-.999-1 0-.551.448-1 .999-1s1 .449 1 1c0 .552-.448 1-1 1m11.405-6.02 1.997-3.46a.416.416 0 0 0-.152-.567.416.416 0 0 0-.568.152l-2.022 3.503c-1.554-.537-3.28-.824-5.137-.824-1.857 0-3.583.287-5.137.825L4.841 5.446a.416.416 0 0 0-.568-.152.416.416 0 0 0-.152.568l1.997 3.459C2.689 11.187.343 14.659 0 18.785h24c-.343-4.126-2.689-7.598-6.118-9.464" />
  </svg>
);

const WindowsIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
    <path d="M0 0h11.377v11.372H0zm12.623 0H24v11.372H12.623zM0 12.623h11.377V24H0zm12.623 0H24V24H12.623z" />
  </svg>
);

const AppleIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 1.01-2.87-.96.04-2.15.65-2.78 1.4-.55.65-1.04 1.72-.92 2.76 1.07.08 2.18-.54 2.69-1.29" />
  </svg>
);

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
    name: 'Android Mobile',
    subtitle: 'Android 8.0+ (ARM64 / x86_64)',
    description: 'Native mobile workstation with background render tasks, push notifications, and direct Camera Roll saving.',
    icon: AndroidIcon,
    color: 'emerald',
    iconBoxBg: 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400',
    cardHover: 'hover:border-emerald-500/40',
    btnClass: 'bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 hover:bg-emerald-500/25',
    downloadLabel: 'Download Direct APK (55.8 MB)',
    href: 'https://github.com/HappyNatsu10/HappyGen_Studio/releases/download/v2.0.0/HappyGen-Studio-v2.0.0.apk',
    downloadName: 'HappyGen-Studio-v2.0.0.apk',
    badge: 'APK READY',
    features: ['Direct APK Download', 'Background Generation Tasks', 'Native System Notifications', 'Biometric Vault (Face/Fingerprint)'],
  },
  {
    name: 'Windows Desktop',
    subtitle: 'Windows 10/11 (64-bit)',
    description: 'High-performance desktop workstation with native Nvidia CUDA, TensorRT, and 1-click Colab & Kaggle cloud GPU linking.',
    icon: WindowsIcon,
    color: 'blue',
    iconBoxBg: 'bg-blue-500/15 border border-blue-500/30 text-blue-400',
    cardHover: 'hover:border-blue-500/40',
    btnClass: 'bg-blue-500/15 border border-blue-500/25 text-blue-300 hover:bg-blue-500/25',
    downloadLabel: 'Download for Windows (.exe)',
    href: 'https://github.com/HappyNatsu10/HappyGen_Studio/releases/download/v2.0.0/HappyGen-Studio-Setup-v2.0.0.exe',
    badge: 'ELECTRON',
    features: ['Nvidia GPU Acceleration', 'System Tray & Native Shortcuts', 'Local Offline & Colab / Kaggle Cloud Modes'],
  },
  {
    name: 'iOS Package',
    subtitle: 'iOS 15+ (iPhone & iPad)',
    description: 'Native iOS application with biometric Face ID security, touch haptic gestures, and photo library integration.',
    icon: AppleIcon,
    color: 'purple',
    iconBoxBg: 'bg-purple-500/15 border border-purple-500/30 text-purple-400',
    cardHover: 'hover:border-purple-500/40',
    btnClass: 'bg-purple-500/15 border border-purple-500/25 text-purple-300 hover:bg-purple-500/25',
    downloadLabel: 'Download iOS Package (26.5 MB)',
    href: 'https://github.com/HappyNatsu10/HappyGen_Studio/releases/download/v2.0.0/HappyGen-Studio-iOS-v2.0.0.ipa',
    downloadName: 'HappyGen-Studio-iOS-v2.0.0.ipa',
    badge: 'IPA READY',
    features: ['Native Face ID Authentication', 'Photo Library Integration', 'Sideload via AltStore / Scarlet / Xcode'],
    comingSoon: false,
  },
  {
    name: 'macOS Desktop',
    subtitle: 'Apple Silicon (M1 / M2 / M3 / M4)',
    description: 'Optimized for Apple Silicon with native window styling, Metal acceleration, and Colab & Kaggle Cloud GPU link.',
    icon: AppleIcon,
    color: 'slate',
    iconBoxBg: 'bg-slate-500/15 border border-slate-500/30 text-slate-300',
    cardHover: 'hover:border-slate-500/40',
    btnClass: 'bg-slate-800/80 border border-slate-700 text-slate-200 hover:bg-slate-700',
    downloadLabel: 'Download for macOS (.dmg)',
    href: 'https://github.com/HappyNatsu10/HappyGen_Studio/releases/download/v2.0.0/HappyGen.Studio-2.0.0-arm64.dmg',
    features: ['Apple Silicon Optimized', 'Native macOS UI', 'Full Colab & Kaggle Cloud GPU Tunnel Link'],
    comingSoon: false,
  },
];

export default function DownloadPage() {
  return (
    <div className="relative min-h-screen pt-24 sm:pt-32 pb-16 sm:pb-24 overflow-hidden w-full">
      <BackgroundBeams />
      <div className="relative z-10 w-full px-3.5 sm:px-8 lg:px-12 xl:px-24 mx-auto max-w-6xl">
        
        {/* Header */}
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-10 sm:mb-16"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.p variants={fadeInUp} className="text-xs font-bold tracking-[0.25em] text-purple-400 uppercase mb-3 sm:mb-4">Download</motion.p>
          <motion.h1 variants={fadeInUp} className="text-3xl sm:text-5xl font-extrabold mb-3 sm:mb-6 text-white">
            Get HappyGen Studio
          </motion.h1>
          <motion.p variants={fadeInUp} className="text-sm sm:text-lg text-slate-400 px-1">
            Choose your platform and start generating in minutes. Every version is completely free.
          </motion.p>
        </motion.div>

        {/* Platform Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-12">
          {PLATFORMS.map((platform, i) => (
            <motion.div 
              key={platform.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 * i }}
              className={`p-5 sm:p-8 rounded-xl sm:rounded-2xl border ${platform.badge ? 'border-purple-500/25' : 'border-[var(--border-subtle)]'} bg-[var(--surface-1)]/60 backdrop-blur-sm group ${platform.cardHover || ''} transition-all duration-300 relative overflow-hidden`}
            >
              {platform.badge && (
                <div className="absolute top-4 right-4 bg-purple-500 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full">{platform.badge}</div>
              )}
              
              <div className="flex items-start gap-4 sm:gap-5 mb-4 sm:mb-6">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 ${platform.iconBoxBg} rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-md`}>
                  <platform.icon className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">{platform.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{platform.subtitle}</p>
                </div>
              </div>
              
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-5 sm:mb-6">{platform.description}</p>
              
              <ul className="space-y-2 mb-6">
                {platform.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              
              {platform.comingSoon ? (
                <div className="flex items-center justify-center gap-2 w-full py-3 sm:py-3.5 rounded-xl bg-slate-800/30 border border-slate-700/50 text-slate-500 font-semibold text-xs sm:text-sm cursor-not-allowed">
                  Coming soon
                </div>
              ) : (
                <a 
                  href={platform.href} 
                  download={platform.downloadName || undefined}
                  target={platform.downloadName ? undefined : "_blank"}
                  rel={platform.downloadName ? undefined : "noreferrer"}
                  className={`flex items-center justify-center gap-2 w-full py-3 sm:py-3.5 rounded-xl ${platform.btnClass} font-semibold text-xs sm:text-sm transition-all shadow-sm`}
                >
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
