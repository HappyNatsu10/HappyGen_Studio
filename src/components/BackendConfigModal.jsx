import React, { useState, useEffect } from 'react';
import { Server, Check, X, Wifi, RefreshCw, Globe, Terminal, Trash2, Eye, AlertCircle } from 'lucide-react';
import { flushVRAM } from '../services/aiService';

export default function BackendConfigModal({ isOpen, onClose }) {
  const [backendType, setBackendType] = useState(() => localStorage.getItem('omnigen_backend_type') || 'local');
  const [colabUrl, setColabUrl] = useState(() => localStorage.getItem('omnigen_colab_url') || '');
  const [localIp, setLocalIp] = useState(() => localStorage.getItem('omnigen_local_url') || 'http://127.0.0.1:8000');
  const [civitaiKey, setCivitaiKey] = useState(() => localStorage.getItem('omnigen_civitai_key') || '');
  const [isChecking, setIsChecking] = useState(false);
  const [isFlushing, setIsFlushing] = useState(false);
  const [isTestingVLM, setIsTestingVLM] = useState(false);
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

  const handleTestVLM = async () => {
    setIsTestingVLM(true);
    setStatusResult(null);
    try {
      const testImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
      const res = await fetch("https://happy-gen-studio.vercel.app/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceImage: testImage })
      });
      const data = await res.json();
      if (res.ok && data.caption) {
        setStatusResult({
          online: true,
          latencyMs: 0,
          gpu: "Vercel VLM Proxy",
          baseModel: "Gemini VLM Connected!",
        });
      } else {
        setStatusResult({ error: `VLM Error: ${data.error || res.statusText}` });
      }
    } catch (err) {
      setStatusResult({ error: `VLM Error: Cannot reach Vercel proxy.` });
    } finally {
      setIsTestingVLM(false);
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

          {/* API Key Info */}
          <div className="bg-[#a855f7]/10 border border-[#a855f7]/20 rounded-lg p-3">
            <p className="text-[11px] text-[#a855f7]">
              <strong>Note:</strong> To download private/adult models, you must add your CivitAI API Key as a Secret in your Google Colab instance (named <code>CIVITAI_API_KEY</code>). You can get your API key from your <a href="https://civitai.com/user/account/security" target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">CivitAI Account Security Settings</a>.
            </p>
          </div>

          {/* VLM Setup Info */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <h3 className="text-[12px] font-semibold text-blue-400 mb-1 flex items-center gap-1"><Eye className="w-3.5 h-3.5"/> Gemini Vision (VLM) Setup</h3>
            <p className="text-[11px] text-blue-300/80 mb-2">
              To use "Image to Prompt", you need a free Google Gemini API Key deployed to Vercel so your users don't have to enter their own keys.
            </p>
            <ol className="text-[10px] text-blue-300/70 list-decimal ml-4 space-y-1 mb-3">
              <li>Get a free key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-300 hover:underline">Google AI Studio</a>.</li>
              <li>Go to your Vercel Project Settings → Environment Variables.</li>
              <li>Add a new variable: Key = <code>GEMINI_API_KEY</code>, Value = your key.</li>
              <li>Click "Redeploy" in Vercel to apply the changes!</li>
            </ol>
            <button
              onClick={handleTestVLM}
              disabled={isTestingVLM || isChecking || isFlushing}
              className="btn w-full text-[12px] bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 flex justify-center items-center"
            >
              {isTestingVLM ? (
                <><RefreshCw className="w-3.5 h-3.5 animate-spin inline mr-1.5" /> Testing VLM Proxy...</>
              ) : (
                <><Check className="w-3.5 h-3.5 inline mr-1.5" /> Test Vercel VLM Connection</>
              )}
            </button>
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
