import React from 'react';
import { AlertOctagon, RotateCw, MessageSquare, Terminal } from 'lucide-react';
import { isDevEnvironment } from '../../utils/errorHandler';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReport = () => {
    const reportText = `[Application Crash Report]\n\nError: ${this.state.error?.message || String(this.state.error)}\n\nComponent Stack:\n${this.state.errorInfo?.componentStack || 'N/A'}`;
    const webhookUrl = import.meta.env.VITE_DISCORD_WEBHOOK_URL;
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `🚨 **Crash Report**: ${this.state.error?.message || 'Unknown'}\n\`\`\`\n${(this.state.errorInfo?.componentStack || '').slice(0, 1500)}\n\`\`\``
        })
      }).catch(() => {});
    }
    
    // Copy to clipboard as fallback
    navigator.clipboard?.writeText(reportText);
    alert('Crash report details copied to clipboard. You can paste this in Discord or GitHub!');
  };

  render() {
    if (this.state.hasError) {
      const isDev = isDevEnvironment();

      if (isDev) {
        return (
          <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex items-center justify-center">
            <div className="max-w-2xl w-full bg-slate-900 border border-rose-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-2 text-rose-400 font-mono text-sm font-bold bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20">
                <Terminal className="w-4 h-4" />
                <span>DEV MODE • React Component Crash</span>
              </div>
              <h2 className="text-xl font-bold text-white">
                {this.state.error?.message || 'Component Crash'}
              </h2>
              <div className="p-3 bg-black/60 rounded-xl font-mono text-xs text-rose-300 overflow-x-auto max-h-60 leading-relaxed">
                {this.state.error?.stack || String(this.state.error)}
              </div>
              {this.state.errorInfo && (
                <div className="p-3 bg-black/40 rounded-xl font-mono text-[11px] text-slate-400 overflow-x-auto max-h-40 leading-relaxed">
                  {this.state.errorInfo.componentStack}
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={this.handleReload}
                  className="btn btn-primary px-4 py-2 text-xs flex items-center gap-2 cursor-pointer font-bold"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Reload Studio</span>
                </button>
              </div>
            </div>
          </div>
        );
      }

      // Production friendly recovery UI
      return (
        <div className="min-h-[50vh] flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full p-6 rounded-2xl border border-rose-500/20 bg-slate-900/80 backdrop-blur-md shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 mx-auto flex items-center justify-center text-rose-400">
              <AlertOctagon className="w-6 h-6" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Something went wrong in this section
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                An unexpected display issue occurred. You can safely reload the studio to continue your work.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-left text-xs space-y-1 text-slate-300">
              <span className="font-semibold text-slate-200 block text-[11px] uppercase tracking-wider">
                How to fix this:
              </span>
              <p>Click below to reload. If the problem continues, please report it so we can issue an update.</p>
            </div>

            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={this.handleReload}
                className="btn btn-primary px-4 py-2 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-md"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Reload Studio</span>
              </button>

              <button
                onClick={this.handleReport}
                className="btn btn-secondary px-4 py-2 text-xs flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Report Issue</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
