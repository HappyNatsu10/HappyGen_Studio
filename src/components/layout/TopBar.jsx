import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Server } from 'lucide-react';

export default function TopBar({ title, onOpenBackendModal }) {
  const [backendOnline, setBackendOnline] = useState(false);

  useEffect(() => {
    const checkHealth = async () => {
      const url = localStorage.getItem('omnigen_backend_url') || 'http://localhost:8000';
      try {
        const res = await fetch(url, { method: 'GET', mode: 'cors', signal: AbortSignal.timeout(3000) });
        setBackendOnline(res.ok);
      } catch {
        setBackendOnline(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      className="h-12 flex items-center justify-between px-5 border-b flex-shrink-0"
      style={{
        backgroundColor: 'var(--surface-1)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <h1 className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h1>

      <button
        onClick={onOpenBackendModal}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all"
        style={{
          background: 'var(--surface-2)',
          border: '1px solid var(--border-subtle)',
          color: 'var(--text-secondary)',
        }}
      >
        <div className={`status-dot ${backendOnline ? 'online' : 'offline'}`} />
        <Server className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{backendOnline ? 'Connected' : 'Offline'}</span>
      </button>
    </header>
  );
}
