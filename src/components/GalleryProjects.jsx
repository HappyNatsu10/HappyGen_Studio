import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Folder, Image as ImageIcon, Lock, Download, Trash2, Eye, ShieldAlert, Maximize2, Brush, AlertTriangle, CheckSquare, Square, CheckCircle2, Layers, Fingerprint } from 'lucide-react';
import ImageViewerModal from './common/ImageViewerModal';
import useAppStore from '../store/useAppStore';
import useWorkspaceStore from '../store/useWorkspaceStore';
import { useAuth } from '../context/AuthContext';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Media } from '@capacitor-community/media';
import { saveImageToGallery } from '../utils/mediaUtils';
import { NativeBiometric } from '@capgo/capacitor-native-biometric';

export default function GalleryProjects() {
  const { t } = useTranslation();
  const { isAdultMode, adultVaultPin, setAdultVaultPin, adultVaultUnlocked, setAdultVaultUnlocked } = useAppStore();
  const { generatedAssets, removeGeneratedAsset } = useWorkspaceStore();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'adult_vault'
  const [pinInput, setPinInput] = useState('');
  const [activeViewerImage, setActiveViewerImage] = useState(null);
  const [activeViewerImages, setActiveViewerImages] = useState([]);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Multi-select state
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isDownloading, setIsDownloading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

  useEffect(() => {
    if (activeTab === 'adult_vault' && !adultVaultUnlocked && adultVaultPin) {
      const checkBiometric = async () => {
        try {
          const result = await NativeBiometric.isAvailable();
          if (result.isAvailable) {
            setIsBiometricAvailable(true);
            try {
              await NativeBiometric.verifyIdentity({
                reason: "Unlock 18+ Vault",
                title: "Vault Verification",
                subtitle: "Use biometrics to unlock"
              });
              setAdultVaultUnlocked(true);
            } catch (authErr) {
              console.log("Biometric auth cancelled or failed", authErr);
            }
          }
        } catch (e) {
          console.log("Biometric not available", e);
        }
      };
      checkBiometric();
    }
  }, [activeTab, adultVaultUnlocked, adultVaultPin, setAdultVaultUnlocked]);

  const handleManualBiometric = async () => {
    try {
      await NativeBiometric.verifyIdentity({
        reason: "Unlock 18+ Vault",
        title: "Vault Verification",
        subtitle: "Use biometrics to unlock"
      });
      setAdultVaultUnlocked(true);
    } catch (e) {
      console.log("Biometric auth failed", e);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const [showMultiDeleteModal, setShowMultiDeleteModal] = useState(false);

  const filteredAssets = generatedAssets.filter(asset => 
    activeTab === 'adult_vault' ? asset.isAdult : !asset.isAdult
  );

  // Group assets generated in the same batch (within 2 seconds of each other)
  const groupedAssets = useMemo(() => {
    const groups = [];
    let currentGroup = [];
    
    // generatedAssets is prepended (newest first).
    filteredAssets.forEach((asset, idx) => {
      if (idx === 0) {
        currentGroup.push(asset);
      } else {
        const prevAsset = filteredAssets[idx - 1];
        // Group if timestamp is within 2000ms
        if (Math.abs(asset.timestamp - prevAsset.timestamp) < 2000) {
          currentGroup.push(asset);
        } else {
          groups.push([...currentGroup]);
          currentGroup = [asset];
        }
      }
    });
    if (currentGroup.length > 0) groups.push(currentGroup);
    return groups;
  }, [filteredAssets]);

  const toggleSelection = (e, group) => {
    e.stopPropagation();
    const newSelectedIds = new Set(selectedIds);
    // If first item is selected, consider group selected
    const isSelected = newSelectedIds.has(group[0].id);
    
    group.forEach(asset => {
      if (isSelected) {
        newSelectedIds.delete(asset.id);
      } else {
        newSelectedIds.add(asset.id);
      }
    });
    
    setSelectedIds(newSelectedIds);
  };

  const handleDownloadImage = async (image) => {
    const isNativeApp = window.Capacitor && window.Capacitor.isNativePlatform();
    const response = await fetch(image.url);
    const blob = await response.blob();
    
    if (isNativeApp) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64data = reader.result;
          const fileName = `happygen-${image.seed || Date.now()}-${Math.floor(Math.random()*1000)}.png`;
          try {
            let pureBase64 = base64data;
            if (base64data.includes(',')) {
              pureBase64 = base64data.split(',')[1];
            }
            
            try {
              const perm = await Media.checkPermissions();
              if (perm.publicStorage !== 'granted') {
                await Media.requestPermissions();
              }
            } catch (permErr) {
              await Media.requestPermissions().catch(e => console.log(e));
            }

            await saveImageToGallery(pureBase64, fileName);
            resolve();
          } catch (err) {
            console.error("Download failed:", err);
            resolve();
          }
        };
      });
    } else {
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `happygen-${image.seed || Date.now()}-${Math.floor(Math.random()*1000)}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      // add slight delay to prevent browser blocking multiple downloads
      await new Promise(r => setTimeout(r, 300));
    }
  };

  const handleDownloadSelected = async () => {
    if (selectedIds.size === 0) return;
    setIsDownloading(true);
    
    const assetsToDownload = filteredAssets.filter(a => selectedIds.has(a.id));
    
    for (const asset of assetsToDownload) {
      await handleDownloadImage(asset);
    }
    
    setIsDownloading(false);
    setIsSelectionMode(false);
    setSelectedIds(new Set());
    showToast(`Successfully saved ${assetsToDownload.length} image(s) to gallery!`);
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    setIsDeleting(true);
    await new Promise(r => setTimeout(r, 600)); // Simulate loading
    selectedIds.forEach(id => {
      removeGeneratedAsset(id);
    });
    setIsDeleting(false);
    setShowMultiDeleteModal(false);
    setIsSelectionMode(false);
    setSelectedIds(new Set());
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 md:pb-0">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div>
          <h1 className="text-[18px] font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Folder className="w-5 h-5" style={{ color: 'var(--text-accent)' }} />
            {t('projects.title', 'Projects & Asset Vault')}
          </h1>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{t('projects.subtitle', 'Isolated project partitions and encrypted asset storage.')}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {/* Multi-Select Toggle */}
          {groupedAssets.length > 0 && (
            <button
              onClick={() => {
                setIsSelectionMode(!isSelectionMode);
                if (isSelectionMode) setSelectedIds(new Set());
              }}
              className={`flex items-center justify-center gap-2 px-3 py-2 sm:py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${isSelectionMode ? 'bg-[#a855f7] text-white' : 'bg-[var(--surface-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]'}`}
            >
              <CheckSquare className="w-4 h-4 shrink-0" />
              {isSelectionMode ? 'Cancel Selection' : 'Select'}
            </button>
          )}

          {/* Gallery Vault Filter */}
          <div className="mode-toggle flex-1 flex">
            <button
              onClick={() => { setActiveTab('general'); setIsSelectionMode(false); setSelectedIds(new Set()); setPinInput(''); }}
              className={`mode-toggle-option whitespace-nowrap ${activeTab === 'general' ? 'active' : ''}`}
            >
              {t('projects.generalGallery', 'General Gallery')}
            </button>
            <button
              onClick={() => { setActiveTab('adult_vault'); setIsSelectionMode(false); setSelectedIds(new Set()); setPinInput(''); }}
              className={`mode-toggle-option flex items-center justify-center gap-1 whitespace-nowrap ${activeTab === 'adult_vault' ? 'active' : ''}`}
            >
              <Lock className="w-3.5 h-3.5 shrink-0" />
              {t('projects.adultVault', 'Adult 18+ Private Vault')}
            </button>
          </div>
        </div>
      </div>

      {/* Selection Action Bar */}
      {isSelectionMode && selectedIds.size > 0 && (
        <div className="bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-xl p-3 flex items-center justify-between relative mb-4 z-10 animate-fade-in shadow-lg backdrop-blur-xl">
          <span className="text-sm font-medium text-[var(--text-primary)] ml-2">
            {selectedIds.size} {selectedIds.size === 1 ? 'item' : 'items'} selected
          </span>
          <div className="flex gap-2">
            <button 
              onClick={handleDownloadSelected}
              disabled={isDownloading}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--surface-3)] hover:bg-[var(--surface-4)] text-[var(--text-primary)] rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isDownloading ? 'Downloading...' : 'Download'}
            </button>
            <button 
              onClick={() => setShowMultiDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm font-medium transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Vault Guard check if trying to view Adult Vault unverified */}
      {activeTab === 'adult_vault' && !adultVaultUnlocked ? (
        <div className="glass-panel-adult rounded-2xl p-8 sm:p-12 text-center space-y-6 max-w-xl mx-auto mt-4 sm:mt-10 border border-red-500/20 shadow-2xl">
          <Lock className="w-12 h-12 mx-auto" style={{ color: 'var(--error)' }} />
          <h2 className="text-[18px] font-semibold" style={{ color: 'var(--text-primary)' }}>{t('projects.lockedTitle', 'Adult Vault Locked')}</h2>
          
          {!adultVaultPin ? (
             <div className="space-y-4 max-w-xs mx-auto animate-fade-in">
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('projects.setupPinDesc', 'Set a 4-digit PIN to secure your vault.')}</p>
                <input 
                  type="password" 
                  maxLength={4} 
                  placeholder="••••"
                  className="w-32 text-center text-2xl tracking-[0.5em] pl-[0.5em] p-2 bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] mx-auto block outline-none focus:border-[#a855f7] transition-colors" 
                  value={pinInput} 
                  onChange={e => setPinInput(e.target.value.replace(/\D/g, ''))} 
                />
                <button 
                  onClick={() => { 
                    if(pinInput.length === 4) { 
                      setAdultVaultPin(pinInput); 
                      setAdultVaultUnlocked(true); 
                      setPinInput(''); 
                    } 
                  }} 
                  disabled={pinInput.length !== 4} 
                  className="w-full bg-[#a855f7] text-white py-2.5 rounded-lg font-medium hover:bg-[#9333ea] transition-colors disabled:opacity-50"
                >
                  {t('projects.setPinBtn', 'Set PIN')}
                </button>
             </div>
          ) : (
             <div className="space-y-4 max-w-xs mx-auto animate-fade-in">
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('projects.unlockPinDesc', 'Enter your 4-digit PIN or use biometrics to unlock.')}</p>
                
                {isBiometricAvailable && (
                  <button 
                    onClick={handleManualBiometric}
                    className="w-full flex items-center justify-center gap-2 text-[15px] text-[#a855f7] bg-[#a855f7]/10 hover:bg-[#a855f7]/20 py-3.5 rounded-xl font-semibold transition-colors mb-4"
                  >
                    <Fingerprint className="w-5 h-5" />
                    {t('projects.useBiometrics', 'Use Biometrics')}
                  </button>
                )}
                
                <input 
                  type="password" 
                  maxLength={4} 
                  placeholder="••••"
                  className="w-32 text-center text-2xl tracking-[0.5em] pl-[0.5em] p-2 bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] mx-auto block outline-none focus:border-[#a855f7] transition-colors" 
                  value={pinInput} 
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '');
                    setPinInput(val);
                    if (val.length === 4) {
                      if (val === adultVaultPin) {
                         setAdultVaultUnlocked(true);
                         setPinInput('');
                      } else {
                         setTimeout(() => setPinInput(''), 300);
                      }
                    }
                  }} 
                />
                
                <button
                  onClick={async () => {
                    if(confirm("To reset your PIN and protect your privacy, you must sign out and sign back in. Continue?")) {
                      setAdultVaultPin(null);
                      setAdultVaultUnlocked(false);
                      await logout();
                    }
                  }}
                  className="w-full mt-4 text-sm text-[var(--text-secondary)] hover:text-red-500 transition-colors"
                >
                  Forgot PIN?
                </button>
             </div>
          )}
        </div>
      ) : (
        <div>
          {groupedAssets.length === 0 ? (
            <div className="card p-12 text-center text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
              {t('projects.emptyGallery', 'No assets stored in this gallery partition.')}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {groupedAssets.map((group) => {
                const representativeAsset = group[0];
                const isSelected = selectedIds.has(representativeAsset.id);

                return (
                  <div 
                    key={representativeAsset.id} 
                    className={`card card-interactive overflow-hidden group cursor-pointer ${isSelected ? 'ring-2 ring-[#a855f7]' : ''}`}
                    onClick={(e) => {
                      if (isSelectionMode) {
                        toggleSelection(e, group);
                      } else {
                        setActiveViewerImages(filteredAssets);
                        setActiveViewerImage(representativeAsset);
                      }
                    }}
                  >
                    <div className="aspect-square overflow-hidden relative img-overlay" style={{ background: 'var(--surface-2)' }}>
                      <img src={representativeAsset.url} alt={representativeAsset.prompt} className="w-full h-full object-cover" />
                      
                      {/* Batch Badge */}
                      {group.length > 1 && (
                        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md text-white text-xs font-semibold px-2 py-1 rounded-md flex items-center gap-1 z-10">
                          <Layers className="w-3.5 h-3.5" />
                          {group.length}
                        </div>
                      )}

                      {/* Selection Overlay */}
                      {isSelectionMode && (
                        <div className="absolute top-2 left-2 z-10 text-white shadow-sm">
                          {isSelected ? <CheckCircle2 className="w-6 h-6 text-[#a855f7] fill-white" /> : <Square className="w-6 h-6 text-white/70 fill-black/30" />}
                        </div>
                      )}

                      {!isSelectionMode && (
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2" style={{ background: 'rgba(0,0,0,0.6)' }}>
                          <div className="flex gap-2">
                            <button 
                              className="btn btn-primary p-2"
                              title={t('projects.viewFullscreen', 'View Fullscreen')}
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                setActiveViewerImages(filteredAssets);
                                setActiveViewerImage(representativeAsset); 
                              }}
                            >
                              <Maximize2 className="w-4 h-4" />
                            </button>
                            <button 
                              className="btn btn-secondary p-2 bg-white/20 hover:bg-white/40 text-white"
                              title={t('projects.sendToInpaint', 'Send to Inpaint Studio')}
                              onClick={(e) => {
                                e.stopPropagation();
                                useWorkspaceStore.getState().setInpaintSourceImage(representativeAsset.url);
                                useAppStore.getState().setActiveTab('inpaint');
                              }}
                            >
                              <Brush className="w-4 h-4" />
                            </button>
                            <button 
                              className="btn btn-secondary p-2 bg-red-500/20 hover:bg-red-500/40 text-white"
                              title={t('projects.delete', 'Delete')}
                              onClick={(e) => {
                                e.stopPropagation();
                                setImageToDelete(representativeAsset);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          {group.length > 1 && <span className="text-white/80 text-xs font-medium bg-black/50 px-2 py-1 rounded">View {group.length} images</span>}
                        </div>
                      )}
                    </div>
                    <div className="p-3 space-y-1">
                      <div className="font-medium text-[12px] truncate" style={{ color: 'var(--text-primary)' }}>{representativeAsset.prompt}</div>
                      <div className="text-[10px] flex justify-between" style={{ color: 'var(--text-tertiary)' }}>
                        <span>{representativeAsset.style}</span>
                        <span>
                          {representativeAsset.width}x{representativeAsset.height}
                          {representativeAsset.timestamp && ` • ${new Date(representativeAsset.timestamp).toLocaleDateString()}`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Image Viewer Modal */}
      <ImageViewerModal
        image={activeViewerImage}
        images={activeViewerImages}
        currentIndex={activeViewerImage ? activeViewerImages.findIndex(a => a.id === activeViewerImage.id) : 0}
        onIndexChange={(idx) => setActiveViewerImage(activeViewerImages[idx])}
        isOpen={!!activeViewerImage}
        onClose={() => setActiveViewerImage(null)}
        onDelete={(img) => {
          removeGeneratedAsset(img.id);
          setActiveViewerImage(null);
        }}
      />

      {/* Delete Confirmation Modal (Single) */}
      {imageToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setImageToDelete(null)}>
          <div className="bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-xl shadow-2xl p-6 max-w-sm w-full animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-500/10 text-red-500 rounded-full">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">{t('projects.deleteAssetTitle', 'Delete Asset')}</h3>
            </div>
            <p className="text-[var(--text-secondary)] mb-6 text-sm">
              {t('projects.deleteAssetDesc', 'Are you sure you want to delete this asset from your vault? This action cannot be undone.')}
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setImageToDelete(null)}
                className="px-4 py-2 rounded-lg font-medium bg-[var(--surface-2)] text-[var(--text-primary)] hover:bg-[var(--surface-3)] transition-colors"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button 
                onClick={async () => {
                  setIsDeleting(true);
                  await new Promise(r => setTimeout(r, 500));
                  removeGeneratedAsset(imageToDelete.id || imageToDelete.url);
                  setIsDeleting(false);
                  setImageToDelete(null);
                }}
                className="px-4 py-2 rounded-lg font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                {t('common.delete', 'Delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Multi) */}
      {showMultiDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowMultiDeleteModal(false)}>
          <div className="bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-xl shadow-2xl p-6 max-w-sm w-full animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-500/10 text-red-500 rounded-full">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Delete {selectedIds.size} Assets</h3>
            </div>
            <p className="text-[var(--text-secondary)] mb-6 text-sm">
              Are you sure you want to delete {selectedIds.size} assets from your vault? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowMultiDeleteModal(false)}
                className="px-4 py-2 rounded-lg font-medium bg-[var(--surface-2)] text-[var(--text-primary)] hover:bg-[var(--surface-3)] transition-colors"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button 
                onClick={handleDeleteSelected}
                className="px-4 py-2 rounded-lg font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                {t('common.delete', 'Delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-[var(--text-primary)] text-[var(--surface-1)] px-5 py-3 rounded-full shadow-2xl font-medium text-sm z-50 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          {toastMessage}
        </div>
      )}
    
      {/* Floating Select Button */}
      {!isSelectionMode && groupedAssets.length > 0 && (
        <button 
          onClick={() => setIsSelectionMode(true)}
          className="fixed bottom-24 right-6 z-40 bg-[#a855f7] text-white px-5 py-3 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:bg-[#9333ea] transition-all transform hover:scale-105 flex items-center justify-center gap-2 font-semibold"
        >
          <CheckSquare className="w-5 h-5" /> Select Mode
        </button>
      )}

      {isDeleting && (
        <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-12 h-12 border-4 border-[#a855f7] border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-white font-semibold tracking-widest uppercase text-sm">Deleting...</div>
        </div>
      )}
</div>
  );
}

