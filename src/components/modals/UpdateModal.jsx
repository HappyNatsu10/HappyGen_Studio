import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUpdateStore } from '../../store/useUpdateStore';
import { 
  Sparkles, 
  DownloadCloud, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  HardDrive, 
  RotateCw, 
  Zap, 
  ChevronRight,
  Layers,
  Wrench,
  Check
} from 'lucide-react';

export default function UpdateModal() {
  const { t } = useTranslation();
  const { 
    showModal, 
    modalMode, 
    releaseInfo, 
    currentVersion, 
    latestVersion, 
    installing, 
    installProgress, 
    installStatusText, 
    startInstall, 
    closeModal 
  } = useUpdateStore();

  const [activeTab, setActiveTab] = useState('highlights');

  if (!showModal || !releaseInfo) return null;

  const whatsNew = releaseInfo.whatsNew || {};
  const isPostInstall = modalMode === 'post-install';
  const isInstalling = modalMode === 'installing';

  const summaryText = t('updates.v2Summary', whatsNew.summary || t('updates.summaryDefault', 'Explore the newest features, enhancements, and optimizations.'));

  const highlightsList = [
    t('updates.h1', whatsNew.highlights?.[0] || 'Turbo Inpainting & Adetailer v2 with real-time brush control'),
    t('updates.h2', whatsNew.highlights?.[1] || '4K Super-Resolution image upscaling and restoration'),
    t('updates.h3', whatsNew.highlights?.[2] || 'Native Android app support with background generation'),
    t('updates.h4', whatsNew.highlights?.[3] || 'Full offline-first Guest Mode for instant creations'),
    t('updates.h5', whatsNew.highlights?.[4] || 'Direct Gallery Save on Android without black frame artifacts')
  ];

  const featuresList = [
    t('updates.f1', 'CivitAI Model Discovery: browse and load thousands of checkpoints, LoRAs, and embeddings'),
    t('updates.f2', 'Canvas & Inpaint Studio: feathering brush and smart edge preservation'),
    t('updates.f3', 'Advanced Prompt Studio with style presets and negative prompt vault')
  ];

  const fixesList = [
    t('updates.fix1', 'Resolved Android gallery save issue that created empty black files'),
    t('updates.fix2', 'Optimized notification permissions on Android 13+'),
    t('updates.fix3', 'Removed web popups to ensure seamless mobile WebView authentication')
  ];

  const getStatusText = () => {
    if (!installStatusText) return t('updates.downloadingProgress', 'Processing update package...');
    if (installStatusText.startsWith('Downloading:')) return installStatusText;
    if (installProgress < 30) return t('updates.statusConnecting', installStatusText);
    if (installProgress < 92) return t('updates.statusDownloading', installStatusText);
    if (installProgress < 98) return t('updates.statusVerifying', installStatusText);
    return t('updates.statusLaunching', installStatusText);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{ 
          background: 'var(--surface-0, #0c0d14)', 
          borderColor: 'var(--border-subtle, rgba(255,255,255,0.1))' 
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gradient Accent Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b flex items-start justify-between" style={{ borderColor: 'var(--border-subtle, rgba(255,255,255,0.08))' }}>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase flex items-center gap-1.5 ${
                isPostInstall 
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                  : isInstalling 
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
              }`}>
                {isPostInstall ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    {t('updates.badgeUpdated', 'Successfully Updated')}
                  </>
                ) : isInstalling ? (
                  <>
                    <RotateCw className="w-3 h-3 text-amber-400 animate-spin" />
                    {t('updates.badgeInstalling', 'Installing Update')}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    {t('updates.badgeNew', 'New Update Available')}
                  </>
                )}
              </span>
              <span className="text-[12px] font-medium text-slate-400">
                v{releaseInfo.version || latestVersion}
              </span>
            </div>

            <h2 className="text-[18px] font-bold tracking-tight text-white">
              {isPostInstall
                ? `${t('updates.whatsNewIn', "What's New in")} HappyGen Studio v${releaseInfo.version || latestVersion}`
                : isInstalling
                ? `${t('updates.installingTitle', 'Installing HappyGen Studio')} v${releaseInfo.version || latestVersion}`
                : t('updates.releaseTitle', releaseInfo.releaseName || `HappyGen Studio v${releaseInfo.version || latestVersion}`)}
            </h2>

            {!isInstalling && (
              <p className="text-[12px] text-slate-400 line-clamp-2">
                {summaryText}
              </p>
            )}
          </div>

          {!isInstalling && (
            <button 
              onClick={closeModal}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Metadata pill bar (Version, Date, Size) */}
          {!isInstalling && (
            <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl border text-[11px]"
              style={{ background: 'var(--surface-1, rgba(255,255,255,0.03))', borderColor: 'var(--border-subtle, rgba(255,255,255,0.06))' }}>
              <div className="flex items-center gap-2 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase tracking-wider">{t('updates.installed', 'Installed')}</span>
                  <span className="font-medium text-slate-300">v{currentVersion}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase tracking-wider">{t('updates.released', 'Released')}</span>
                  <span className="font-medium text-slate-300">{releaseInfo.releaseDate || t('updates.recent', 'Recent')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <HardDrive className="w-3.5 h-3.5 text-pink-400" />
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase tracking-wider">{t('updates.packageSize', 'Size')}</span>
                  <span className="font-medium text-slate-300">{releaseInfo.downloadSize || '27.6 MB'}</span>
                </div>
              </div>
            </div>
          )}

          {/* INSTALLING STATE */}
          {isInstalling ? (
            <div className="py-8 space-y-6 text-center">
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping opacity-60" />
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <DownloadCloud className="w-8 h-8 text-white animate-bounce" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[28px] font-extrabold text-white tracking-tight">
                  {installProgress}%
                </div>
                <div className="text-[13px] font-medium text-indigo-300">
                  {getStatusText()}
                </div>
                <p className="text-[11px] text-slate-400">
                  {t('updates.keepAppOpen', 'Please keep the studio open while the update installs.')}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden border border-white/5">
                <div 
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-300 shadow-md shadow-indigo-500/50"
                  style={{ width: `${installProgress}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 text-[10px] text-slate-400">
                <div className={`p-2 rounded-lg border ${installProgress >= 30 ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-300' : 'border-white/5'}`}>
                  {t('updates.step1', '1. Stream Package')}
                </div>
                <div className={`p-2 rounded-lg border ${installProgress >= 70 ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-300' : 'border-white/5'}`}>
                  {t('updates.step2', '2. Verify & Cache')}
                </div>
                <div className={`p-2 rounded-lg border ${installProgress >= 100 ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-300' : 'border-white/5'}`}>
                  {t('updates.step3', '3. Launch Installer')}
                </div>
              </div>
            </div>
          ) : (
            /* WHAT'S NEW SECTION (Both Before & After Install) */
            <div className="space-y-4">
              {/* Category tabs */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/5 text-[12px]">
                <button
                  type="button"
                  onClick={() => setActiveTab('highlights')}
                  className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'highlights' 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {t('updates.tabHighlights', 'Highlights')}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('features')}
                  className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'features' 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  {t('updates.tabFeatures', 'Features')}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('fixes')}
                  className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'fixes' 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  {t('updates.tabFixes', 'Fixes')}
                </button>
              </div>

              {/* Tab: Highlights */}
              {activeTab === 'highlights' && (
                <div className="space-y-2.5 animate-in fade-in duration-150">
                  {highlightsList.map((highlight, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-start gap-3 p-3 rounded-xl border transition-colors hover:border-indigo-500/30"
                      style={{ background: 'var(--surface-1, rgba(255,255,255,0.02))', borderColor: 'var(--border-subtle, rgba(255,255,255,0.06))' }}
                    >
                      <div className="w-6 h-6 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 text-indigo-400" />
                      </div>
                      <div className="text-[12px] text-slate-200 leading-relaxed font-medium">
                        {highlight}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab: Features */}
              {activeTab === 'features' && (
                <div className="space-y-2.5 animate-in fade-in duration-150">
                  {featuresList.map((item, idx) => (
                    <div 
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-xl border"
                      style={{ background: 'var(--surface-1, rgba(255,255,255,0.02))', borderColor: 'var(--border-subtle, rgba(255,255,255,0.06))' }}
                    >
                      <div className="w-6 h-6 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shrink-0 mt-0.5">
                        <Zap className="w-3.5 h-3.5 text-purple-400" />
                      </div>
                      <div className="text-[12px] text-slate-200 leading-relaxed">
                        {item}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab: Fixes */}
              {activeTab === 'fixes' && (
                <div className="space-y-2.5 animate-in fade-in duration-150">
                  {fixesList.map((fix, idx) => (
                    <div 
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-xl border"
                      style={{ background: 'var(--surface-1, rgba(255,255,255,0.02))', borderColor: 'var(--border-subtle, rgba(255,255,255,0.06))' }}
                    >
                      <div className="w-6 h-6 rounded-lg bg-pink-500/15 border border-pink-500/30 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-pink-400" />
                      </div>
                      <div className="text-[12px] text-slate-200 leading-relaxed">
                        {fix}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t flex items-center justify-between gap-3" style={{ borderColor: 'var(--border-subtle, rgba(255,255,255,0.08))', background: 'var(--surface-1, rgba(255,255,255,0.02))' }}>
          {isPostInstall ? (
            <div className="w-full flex items-center justify-between gap-3">
              <span className="text-[12px] text-emerald-400 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                {t('updates.readyToCreate', 'You are running the newest version')}
              </span>
              <button
                type="button"
                onClick={closeModal}
                className="btn btn-primary px-5 py-2 text-[13px] font-semibold cursor-pointer flex items-center gap-2"
              >
                {t('updates.startCreating', 'Start Creating')}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : isInstalling ? (
            <div className="w-full text-center text-[12px] text-slate-400 py-1">
              {t('updates.applyingUpdate', 'Applying in-app update... Please wait')}
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={closeModal}
                className="btn btn-ghost px-4 py-2 text-[13px] text-slate-400 hover:text-white cursor-pointer"
              >
                {t('updates.remindLater', 'Remind Later')}
              </button>

              <button
                type="button"
                onClick={startInstall}
                className="btn btn-primary px-6 py-2.5 text-[13px] font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 cursor-pointer"
              >
                <DownloadCloud className="w-4 h-4" />
                {t('updates.installNow', 'Install Update in App')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
