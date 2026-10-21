import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, Monitor, Smartphone, Apple, CheckCircle2, 
  QrCode, HardDrive, Cpu, Shield, ArrowDownToLine, ExternalLink 
} from 'lucide-react';

export function DownloadHub() {
  const [detectedOS, setDetectedOS] = useState('windows');
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = window.navigator.userAgent.toLowerCase();
      if (ua.includes('android')) {
        setDetectedOS('android');
      } else if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
        setDetectedOS('ios');
      } else if (ua.includes('mac')) {
        setDetectedOS('macos');
      } else if (ua.includes('win')) {
        setDetectedOS('windows');
      }
    }
  }, []);

  return (
    <div id="download" className="w-full max-w-[1600px] mx-auto my-12 sm:my-20 px-3.5 sm:px-6 lg:px-8 scroll-mt-24">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 mb-3 sm:mb-4">
          <Download className="w-3.5 h-3.5" />
          <span>Official Release Downloads • 100% Free & Open</span>
        </div>
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-3 sm:mb-4 leading-tight">
          Download HappyGen Studio. <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
            For Your Operating System.
          </span>
        </h2>
        <p className="text-xs sm:text-base text-slate-400 px-1">
          Native desktop and mobile workstation binaries. Download the installer or direct mobile package below and begin creating without limitations.
        </p>
      </div>

      {/* Platform Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10 sm:mb-16">
        
        {/* 1. Android Card */}
        <div className={`p-5 sm:p-6 rounded-2xl sm:rounded-3xl border flex flex-col justify-between transition-all duration-300 relative text-left ${
          detectedOS === 'android'
            ? 'bg-slate-900 border-indigo-500/60 shadow-2xl shadow-indigo-500/10 scale-[1.02]'
            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xl">
                🤖
              </div>
              <div className="flex items-center gap-1.5">
                {detectedOS === 'android' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Your Device
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                  APK Ready
                </span>
              </div>
            </div>

            <h3 className="text-lg font-bold text-white mb-1">Android Mobile</h3>
            <p className="text-xs text-slate-400 mb-4">Android 8.0+ (ARM64 / x86_64)</p>
            
            <ul className="text-xs text-slate-400 space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Background generation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Direct Camera Roll saving</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Biometric Face & Fingerprint lock</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <a
              href="/downloads/happygen-studio-android.apk"
              download="happygen-studio-android.apk"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span>Download Direct APK (27.6 MB)</span>
            </a>

            <button
              onClick={() => setShowQR(!showQR)}
              className="w-full py-2 px-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <QrCode className="w-3.5 h-3.5 text-slate-400" />
              <span>{showQR ? 'Hide Mobile QR Code' : 'Scan QR on Mobile'}</span>
            </button>

            {showQR && (
              <div className="p-3 bg-white rounded-xl flex flex-col items-center justify-center animate-in fade-in">
                {/* Clean SVG QR Code */}
                <svg className="w-28 h-28" viewBox="0 0 100 100">
                  <path d="M0,0 h30 v30 h-30 z M40,0 h20 v10 h-20 z M70,0 h30 v30 h-30 z M0,40 h10 v20 h-10 z M20,40 h20 v20 h-20 z M50,40 h10 v10 h-10 z M70,40 h30 v10 h-30 z M0,70 h30 v30 h-30 z M40,70 h20 v30 h-20 z M70,70 h30 v30 h-30 z" fill="#0f172a" />
                  <rect x="5" y="5" width="20" height="20" fill="white" />
                  <rect x="10" y="10" width="10" height="10" fill="#0f172a" />
                  <rect x="75" y="5" width="20" height="20" fill="white" />
                  <rect x="80" y="10" width="10" height="10" fill="#0f172a" />
                  <rect x="5" y="75" width="20" height="20" fill="white" />
                  <rect x="10" y="80" width="10" height="10" fill="#0f172a" />
                </svg>
                <span className="text-[10px] text-slate-800 font-bold mt-1">Scan to install APK</span>
              </div>
            )}
          </div>
        </div>

        {/* 2. Windows Desktop */}
        <div className={`p-6 rounded-3xl border flex flex-col justify-between transition-all duration-300 relative text-left ${
          detectedOS === 'windows'
            ? 'bg-slate-900 border-indigo-500/60 shadow-2xl shadow-indigo-500/10 scale-[1.02]'
            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xl">
                🪟
              </div>
              <div className="flex items-center gap-1.5">
                {detectedOS === 'windows' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Your Device
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400">
                  Electron
                </span>
              </div>
            </div>

            <h3 className="text-lg font-bold text-white mb-1">Windows Workstation</h3>
            <p className="text-xs text-slate-400 mb-4">Windows 10 / 11 (64-bit)</p>
            
            <ul className="text-xs text-slate-400 space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                <span>Nvidia CUDA & TensorRT acceleration</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                <span>1-Click Colab, Kaggle & Local GPU</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                <span>System tray & native shortcuts</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <a
              href="https://github.com/HappyNatsu10/HappyGen_Studio/releases"
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span>Download for Windows (.exe)</span>
            </a>
            <div className="text-[10px] text-center text-slate-500">NSIS Installer & Portable Builds</div>
          </div>
        </div>

        {/* 3. iOS Package */}
        <div className={`p-6 rounded-3xl border flex flex-col justify-between transition-all duration-300 relative text-left ${
          detectedOS === 'ios'
            ? 'bg-slate-900 border-indigo-500/60 shadow-2xl shadow-indigo-500/10 scale-[1.02]'
            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 text-xl">
                🍎
              </div>
              <div className="flex items-center gap-1.5">
                {detectedOS === 'ios' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Your Device
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400">
                  IPA Ready
                </span>
              </div>
            </div>

            <h3 className="text-lg font-bold text-white mb-1">iOS Package</h3>
            <p className="text-xs text-slate-400 mb-4">iOS 15.0+ (iPhone & iPad)</p>
            
            <ul className="text-xs text-slate-400 space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                <span>Native Face ID Authentication</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                <span>Photo Library direct saving</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                <span>Responsive iPad split layout</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <a
              href="/downloads/happygen-studio-ios.ipa"
              download="happygen-studio-ios.ipa"
              className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 transition-all"
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span>Download iOS Package (21.7 MB)</span>
            </a>
            <div className="text-[10px] text-center text-slate-500">Sideload via AltStore / Scarlet / Xcode</div>
          </div>
        </div>

        {/* 4. macOS Desktop */}
        <div className={`p-6 rounded-3xl border flex flex-col justify-between transition-all duration-300 relative text-left ${
          detectedOS === 'macos'
            ? 'bg-slate-900 border-indigo-500/60 shadow-2xl shadow-indigo-500/10 scale-[1.02]'
            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-500/15 border border-slate-500/30 flex items-center justify-center text-slate-300 text-xl">
                💻
              </div>
              <div className="flex items-center gap-1.5">
                {detectedOS === 'macos' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Your Device
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-slate-300">
                  Apple Silicon
                </span>
              </div>
            </div>

            <h3 className="text-lg font-bold text-white mb-1">macOS Desktop</h3>
            <p className="text-xs text-slate-400 mb-4">macOS 12.0+ (M1 / M2 / M3 / M4)</p>
            
            <ul className="text-xs text-slate-400 space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>Apple Silicon Metal acceleration</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>Native macOS window styling</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>Full Colab & Kaggle Cloud GPU tunnel</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <a
              href="https://github.com/HappyNatsu10/HappyGen_Studio/releases"
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              <span>macOS Releases (.dmg)</span>
            </a>
            <div className="text-[10px] text-center text-slate-500">Direct DMG & Homebrew Support</div>
          </div>
        </div>

      </div>

      {/* System Requirements Note */}
      <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-slate-900/60 border border-slate-800 text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <Cpu className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400 flex-shrink-0 mt-0.5 sm:mt-0" />
          <div className="text-xs">
            <span className="font-bold text-white">Recommended Specs: </span>
            <span className="text-slate-400">Nvidia RTX 3060+ (8GB VRAM) for local rendering, OR any basic laptop / smartphone when connected to free Google Colab & Kaggle cloud GPUs.</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-mono text-emerald-400 flex-shrink-0">
          <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Open Source & Virus-Checked</span>
        </div>
      </div>

    </div>
  );
}
