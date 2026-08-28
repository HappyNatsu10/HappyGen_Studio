import React, { useState, useEffect } from 'react';
import { Server, Check, X, Wifi, RefreshCw, Globe, Terminal, Trash2 } from 'lucide-react';
import { flushVRAM } from '../services/aiService';

export default function BackendConfigModal({ isOpen, onClose }) {
  const [backendType, setBackendType] = useState(() => localStorage.getItem('omnigen_backend_type') || 'local');
  const [colabUrl, setColabUrl] = useState(() => localStorage.getItem('omnigen_colab_url') || '');
  const [localIp, setLocalIp] = useState(() => localStorage.getItem('omnigen_local_url') || 'http://127.0.0.1:8000');
  const [civitaiKey, setCivitaiKey] = useState(() => localStorage.getItem('omnigen_civitai_key') || '');
  const [isChecking, setIsChecking] = useState(false);
  const [isFlushing, setIsFlushing] = useState(false);
  const [statusResult, setStatusResult] = useState(null);

  useEffect(() => {
    localStorage.setItem('omnigen_backend_type', backendType);
    if (backendType === 'colab') {
      localStorage.setItem('omnigen_backend_url', colabUrl.trim());
    } else {
      localStorage.setItem('omnigen_backend_url', localIp.trim());
    }
    localStorage.setItem('omnigen_colab_url', colabUrl);
    localStorage.setItem('omnigen_local_url', localIp);
    localStorage.setItem('omnigen_civitai_key', civitaiKey);
  }, [backendType, colabUrl, localIp, civitaiKey]);

  if (!isOpen) return null;

  const handleHealthCheck = async () => {
    setIsChecking(true);
    setStatusResult(null);
    const targetUrl = backendType === 'colab' ? colabUrl.trim() : localIp.trim();
    if (!targetUrl) {
      setIsChecking(false);
      setStatusResult({ error: 'Please enter a valid URL.' });
      return;
    }
    const t0 = performance.now();
    try {
      const res = await fetch(targetUrl, { method: 'GET', mode: 'cors' });
      const t1 = performance.now();
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setStatusResult({
          online: true,
          latencyMs: Math.round(t1 - t0),
          gpu: data.gpu || 'GPU Detected',
          baseModel: data.base_model || 'Model Ready',
        });
      } else {
        setStatusResult({ error: `Server returned HTTP ${res.status}` });
      }
    } catch (err) {
      setStatusResult({ error: `Cannot connect to ${targetUrl}. Ensure the server is running.` });
    } finally {
      setIsChecking(false);
    }
  };

  const handleFlush = async () => {
    setIsFlushing(true);
    setStatusResult(null);
    try {
      const data = await flushVRAM();
      setStatusResult({ 
        online: true, 
        latencyMs: 0,
        gpu: 'GPU Detected', 
        baseModel: `VRAM Flushed! Free: ${data.vram_free_gb || '?'} GB` 
      });
    } catch (err) {
      setStatusResult({ error: err.message });
    } finally {
      setIsFlushing(false);
    }
  };

  return (
    <div className="modal-overlay overlay-enter" onClick={onClose}>
      <div className="modal-panel" onClick={e => e.stopPropagation()}>
        <div className="p-6 space-y-5">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5" style={{ color: 'var(--text-accent)' }} />
              <h2 className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>Backend Server</h2>
            </div>
            <button onClick={onClose} className="btn-ghost p-1.5 rounded-md cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Backend Type Toggle */}
          <div className="mode-toggle">
            <button
              onClick={() => setBackendType('local')}
              className={`mode-toggle-option flex-1 ${backendType === 'local' ? 'active' : ''}`}
            >
              <Terminal className="inline w-3 h-3 mr-1" style={{ verticalAlign: 'middle' }} />
              Local GPU
            </button>
            <button
              onClick={() => setBackendType('colab')}
              className={`mode-toggle-option flex-1 ${backendType === 'colab' ? 'active' : ''}`}
            >
              <Globe className="inline w-3 h-3 mr-1" style={{ verticalAlign: 'middle' }} />
              Google Colab
            </button>
          </div>

          {/* URL Input */}
          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
              {backendType === 'colab' ? 'Google Colab Tunnel URL' : 'Local Server URL'}
            </label>
            {backendType === 'colab' ? (
              <input
                type="url"
                value={colabUrl}
                onChange={e => setColabUrl(e.target.value)}
                placeholder="http://localhost:8000"
                className="input w-full text-[13px]"
              />
            ) : (
              <input
                type="url"
                value={localIp}
                onChange={e => setLocalIp(e.target.value)}
                placeholder="http://127.0.0.1:8000"
                className="input w-full text-[13px]"
              />
            )}
            {backendType === 'colab' && (
              <div className="mt-2 space-y-2">
                <a 
                  href="https://colab.research.google.com/github/HappyNatsu10/HappyGen_Studio/blob/main/colab_server.ipynb"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-secondary w-full text-[12px] flex items-center justify-center gap-2 border border-[#a855f7]"
                >
                  <Globe className="w-3.5 h-3.5 text-[#a855f7]" /> 
                  <span className="text-[#a855f7]">Open Google Colab Notebook (Free GPU)</span>
                </a>
                <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                  Run the notebook in Google Colab and paste the generated public Tunnel URL (e.g., ngrok or cloudflare) here.
                </p>
              </div>
            )}
          </div>

          {/* API Key */}
          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
              CivitAI API Key (Required for model downloads)
            </label>
            <input
              type="password"
              value={civitaiKey}
              onChange={e => setCivitaiKey(e.target.value)}
              placeholder="Enter your CivitAI API Key"
              className="input w-full text-[13px]"
            />
            <p className="text-[10px] mt-1.5" style={{ color: 'var(--text-tertiary)' }}>
              Get your API key from your <a href="https://civitai.com/user/account" target="_blank" rel="noopener noreferrer" className="text-[#a855f7] hover:underline">CivitAI Account Settings</a>.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleHealthCheck}
              disabled={isChecking || isFlushing}
              className="btn btn-secondary flex-1 text-[12px]"
            >
              {isChecking ? (
                <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Checking...</>
              ) : (
                <><Wifi className="w-3.5 h-3.5" /> Test Connection</>
              )}
            </button>
            <button
              onClick={handleFlush}
              disabled={isChecking || isFlushing}
              className="btn btn-secondary flex-1 text-[12px] border-red-500/30 hover:border-red-500/50 hover:bg-red-500/10 text-red-400"
            >
              {isFlushing ? (
                <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Flushing...</>
              ) : (
                <><Trash2 className="w-3.5 h-3.5" /> Flush VRAM</>
              )}
            </button>
          </div>

          {/* Status Result */}
          {statusResult && (
            <div className="card p-3 space-y-1.5">
              {statusResult.online ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className="status-dot online" />
                    <span className="text-[12px] font-medium" style={{ color: 'var(--success)' }}>Connected</span>
                    <span className="text-[10px] ml-auto" style={{ color: 'var(--text-tertiary)' }}>
                      {statusResult.latencyMs}ms
                    </span>
                  </div>
                  <div className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                    {statusResult.gpu} • {statusResult.baseModel}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="status-dot offline" />
                  <span className="text-[12px]" style={{ color: 'var(--error)' }}>{statusResult.error}</span>
                </div>
              )}
            </div>
          )}

          {/* Done */}
          <button onClick={onClose} className="btn btn-primary w-full text-[13px]">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
