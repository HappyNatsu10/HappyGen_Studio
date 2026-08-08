import React, { useState, useEffect } from 'react';
import { Server, Activity, Check, X, Wifi, Cpu, ShieldCheck, RefreshCw, Key, Globe, Terminal, CloudLightning, Copy } from 'lucide-react';

export default function BackendConfigModal({ isOpen, onClose }) {
  const [backendType, setBackendType] = useState(() => localStorage.getItem('omnigen_backend_type') || 'colab');
  const [colabUrl, setColabUrl] = useState(() => localStorage.getItem('omnigen_colab_url') || '');
  const [localIp, setLocalIp] = useState(() => localStorage.getItem('omnigen_local_url') || 'http://127.0.0.1:8000');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('omnigen_api_key') || '');
  const [isChecking, setIsChecking] = useState(false);
  const [statusResult, setStatusResult] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    localStorage.setItem('omnigen_backend_type', backendType);
    if (backendType === 'colab') {
      localStorage.setItem('omnigen_backend_url', colabUrl.trim());
    } else {
      localStorage.setItem('omnigen_backend_url', localIp.trim());
    }
    localStorage.setItem('omnigen_colab_url', colabUrl);
    localStorage.setItem('omnigen_local_url', localIp);
    localStorage.setItem('omnigen_api_key', apiKey);
  }, [backendType, colabUrl, localIp, apiKey]);

  if (!isOpen) return null;

  const activeUrl = backendType === 'colab' 
    ? (colabUrl.trim() || 'https://xxxx.trycloudflare.com')
    : localIp.trim();

  const handleHealthCheck = async () => {
    setIsChecking(true);
    setStatusResult(null);

    const targetUrl = backendType === 'colab' ? colabUrl.trim() : localIp.trim();
    if (!targetUrl) {
      setIsChecking(false);
      setStatusResult({ error: 'Please enter a valid backend URL.' });
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
          gpu: data.gpu || (backendType === 'colab' ? 'Tesla T4 / A100 (16GB+ VRAM Cloud GPU)' : 'Local NVIDIA GPU'),
          baseModel: data.base_model || 'CrucibleRING PonyXL v28'
        });
      } else {
        setStatusResult({ error: `Server returned HTTP ${res.status}` });
      }
    } catch (err) {
      setStatusResult({ error: `Could not connect to ${targetUrl}. Ensure the Colab or local server is running and CORS is enabled.` });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-slate-900 border border-indigo-500/40 rounded-3xl overflow-hidden shadow-2xl space-y-6 p-6 relative text-slate-100">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-600/30">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold font-display">Inference Backend Engine</h2>
            <p className="text-xs text-slate-400">Switch between Google Colab Cloud GPU (0% laptop load) and Local PC execution.</p>
          </div>
        </div>

        {/* Backend Selection Mode */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setBackendType('colab')}
            className={`p-4 rounded-2xl text-left border transition-all ${
              backendType === 'colab'
                ? 'bg-indigo-950/80 border-indigo-500 ring-2 ring-indigo-500/50'
                : 'bg-slate-950/60 border-white/10 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              <CloudLightning className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-bold">Google Colab Cloud GPU</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">Free 16GB Tesla T4 / A100 GPU • 0% Laptop Load • Fast 3s Generations</p>
          </button>

          <button
            onClick={() => setBackendType('local')}
            className={`p-4 rounded-2xl text-left border transition-all ${
              backendType === 'local'
                ? 'bg-indigo-950/80 border-indigo-500 ring-2 ring-indigo-500/50'
                : 'bg-slate-950/60 border-white/10 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Terminal className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-bold">Local PC GPU Server</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">Runs locally on your laptop's GPU via <code>python scripts/local_inference_server.py</code></p>
          </button>
        </div>

        {/* Configuration Details Input */}
        <div className="space-y-4 p-4 rounded-2xl bg-slate-950 border border-white/10 text-xs">
          {backendType === 'colab' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-200 font-bold">Google Colab Tunnel URL (Cloudflare / Ngrok)</label>
                <span className="text-[10px] text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-500/30">Free 16GB VRAM</span>
              </div>
              <input
                type="text"
                value={colabUrl}
                onChange={(e) => setColabUrl(e.target.value)}
                placeholder="https://xxxx.trycloudflare.com or https://xxxx.ngrok-free.app"
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-slate-200 focus:border-indigo-500 outline-none font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-2">
                Paste the public tunnel URL generated by the Google Colab Notebook. The app will immediately send all generation requests to Google Cloud.
              </p>
            </div>
          )}

          {backendType === 'local' && (
            <div>
              <label className="block text-slate-300 font-bold mb-1">Local Server URL</label>
              <input
                type="text"
                value={localIp}
                onChange={(e) => setLocalIp(e.target.value)}
                placeholder="http://127.0.0.1:8000"
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-slate-200 focus:border-indigo-500 outline-none font-mono"
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <span className="text-slate-400 font-mono text-[11px]">
              Active Engine: <strong className="text-indigo-400">{activeUrl}</strong>
            </span>
            <button
              onClick={handleHealthCheck}
              disabled={isChecking}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center space-x-1.5 transition-all shadow-md cursor-pointer"
            >
              {isChecking ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5" />}
              <span>Test Ping & Health</span>
            </button>
          </div>
        </div>

        {/* Health Check Status Display */}
        {statusResult && (
          <div className={`p-4 rounded-2xl border space-y-2 text-xs ${
            statusResult.online 
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}>
            {statusResult.online ? (
              <>
                <div className="flex items-center justify-between font-bold">
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Backend Connected & Active!</span>
                  </div>
                  <span className="font-mono bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30 text-emerald-300">
                    {statusResult.latencyMs} ms Latency
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-300 pt-1 border-t border-white/5">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Hardware Engine</span>
                    <span className="font-bold text-slate-200">{statusResult.gpu}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Active Base Model</span>
                    <span className="font-bold text-slate-200">{statusResult.baseModel}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2 font-bold text-rose-400">
                <X className="w-4 h-4" />
                <span>{statusResult.error}</span>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
