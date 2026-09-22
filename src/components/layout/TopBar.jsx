import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Server, User, Palette } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import useAppStore from '../../store/useAppStore';
import LanguageSwitcher from '../common/LanguageSwitcher';

export default function TopBar({ title, onOpenBackendModal }) {
  const { t } = useTranslation();
  const { isAuthenticated, currentUser, openAuth } = useAuth();
  const { setShowProfileModal, setShowThemeModal } = useAppStore();
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
      <div className="flex items-center gap-2">
        <div className="md:hidden flex items-center gap-1.5">
          <img src="/logo.png" alt="HappyGen" className="w-5 h-5 object-contain" />
          <span className="text-[14px] font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#a855f7] to-[#ec4899]">
            HappyGen
          </span>
          <span className="text-gray-500 text-[10px] mx-1">/</span>
        </div>
        <h1 className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <button
          id="tour-backend-config"
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
          <span className="hidden sm:inline">{backendOnline ? t('topBar.connected', 'Connected') : t('topBar.offline', 'Offline')}</span>
        </button>

        {/* User Account / Login Button */}
        <button 
          onClick={() => {
            if (isAuthenticated) {
              setShowProfileModal(true);
            } else {
              openAuth('login');
            }
          }}
          className="w-8 h-8 rounded-full overflow-hidden border cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center bg-[var(--surface-2)]"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          {isAuthenticated && currentUser?.avatar ? (
            <img src={currentUser.avatar} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User className="w-4 h-4 text-[var(--text-secondary)]" />
          )}
        </button>
      </div>
    </header>
  );
}
