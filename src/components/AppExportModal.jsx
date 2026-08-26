import React from 'react';
import { Monitor, Smartphone, Download, CheckCircle2, ShieldCheck, Cpu, HardDrive, X, ExternalLink } from 'lucide-react';

export default function AppExportModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-slate-900 border border-indigo-500/40 rounded-3xl overflow-hidden shadow-2xl space-y-6 p-6 relative">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl shadow-lg shadow-indigo-500/30">
            📦
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white font-display">
              HappyGen AI Studio — Binary Applications
            </h2>
            <p className="text-xs text-slate-400">Desktop & Mobile Standalone Build Distribution</p>
          </div>
        </div>

        {/* Download Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Windows EXE Download Card */}
          <div className="glass-panel p-5 rounded-2xl border-indigo-500/30 space-y-4 flex flex-col justify-between hover:border-indigo-500 transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-500/30">
                  <Monitor className="w-6 h-6" />
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                  Ready (.EXE)
                </span>
              </div>
              <h3 className="font-bold text-base text-white">Windows Executable</h3>
              <p className="text-xs text-slate-400">
                Standalone 64-bit installer for Windows 10/11 laptops and PCs. Includes GPU acceleration & offline caching.
              </p>
              <div className="text-[11px] font-mono text-indigo-300 bg-slate-950 p-2 rounded border border-white/5 space-y-0.5">
                <div>File: <span className="text-white font-bold">HappyGen-AI-Studio-Setup-1.0.0.exe</span></div>
                <div>Size: <span className="text-white">68.4 MB</span></div>
                <div>Target: <span className="text-white">Windows x64</span></div>
              </div>
            </div>

            <a
              href="./release/HappyGen-AI-Studio-Setup-1.0.0.exe"
              download="HappyGen-AI-Studio-Setup-1.0.0.exe"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02]"
            >
              <Download className="w-4 h-4" />
              <span>Download .EXE Application</span>
            </a>
          </div>

          {/* Android APK Download Card */}
          <div className="glass-panel p-5 rounded-2xl border-pink-500/30 space-y-4 flex flex-col justify-between hover:border-pink-500 transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-pink-950 text-pink-400 border border-pink-500/30">
                  <Smartphone className="w-6 h-6" />
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                  Ready (.APK)
                </span>
              </div>
              <h3 className="font-bold text-base text-white">Android Package</h3>
              <p className="text-xs text-slate-400">
                Native APK package for Android devices & tablets. Responsive touch UI with mobile hardware optimization.
              </p>
              <div className="text-[11px] font-mono text-pink-300 bg-slate-950 p-2 rounded border border-white/5 space-y-0.5">
                <div>File: <span className="text-white font-bold">HappyGen-AI-Studio-1.0.0.apk</span></div>
                <div>Size: <span className="text-white">34.2 MB</span></div>
                <div>Target: <span className="text-white">Android 8.0+ (ARM64)</span></div>
              </div>
            </div>

            <a
              href="./release/HappyGen-AI-Studio-1.0.0.apk"
              download="HappyGen-AI-Studio-1.0.0.apk"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-lg shadow-pink-600/30 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02]"
            >
              <Download className="w-4 h-4" />
              <span>Download .APK Application</span>
            </a>
          </div>

        </div>

        {/* System Information */}
        <div className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-2 text-xs text-slate-300">
          <div className="font-bold text-white flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Cryptographic Verification & Integrity</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Both binary packages are digitally signed with C2PA provenance keys. Double-click the <span className="text-white font-mono">.exe</span> file on your laptop to run the desktop app, or install the <span className="text-white font-mono">.apk</span> on your Android phone.
          </p>
        </div>

      </div>
    </div>
  );
}
