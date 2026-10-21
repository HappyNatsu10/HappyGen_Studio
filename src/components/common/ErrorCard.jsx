import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Lightbulb, 
  X, 
  Copy, 
  Check, 
  MessageSquare, 
  Settings, 
  Terminal, 
  RotateCw, 
  ChevronDown, 
  ChevronUp,
  Cpu,
  WifiOff
} from 'lucide-react';
import { parseAppError } from '../../utils/errorHandler';
import useAppStore from '../../store/useAppStore';

export default function ErrorCard({ 
  error, 
  onDismiss, 
  onRetry,
  compact = false, 
  className = '' 
}) {
  const [copied, setCopied] = useState(false);
  const [showFullDevDetails, setShowFullDevDetails] = useState(true);
  const { setShowBackendModal, openFeedbackModal, setActiveTab } = useAppStore();

  if (!error) return null;

  const parsed = parseAppError(error);
  if (!parsed) return null;

  const handleCopyStack = () => {
    const textToCopy = `Error: ${parsed.rawError}\n\nStack:\n${parsed.rawStack || 'No stack trace available'}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReport = () => {
    const reportTemplate = `[Automated Error Report]\n\nType: ${parsed.type}\nTitle: ${parsed.title}\nMessage: ${parsed.rawError}\n\nStack:\n${parsed.rawStack || 'N/A'}`;
    if (openFeedbackModal) {
      openFeedbackModal(reportTemplate);
    } else {
      useAppStore.getState().setShowFeedbackModal?.(true);
    }
  };

  const getIcon = () => {
    switch (parsed.type) {
      case 'gpu_oom':
        return <Cpu className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />;
      case 'backend_offline':
        return <WifiOff className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div 
      className={`rounded-xl border overflow-hidden transition-all duration-200 animate-in fade-in ${className}`}
      style={{
        background: 'rgba(239, 68, 68, 0.04)',
        borderColor: 'rgba(239, 68, 68, 0.25)',
      }}
    >
      {/* Top Banner for Development Environment */}
      {parsed.isDev && (
        <div className="bg-amber-500/15 border-b border-amber-500/20 px-3.5 py-1.5 flex items-center justify-between text-[11px] font-mono text-amber-300">
          <div className="flex items-center gap-1.5 font-bold">
            <Terminal className="w-3.5 h-3.5" />
            <span>DEV MODE • Full Technical Error</span>
          </div>
          <span className="text-[10px] text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded">
            Laptop / Dev Area Only
          </span>
        </div>
      )}

      <div className="p-3.5 sm:p-4 space-y-3">
        {/* Header: Icon, Title, and Dismiss */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-start gap-2.5">
            {getIcon()}
            <div>
              <h4 className="text-[13px] font-bold text-white tracking-tight leading-snug">
                {parsed.title}
              </h4>
              <p className="text-[12px] text-slate-300 mt-0.5 leading-relaxed">
                {parsed.message}
              </p>
            </div>
          </div>

          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              title="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* How to fix it section */}
        {parsed.solution && (
          <div 
            className="p-2.5 rounded-lg border flex items-start gap-2 text-[12px]"
            style={{ 
              background: 'rgba(255, 255, 255, 0.03)', 
              borderColor: 'rgba(255, 255, 255, 0.08)' 
            }}
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5 flex-1">
              <span className="font-semibold text-slate-200 block text-[11px] uppercase tracking-wider">
                How to fix this:
              </span>
              <p className="text-slate-300 text-[12px] leading-relaxed">
                {parsed.solution}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="btn btn-secondary text-[11px] py-1.5 px-3 flex items-center gap-1.5 cursor-pointer hover:bg-white/15"
            >
              <RotateCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          )}

          {parsed.actionType === 'backend' && (
            <button
              type="button"
              onClick={() => setShowBackendModal(true)}
              className="btn btn-primary text-[11px] py-1.5 px-3 flex items-center gap-1.5 cursor-pointer font-semibold shadow-md"
            >
              <Settings className="w-3 h-3" />
              <span>Configure Backend</span>
            </button>
          )}

          {parsed.actionType === 'settings' && (
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className="btn btn-primary text-[11px] py-1.5 px-3 flex items-center gap-1.5 cursor-pointer font-semibold"
            >
              <Settings className="w-3 h-3" />
              <span>Open Settings</span>
            </button>
          )}

          {!parsed.canUserFix && (
            <button
              type="button"
              onClick={handleReport}
              className="btn btn-primary text-[11px] py-1.5 px-3 flex items-center gap-1.5 cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold shadow-md shadow-indigo-500/20"
            >
              <MessageSquare className="w-3 h-3" />
              <span>Report Issue to Developer</span>
            </button>
          )}

          {parsed.isDev && (
            <button
              type="button"
              onClick={handleCopyStack}
              className="text-[11px] text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-1 ml-auto"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied Details' : 'Copy Dev Stack'}</span>
            </button>
          )}
        </div>

        {/* Detailed technical error block visible ONLY in development mode */}
        {parsed.isDev && (
          <div className="pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={() => setShowFullDevDetails(!showFullDevDetails)}
              className="flex items-center justify-between w-full text-[10px] uppercase font-mono tracking-wider text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <span>Raw Exception & Stack Trace</span>
              {showFullDevDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {showFullDevDetails && (
              <div className="mt-2 p-2.5 rounded bg-black/60 border border-white/10 font-mono text-[11px] text-rose-300 overflow-x-auto max-h-40 leading-relaxed select-all">
                <div className="font-semibold text-rose-400 mb-1">{parsed.rawError}</div>
                {parsed.rawStack && (
                  <pre className="text-[10px] text-slate-400 whitespace-pre-wrap">{parsed.rawStack}</pre>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
