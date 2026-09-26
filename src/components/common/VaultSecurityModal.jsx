import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Lock, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useAppStore from '../../store/useAppStore';

export default function VaultSecurityModal({ isOpen, onClose, mode, onSuccess }) {
  const { t } = useTranslation();
  const { adultVaultPin, setAdultVaultPin, setAdultVaultUnlocked } = useAppStore();
  
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  // mode can be: 'verify', 'setup', 'remove'
  
  const handleVerify = (val) => {
    if (val === adultVaultPin) {
      setAdultVaultUnlocked(true);
      onSuccess();
      handleClose();
    } else {
      setError(true);
      setTimeout(() => {
        setPinInput('');
        setError(false);
      }, 500);
    }
  };

  const handleSetup = (val) => {
    setAdultVaultPin(val);
    setAdultVaultUnlocked(true);
    onSuccess();
    handleClose();
  };
  
  const handleRemove = (val) => {
    if (val === adultVaultPin) {
      setAdultVaultPin(null);
      setAdultVaultUnlocked(false);
      onSuccess();
      handleClose();
    } else {
      setError(true);
      setTimeout(() => {
        setPinInput('');
        setError(false);
      }, 500);
    }
  };

  const handleChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    setPinInput(val);
    
    if (val.length === 4) {
      if (mode === 'verify') handleVerify(val);
      else if (mode === 'setup') handleSetup(val);
      else if (mode === 'remove') handleRemove(val);
    }
  };

  const handleClose = () => {
    setPinInput('');
    setError(false);
    onClose();
  };

  const renderContent = () => {
    if (mode === 'setup') {
      return (
        <>
          <ShieldAlert className="w-12 h-12 text-[#a855f7] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-center mb-2">{t('security.setupTitle', 'Setup Vault PIN')}</h2>
          <p className="text-sm text-center text-[var(--text-secondary)] mb-6">
            {t('security.setupDesc', 'Create a 4-digit PIN to secure your 18+ mode and Adult Vault.')}
          </p>
        </>
      );
    }
    
    if (mode === 'remove') {
      return (
        <>
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-center mb-2">{t('security.removeTitle', 'Remove Vault PIN')}</h2>
          <p className="text-sm text-center text-[var(--text-secondary)] mb-6">
            {t('security.removeDesc', 'Enter your current 4-digit PIN to disable vault security.')}
          </p>
        </>
      );
    }

    return (
      <>
        <Lock className="w-12 h-12 text-[#a855f7] mx-auto mb-4" />
        <h2 className="text-xl font-bold text-center mb-2">{t('security.verifyTitle', 'Enter PIN')}</h2>
        <p className="text-sm text-center text-[var(--text-secondary)] mb-6">
          {t('security.verifyDesc', 'Please enter your 4-digit PIN to continue.')}
        </p>
      </>
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-sm bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)] bg-[var(--surface-2)]">
          <h3 className="font-semibold text-[var(--text-primary)]">
            {t('security.title', 'Security')}
          </h3>
          <button 
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-[var(--surface-3)] text-[var(--text-secondary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8">
          {renderContent()}

          <input 
            type="password" 
            maxLength={4} 
            autoFocus
            placeholder="••••"
            className={`w-32 text-center text-3xl tracking-[0.5em] pl-[0.5em] p-3 bg-[var(--surface-2)] border rounded-xl text-[var(--text-primary)] mx-auto block outline-none transition-all ${
              error ? 'border-red-500 animate-shake' : 'border-[var(--border-subtle)] focus:border-[#a855f7]'
            }`}
            value={pinInput} 
            onChange={handleChange} 
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
