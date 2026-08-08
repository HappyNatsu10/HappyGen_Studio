import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Shield, Lock, Unlock, Download, Video, Server, User, UserPlus, LogIn } from 'lucide-react';

export default function Navbar({
  isAdultMode,
  onToggleAdultMode,
  isVerifiedAdult,
  onOpenVerifyModal,
  onOpenExportModal,
  onOpenBackendModal,
  onOpenProfileModal,
  activeTab,
  setActiveTab
}) {
  const { currentUser, isAuthenticated, openAuth } = useAuth();

  return (
    <header className={`sticky top-0 z-40 border-b backdrop-blur-xl transition-all duration-500 ${
      isAdultMode 
        ? 'bg-[#14060b]/90 border-rose-900/40 text-rose-100 shadow-[0_4px_30px_rgba(225,29,72,0.15)]' 
        : 'bg-[#0b0c16]/90 border-white/10 text-slate-100 shadow-[0_4px_30px_rgba(99,102,241,0.1)]'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('image')}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg transition-transform hover:scale-105 ${
            isAdultMode 
              ? 'bg-gradient-to-tr from-rose-600 via-red-500 to-pink-500 text-white shadow-rose-600/40' 
              : 'bg-gradient-to-tr from-indigo-600 via-purple-500 to-blue-500 text-white shadow-indigo-500/40'
          }`}>
            {isAdultMode ? '🔥' : '✨'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-display font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                OmniGen <span className={isAdultMode ? 'text-rose-400' : 'text-indigo-400'}>Studio</span>
              </span>
              {isAdultMode && (
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-rose-950/80 text-rose-300 border border-rose-600/50 rounded-full animate-pulse">
                  18+ Adult Mode
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Multi-Style AI Image & Video Platform</p>
          </div>
        </div>

        {/* Navigation Tabs (Desktop) */}
        <nav className="hidden md:flex items-center space-x-1 bg-slate-900/60 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab('image')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'image'
                ? (isAdultMode ? 'bg-rose-600 text-white shadow-md' : 'bg-indigo-600 text-white shadow-md')
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            Image Studio
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer ${
              activeTab === 'video'
                ? (isAdultMode ? 'bg-rose-600 text-white shadow-md' : 'bg-indigo-600 text-white shadow-md')
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Video className="w-3.5 h-3.5 mr-1" />
            Video Suite
          </button>
          <button
            onClick={() => setActiveTab('canvas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'canvas'
                ? (isAdultMode ? 'bg-rose-600 text-white shadow-md' : 'bg-indigo-600 text-white shadow-md')
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            Inpaint Canvas
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'gallery'
                ? (isAdultMode ? 'bg-rose-600 text-white shadow-md' : 'bg-indigo-600 text-white shadow-md')
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            Projects
          </button>
          <button
            onClick={() => setActiveTab('safety')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer ${
              activeTab === 'safety'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Safety</span>
          </button>
        </nav>

        {/* Right Controls: User Account, Adult Toggle, API Config, App Export */}
        <div className="flex items-center space-x-2.5">
          
          {/* API Server Config Button */}
          <button
            onClick={onOpenBackendModal}
            className="flex items-center space-x-1.5 bg-slate-900/80 hover:bg-slate-800 text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            title="Configure Backend Inference Server API"
          >
            <Server className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden xl:inline">API Server</span>
          </button>

          {/* Adult 18+ Mode Toggle Switch */}
          <div className="flex items-center space-x-2 bg-slate-900/80 px-2.5 py-1.5 rounded-xl border border-white/10">
            <span className="text-[11px] font-bold tracking-wide text-slate-300 hidden sm:inline">
              18+ Mode
            </span>
            <button
              onClick={() => {
                if (!isVerifiedAdult) {
                  onOpenVerifyModal();
                } else {
                  onToggleAdultMode(!isAdultMode);
                }
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                isAdultMode ? 'bg-rose-600' : 'bg-slate-700'
              }`}
              title={isVerifiedAdult ? 'Toggle Adult Mode' : 'Identity Verification Required'}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAdultMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            {isVerifiedAdult ? (
              <Unlock className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-slate-500" />
            )}
          </div>

          {/* User Account Button */}
          {isAuthenticated && currentUser ? (
            <button
              onClick={onOpenProfileModal}
              className="flex items-center space-x-2 bg-slate-900/80 hover:bg-slate-800 border border-indigo-500/40 p-1 pr-3 rounded-2xl transition-all cursor-pointer shadow-md hover:scale-105"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-xl object-cover border border-white/20"
              />
              <div className="text-left hidden sm:block">
                <div className="text-[11px] font-bold text-white leading-tight truncate max-w-[80px]">
                  {currentUser.name}
                </div>
                <div className="text-[9px] text-amber-400 font-mono font-bold">
                  {currentUser.credits ?? 150} pts
                </div>
              </div>
            </button>
          ) : (
            <div className="flex items-center space-x-1">
              <button
                onClick={() => openAuth('login')}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-white/10 cursor-pointer transition-all"
              >
                <LogIn className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
              <button
                onClick={() => openAuth('signup')}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register</span>
              </button>
            </div>
          )}

          {/* Download App (.EXE / .APK) Button */}
          <button
            onClick={onOpenExportModal}
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Get App</span>
          </button>
        </div>

      </div>
    </header>
  );
}
