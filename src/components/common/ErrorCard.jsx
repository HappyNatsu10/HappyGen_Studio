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
      className={`w-full shrink-0 rounded-2xl border shadow-2xl transition-all duration-200 ${className}`}
      style={{
        background: '#190e13',
        borderColor: 'rgba(248, 113, 113, 0.45)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4), 0 0 15px rgba(239, 68, 68, 0.15)',
      }}
    >
      {/* Top Banner for Development Environment */}
      {parsed.isDev && (
        <div 
          className="rounded-t-2xl border-b px-3.5 py-1.5 flex items-center justify-between text-[11px] font-mono"
          style={{
            background: 'rgba(245, 158, 11, 0.15)',
            borderColor: 'rgba(245, 158, 11, 0.25)',
            color: '#fcd34d'
          }}
        >
          <div className="flex items-center gap-1.5 font-bold">
            <Terminal className="w-3.5 h-3.5" />
            <span>DEV MODE • Full Technical Error</span>
          </div>
          <span 
            className="text-[10px] px-2 py-0.5 rounded font-semibold"
            style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' }}
          >
            Dev Area Only
          </span>
        </div>
      )}

      <div className="p-4 space-y-3.5">
        {/* Header: Icon, Title, and Dismiss */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="p-2 rounded-xl shrink-0" style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              {getIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[14px] font-bold tracking-tight leading-snug" style={{ color: '#ffffff' }}>
                {parsed.title}
              </h4>
              <p className="text-[12.5px] mt-1 leading-relaxed break-words" style={{ color: '#e2e8f0' }}>
                {parsed.message}
              </p>
            </div>
          </div>

          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
              style={{ background: 'rgba(255, 255, 255, 0.05)' }}
              title="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* How to fix it section */}
        {parsed.solution && (
          <div 
            className="p-3 rounded-xl border flex items-start gap-2.5 text-[12px]"
            style={{ 
              background: '#24141a', 
              borderColor: 'rgba(248, 113, 113, 0.25)' 
            }}
          >
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <span className="font-bold block text-[11px] uppercase tracking-wider text-amber-300">
                How to fix this:
              </span>
              <p className="text-[12px] leading-relaxed" style={{ color: '#fed7aa' }}>
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
              className="btn text-[11px] py-1.5 px-3 flex items-center gap-1.5 cursor-pointer font-semibold rounded-lg"
              style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.15)' }}
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          )}

          {parsed.actionType === 'backend' && (
            <button
              type="button"
              onClick={() => setShowBackendModal?.(true)}
              className="btn text-[11px] py-1.5 px-3.5 flex items-center gap-1.5 cursor-pointer font-bold rounded-lg shadow-md"
              style={{ background: 'var(--accent, #6366f1)', color: '#ffffff' }}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Configure Backend</span>
            </button>
          )}

          {parsed.actionType === 'settings' && (
            <button
              type="button"
              onClick={() => setActiveTab?.('settings')}
              className="btn text-[11px] py-1.5 px-3.5 flex items-center gap-1.5 cursor-pointer font-bold rounded-lg shadow-md"
              style={{ background: 'var(--accent, #6366f1)', color: '#ffffff' }}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Open Settings</span>
            </button>
          )}

          {!parsed.canUserFix && (
            <button
              type="button"
              onClick={handleReport}
              className="btn text-[11px] py-1.5 px-3.5 flex items-center gap-1.5 cursor-pointer rounded-lg text-white font-bold shadow-md"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Report Issue to Developer</span>
            </button>
          )}

          {parsed.isDev && (
            <button
              type="button"
              onClick={handleCopyStack}
              className="text-[11px] text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-1 ml-auto"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied Details' : 'Copy Dev Stack'}</span>
            </button>
          )}
        </div>

        {/* Detailed technical error block visible ONLY in development mode */}
        {parsed.isDev && (
          <div className="pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => setShowFullDevDetails(!showFullDevDetails)}
              className="flex items-center justify-between w-full text-[10px] uppercase font-mono tracking-wider text-slate-400 hover:text-slate-200 cursor-pointer py-1"
            >
              <span>Raw Exception & Stack Trace</span>
              {showFullDevDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {showFullDevDetails && (
              <div 
                className="mt-2 p-3 rounded-xl font-mono text-[11px] overflow-x-auto max-h-48 leading-relaxed select-all border"
                style={{ background: '#0a0507', borderColor: 'rgba(239, 68, 68, 0.25)', color: '#fca5a5' }}
              >
                <div className="font-bold text-rose-400 mb-1.5 break-words">{parsed.rawError}</div>
                {parsed.rawStack && (
                  <pre className="text-[10.5px] text-slate-400 whitespace-pre-wrap">{parsed.rawStack}</pre>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
