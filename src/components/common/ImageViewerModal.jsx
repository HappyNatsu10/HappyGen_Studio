import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, Sparkles, Send, Copy, Check, Loader2, ImagePlus, Brush, Video, ChevronLeft, ChevronRight, ChevronDown, Info, Trash2, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { upscaleImage, faceFixImage } from '../../services/aiService';
import useWorkspaceStore from '../../store/useWorkspaceStore';
import useModelStore from '../../store/useModelStore';
import useAppStore from '../../store/useAppStore';

import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Media } from '@capacitor-community/media';
import { saveImageToGallery } from '../../utils/mediaUtils';

export default function ImageViewerModal({ image, images = [], currentIndex = 0, onIndexChange, isOpen, onClose, onDelete }) {
  const { t } = useTranslation();
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [copiedDetails, setCopiedDetails] = useState(false);
  
  const handleCopyDetails = () => {
    if (!currentImage) return;
    const loraText = currentImage.lora ? `\nLoRA: ${currentImage.lora}` : currentImage.loras ? `\nLoRAs: ${currentImage.loras.join(', ')}` : '';
    const negPromptText = currentImage.negativePrompt ? `\nNegative Prompt: ${currentImage.negativePrompt}` : '';
    const dateText = currentImage.timestamp ? new Date(currentImage.timestamp).toLocaleString() : 'Unknown';
    
    const details = `Base Model: ${currentImage.model || currentImage.modelUsed || 'Unknown'}${loraText}
Prompt: ${currentImage.prompt || 'None'}${negPromptText}
Steps: ${currentImage.steps || 20}
CFG Scale: ${currentImage.cfg || 7.0}
Sampler: ${currentImage.sampler || 'DPM++ 2M Karras'}
Dimensions: ${currentImage.width && currentImage.height ? `${currentImage.width}x${currentImage.height}` : '512x768'}
Seed: ${currentImage.seed || 'Unknown'}
Date: ${dateText}`.trim();

    navigator.clipboard.writeText(details);
    setCopiedDetails(true);
    setTimeout(() => setCopiedDetails(false), 2000);
  };
  
  // If `images` is passed, we use `images[currentIndex]`. Otherwise fallback to `image`.
  const activeImage = (images && images.length > 0 && currentIndex >= 0 && currentIndex < images.length) 
    ? images[currentIndex] 
    : (images && images.length > 0 ? images[0] : image);

  const [enhancedState, setEnhancedState] = useState({ index: null, image: null });
  const [toastMessage, setToastMessage] = useState('');
  
  const [isFaceFixing, setIsFaceFixing] = useState(false);
  const [faceFixEngine, setFaceFixEngine] = useState("GFPGAN");
  const [showFaceFixOptions, setShowFaceFixOptions] = useState(false);

  const [copiedSeed, setCopiedSeed] = useState(false);
  const [showUpscaleSettings, setShowUpscaleSettings] = useState(false);
  const [upscaleScale, setUpscaleScale] = useState(2);
  const [upscaleModel, setUpscaleModel] = useState("R-ESRGAN 4x+ Anime6B");
  const [isDownloading, setIsDownloading] = useState(false);

  // Synchronously compute enhanced image only if it matches currentIndex
  const enhancedImage = (enhancedState.index === currentIndex) ? enhancedState.image : null;
  const currentImage = enhancedImage || activeImage;

  const { addGeneratedAssets, setCanvasTargetImage, setInpaintSourceImage, setVideoSourceImage } = useWorkspaceStore();
  const { setActiveTab } = useAppStore();

  const batchInfo = React.useMemo(() => {
    if (!currentImage || !images || images.length === 0) return null;
    if (!currentImage.timestamp) return null;
    const batch = images.filter(img => Math.abs((img.timestamp || 0) - currentImage.timestamp) < 2000);
    if (batch.length <= 1) return null;
    batch.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    const idx = batch.findIndex(img => 
      (img.id && currentImage.id && img.id === currentImage.id) || 
      (img.url && currentImage.url && img.url === currentImage.url)
    ) + 1;
    return { index: Math.max(1, idx), total: batch.length };
  }, [currentImage, images]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const hasMultiple = images && images.length > 1;
  const [slideDirection, setSlideDirection] = useState(0);
  const isNavigatingRef = React.useRef(false);
  const activeThumbnailRef = React.useRef(null);

  // Auto-scroll active thumbnail into view
  useEffect(() => {
    if (activeThumbnailRef.current) {
      activeThumbnailRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [currentIndex]);

  const handlePrev = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (isNavigatingRef.current) return;
    if (onIndexChange && hasMultiple) {
      isNavigatingRef.current = true;
      setTimeout(() => { isNavigatingRef.current = false; }, 260);
      setSlideDirection(-1);
      onIndexChange(currentIndex > 0 ? currentIndex - 1 : images.length - 1);
    }
  };

  const handleNext = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (isNavigatingRef.current) return;
    if (onIndexChange && hasMultiple) {
      isNavigatingRef.current = true;
      setTimeout(() => { isNavigatingRef.current = false; }, 260);
      setSlideDirection(1);
      onIndexChange(currentIndex < images.length - 1 ? currentIndex + 1 : 0);
    }
  };

  const handleSelectIndex = (idx) => {
    if (isNavigatingRef.current || idx === currentIndex) return;
    if (onIndexChange && idx >= 0 && idx < images.length) {
      isNavigatingRef.current = true;
      setTimeout(() => { isNavigatingRef.current = false; }, 260);
      setSlideDirection(idx > currentIndex ? 1 : -1);
      onIndexChange(idx);
    }
  };

  // Keyboard navigation: Left/Right arrows to cycle pictures, Escape to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasMultiple, currentIndex, images.length]);

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 280 : dir < 0 ? -280 : 0,
      opacity: 0,
      scale: 0.96
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring', stiffness: 350, damping: 32 },
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 }
      }
    },
    exit: (dir) => ({
      x: dir > 0 ? -280 : dir < 0 ? 280 : 0,
      opacity: 0,
      scale: 0.96,
      pointerEvents: 'none',
      transition: {
        x: { duration: 0.22, ease: 'easeOut' },
        opacity: { duration: 0.18, ease: 'easeOut' }
      }
    })
  };

  const handleFaceFix = async (e) => {
    e.stopPropagation();
    setIsFaceFixing(true);
    setShowFaceFixOptions(false);
    try {
      const fixedImages = await faceFixImage({ 
        sourceImage: currentImage.url, 
        prompt: currentImage.prompt, 
        engine: faceFixEngine,
        baseModel: useModelStore.getState().baseModel,
        civitaiApiKey: localStorage.getItem('omnigen_civitai_key') || ''
      });
      if (fixedImages && fixedImages.length > 0) {
        const newImage = {
          ...currentImage,
          ...fixedImages[0],
          prompt: currentImage.prompt ? `${currentImage.prompt} (Face Fixed)` : `Face Fixed Image`,
          isFaceFixed: true
        };
        addGeneratedAssets([newImage]);
        setEnhancedState({ index: currentIndex, image: newImage });
        showToast(`Face fixed using ${faceFixEngine}`);
      }
    } catch (err) {
      console.error('Failed to fix face:', err);
      showToast('Failed to fix face: ' + err.message);
    } finally {
      setIsFaceFixing(false);
    }
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const isNativeApp = Capacitor.isNativePlatform();
      
      const response = await fetch(currentImage.url);
      const blob = await response.blob();
      
      if (isNativeApp) {
        const fileName = `happygen-${currentImage.seed || Date.now()}.png`;
        try {
          await saveImageToGallery(currentImage.url, fileName);
          showToast('Image successfully saved to your gallery!');
        } catch (err) {
          console.error("Capacitor save/share error:", err);
          showToast('Failed to save image: ' + (err.message || 'Unknown error'));
        } finally {
          setIsDownloading(false);
        }
      } else {
        // Web fallback
        if (navigator.share && /mobile/i.test(navigator.userAgent)) {
          const file = new File([blob], `happygen-${currentImage.seed || Date.now()}.png`, { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'Generated Image'
            });
            setIsDownloading(false);
            return;
          }
        }
        
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `happygen-${currentImage.seed || Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        setIsDownloading(false);
      }
    } catch (e) {
      console.error("Download failed, falling back to direct link", e);
      const a = document.createElement('a');
      a.href = currentImage.url;
      a.download = `happygen-${currentImage.seed || Date.now()}.png`;
      a.target = '_blank';
      a.click();
      setIsDownloading(false);
    }
  };

  const handleCopySeed = () => {
    if (!currentImage.seed) return;
    navigator.clipboard.writeText(currentImage.seed.toString());
    setCopiedSeed(true);
    setTimeout(() => setCopiedSeed(false), 1500);
  };

  const handleUpscale = async () => {
    setIsUpscaling(true);
    setShowUpscaleSettings(false);
    try {
      const upscaledImages = await upscaleImage({ sourceImage: currentImage.url, scale: upscaleScale, upscalerName: upscaleModel });
      if (upscaledImages && upscaledImages.length > 0) {
        const newImage = {
          ...currentImage,
          ...upscaledImages[0],
          width: currentImage.width ? Math.round(currentImage.width * upscaleScale) : null,
          height: currentImage.height ? Math.round(currentImage.height * upscaleScale) : null,
          prompt: currentImage.prompt ? `${currentImage.prompt} (Upscaled ${upscaleScale}x)` : `Upscaled Image (${upscaleScale}x)`,
          isUpscaled: true
        };
        addGeneratedAssets([newImage]);
        setEnhancedState({ index: currentIndex, image: newImage }); // update view to upscaled version
      }
    } catch (err) {
      console.error('Failed to upscale:', err);
    } finally {
      setIsUpscaling(false);
    }
  };

  const handleSendToInpaint = () => {
    setInpaintSourceImage(currentImage.url);
    setActiveTab('inpaint');
    onClose();
  };

  const handleSendToVideo = () => {
    setVideoSourceImage(currentImage.url);
    setActiveTab('video');
    onClose();
  };

  if (!isOpen || !currentImage) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col bg-black/90 backdrop-blur-md animate-fade-in h-[100dvh]">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[10000] bg-[var(--surface-1)] border border-[var(--border-subtle)] text-[var(--text-primary)] px-4 py-2 rounded-lg shadow-xl animate-fade-in flex items-center gap-2 text-sm font-medium transition-all">
          <Check className="w-4 h-4 text-[var(--success)]" />
          {toastMessage}
        </div>
      )}

      {/* Top Bar */}
      <div className="shrink-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent z-10">
        <div className="flex items-center gap-3">
          <div className="text-white/80 text-sm font-medium">{t('viewer.imageDetails', 'Image Details')}</div>
          {hasMultiple && (
            <div className="bg-white/10 backdrop-blur-md text-white/90 text-xs px-2.5 py-1 rounded-full border border-white/15 font-mono shadow-xs">
              {currentIndex + 1} / {images.length}
            </div>
          )}
          {batchInfo && (
            <div className="bg-black/50 backdrop-blur-md text-white/90 text-xs px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1.5 shadow-sm">
              <Layers className="w-3.5 h-3.5" />
              Batch {batchInfo.index} of {batchInfo.total}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className={`p-2 rounded-full transition-colors ${showDetails ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white/80'}`}
            title="Toggle Generation Details"
          >
            <Info className="w-5 h-5" />
          </button>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Image Area with Touch & Drag Swiping */}
      <div className="flex-1 relative flex items-center justify-center p-4 min-h-0 overflow-hidden select-none">
        {hasMultiple && (
          <button 
            onClick={handlePrev} 
            className="absolute left-4 z-30 p-3 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors cursor-pointer shadow-lg backdrop-blur-xs"
            title="Previous (Left Arrow / Swipe Right)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        {isUpscaling && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs rounded-lg pointer-events-auto">
            <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
            <div className="text-white font-bold tracking-widest uppercase text-sm">{t('viewer.enhancing', 'Enhancing...')}</div>
          </div>
        )}
        {isFaceFixing && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs rounded-lg pointer-events-auto">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <div className="text-white font-bold tracking-widest uppercase text-sm">{t('viewer.fixingFace', 'Fixing Face...')}</div>
          </div>
        )}

        <AnimatePresence initial={false} custom={slideDirection} mode="popLayout">
          <motion.div
            key={`img-slide-${currentIndex}-${currentImage?.id || currentImage?.url || currentIndex}`}
            custom={slideDirection}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            drag={hasMultiple && !isUpscaling && !isFaceFixing ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.65}
            onDragEnd={(e, { offset, velocity }) => {
              if (isNavigatingRef.current) return;
              const swipeConfidenceThreshold = 50;
              const swipeVelocityThreshold = 250;
              if (offset.x < -swipeConfidenceThreshold || velocity.x < -swipeVelocityThreshold) {
                handleNext();
              } else if (offset.x > swipeConfidenceThreshold || velocity.x > swipeVelocityThreshold) {
                handlePrev();
              }
            }}
            className={`absolute inset-0 flex items-center justify-center p-4 ${
              hasMultiple ? 'cursor-grab active:cursor-grabbing' : ''
            }`}
            style={{ touchAction: 'none' }}
          >
            <img 
              src={currentImage.url} 
              alt={currentImage.prompt || 'Generated image'} 
              draggable={false}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl pointer-events-none select-none"
            />
          </motion.div>
        </AnimatePresence>

        {/* Floating Thumbnail Strip for Multiple Images */}
        {hasMultiple && (
          <div 
            className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 max-w-[90vw] overflow-x-auto p-1.5 rounded-2xl bg-black/60 backdrop-blur-md border border-white/15 shadow-2xl custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            {images.map((img, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={img.id ? `${img.id}-${idx}` : `${img.url || ''}-${idx}`}
                  ref={isActive ? activeThumbnailRef : null}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectIndex(idx);
                  }}
                  className={`relative shrink-0 rounded-lg overflow-hidden transition-all duration-200 cursor-pointer ${
                    isActive 
                      ? 'w-11 h-11 ring-2 ring-[#a855f7] scale-105 opacity-100 shadow-md' 
                      : 'w-9 h-9 opacity-50 hover:opacity-90'
                  }`}
                  title={`Picture ${idx + 1} of ${images.length}`}
                >
                  <img 
                    src={img.url} 
                    alt="" 
                    draggable={false}
                    className="w-full h-full object-cover select-none pointer-events-none" 
                  />
                  {isActive && (
                    <div className="absolute inset-0 bg-[#a855f7]/20 pointer-events-none" />
                  )}
                </button>
              );
            })}
          </div>
        )}
        
        {/* Generation Details Panel */}
        {showDetails && (
          <div className="absolute right-4 top-4 bottom-4 w-72 bg-[var(--surface-1)]/90 backdrop-blur-xl border border-[var(--border-subtle)] rounded-2xl p-5 overflow-y-auto z-40 text-left shadow-2xl animate-fade-in custom-scrollbar">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[var(--text-primary)] font-semibold flex items-center gap-2">
              <Info className="w-4 h-4 text-[#a855f7]" /> {t('viewer.generationDetails', 'Generation Details')}
            </h3>
              <button 
                onClick={handleCopyDetails}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[var(--surface-3)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-4)] transition-all border border-[var(--border-subtle)]"
                title={t('viewer.copyDetails', 'Copy Details')}
              >
                {copiedDetails ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedDetails ? t('viewer.copied', 'Copied!') : t('viewer.copy', 'Copy')}
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="text-xs text-[var(--text-tertiary)] mb-1">{t('viewer.baseModel', 'Base Model')}</div>
                <div className="text-sm text-[var(--text-secondary)] font-medium break-words bg-[var(--surface-3)] p-2 rounded-lg border border-[var(--border-subtle)]">
                  {currentImage.model || currentImage.modelUsed || t('viewer.unknown', 'Unknown')}
                </div>
              </div>
              
              {(currentImage.lora || currentImage.loras) && (
                <div>
                  <div className="text-sm text-[var(--text-secondary)] font-medium break-words bg-[var(--surface-3)] p-2 rounded-lg border border-[var(--border-subtle)]">
                    {currentImage.lora || (currentImage.loras && currentImage.loras.join(', '))}
                  </div>
                </div>
              )}

              <div>
                <div className="text-xs text-[var(--text-tertiary)] mb-1">{t('viewer.prompt', 'Prompt')}</div>
                <div className="text-sm text-[var(--text-secondary)] break-words bg-[var(--surface-3)] p-2 rounded-lg border border-[var(--border-subtle)] max-h-32 overflow-y-auto custom-scrollbar">
                  {currentImage.prompt || t('viewer.none', 'None')}
                </div>
              </div>

              {currentImage.negativePrompt && (
                <div>
                  <div className="text-xs text-[var(--text-tertiary)] mb-1">{t('viewer.negativePrompt', 'Negative Prompt')}</div>
                  <div className="text-sm text-red-500/80 break-words bg-red-500/5 p-2 rounded-lg border border-red-500/10 max-h-32 overflow-y-auto custom-scrollbar">
                    {currentImage.negativePrompt}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[var(--surface-3)] p-2 rounded-lg border border-[var(--border-subtle)]">
                  <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">{t('viewer.steps', 'Steps')}</div>
                  <div className="text-sm text-[var(--text-secondary)] font-mono">{currentImage.steps || 20}</div>
                </div>
                <div className="bg-[var(--surface-3)] p-2 rounded-lg border border-[var(--border-subtle)]">
                  <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">{t('viewer.cfgScale', 'CFG Scale')}</div>
                  <div className="text-sm text-[var(--text-secondary)] font-mono">{currentImage.cfg || 7.0}</div>
                </div>
                <div className="bg-[var(--surface-3)] p-2 rounded-lg border border-[var(--border-subtle)]">
                  <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">{t('viewer.sampler', 'Sampler')}</div>
                  <div className="text-sm text-[var(--text-secondary)] truncate" title={currentImage.sampler || 'DPM++ 2M Karras'}>
                    {currentImage.sampler || 'DPM++ 2M Karras'}
                  </div>
                </div>
                <div className="bg-[var(--surface-3)] p-2 rounded-lg border border-[var(--border-subtle)]">
                  <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">{t('viewer.dimensions', 'Dimensions')}</div>
                  <div className="text-sm text-[var(--text-secondary)] font-mono">
                    {currentImage.width && currentImage.height ? `${currentImage.width}x${currentImage.height}` : '512x768'}
                  </div>
                </div>
                <div className="bg-[var(--surface-3)] p-2 rounded-lg border border-[var(--border-subtle)] col-span-2">
                  <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">{t('viewer.date', 'Date')}</div>
                  <div className="text-sm text-[var(--text-secondary)]">
                    {currentImage.timestamp ? new Date(currentImage.timestamp).toLocaleString() : t('viewer.unknown', 'Unknown')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {hasMultiple && (
          <button 
            onClick={handleNext} 
            className="absolute right-4 z-30 p-3 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors cursor-pointer shadow-lg backdrop-blur-xs"
            title="Next (Right Arrow / Swipe Left)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom Bar: Metadata & Actions */}
      <div className="shrink-0 bg-[var(--surface-1)] border-t border-[var(--border-subtle)] p-4 md:px-8 pb-safe">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Info */}
          <div className="flex-1 min-w-0 max-w-2xl w-full text-center md:text-left">
            <p className="text-sm text-[var(--text-primary)] font-medium truncate mb-1" title={currentImage.prompt}>
              {currentImage.prompt || 'No prompt specified'}
            </p>
            <div className="flex items-center justify-center md:justify-start gap-4 flex-wrap">
              {currentImage.width && currentImage.height && (
                <span className="text-xs text-[var(--text-tertiary)] font-mono flex items-center gap-2">
                  {currentImage.width}x{currentImage.height}
                  {currentImage.timestamp && (
                    <span>• {new Date(currentImage.timestamp).toLocaleString()}</span>
                  )}
                </span>
              )}
              {currentImage.seed && (
                <button
                  onClick={handleCopySeed}
                  className="flex items-center gap-1 text-xs font-mono text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Seed: {currentImage.seed}
                  {copiedSeed ? <Check className="w-3 h-3 text-[var(--success)]" /> : <Copy className="w-3 h-3" />}
                </button>
              )}
              {currentImage.modelUsed && (
                <span className="text-xs text-[var(--text-tertiary)] truncate max-w-[150px]">
                  {currentImage.modelUsed}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap pb-1 shrink-0 w-full md:w-auto">
            
            {/* Face Fix Button with Dropdown */}
            <div className="relative">
              <div className="flex rounded-xl overflow-hidden border border-blue-500/30 transition-all">
                <button
                  onClick={handleFaceFix}
                  disabled={isFaceFixing || currentImage.isFaceFixed}
                  className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold disabled:opacity-50 ${
                    currentImage.isFaceFixed 
                      ? 'bg-blue-500/10 text-blue-500' 
                      : 'bg-blue-500/20 text-[var(--text-primary)] hover:bg-blue-500/30'
                  }`}
                >
                  {currentImage.isFaceFixed ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  {currentImage.isFaceFixed ? 'Face Fixed' : 'Fix Face'}
                </button>
                {!currentImage.isFaceFixed && (
                  <button
                    onClick={() => setShowFaceFixOptions(!showFaceFixOptions)}
                    className="px-2 py-2 bg-blue-500/20 text-[var(--text-primary)] hover:bg-blue-500/30 border-l border-blue-500/30"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {showFaceFixOptions && !currentImage.isFaceFixed && (
                <div className="absolute bottom-full mb-2 right-0 bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-xl shadow-xl overflow-hidden z-50 w-40">
                  <div className="p-2 border-b border-[var(--border-subtle)] bg-[var(--surface-3)]">
                    <span className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">{t('viewer.engine', 'Engine')}</span>
                  </div>
                  <button
                    onClick={() => { setFaceFixEngine("GFPGAN"); setShowFaceFixOptions(false); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-[var(--surface-3)] transition-colors flex items-center justify-between ${faceFixEngine === "GFPGAN" ? 'text-[var(--accent)] font-medium' : 'text-[var(--text-secondary)]'}`}
                  >
                    GFPGAN
                    {faceFixEngine === "GFPGAN" && <Check className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => { setFaceFixEngine("ADetailer"); setShowFaceFixOptions(false); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-[var(--surface-3)] transition-colors flex items-center justify-between ${faceFixEngine === "ADetailer" ? 'text-[var(--accent)] font-medium' : 'text-[var(--text-secondary)]'}`}
                  >
                    ADetailer
                    {faceFixEngine === "ADetailer" && <Check className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleUpscale}
              disabled={isUpscaling || currentImage.isUpscaled}
              className={`flex items-center gap-1.5 px-4 py-2 border rounded-xl transition-all text-sm font-semibold disabled:opacity-50 shrink-0 ${
                currentImage.isUpscaled 
                  ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                  : 'bg-purple-500/20 text-[var(--text-primary)] hover:bg-purple-500/30 border-purple-500/30'
              }`}
            >
              {currentImage.isUpscaled ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              {currentImage.isUpscaled ? 'Upscaled' : 'Upscale'}
            </button>
            <button
              onClick={handleSendToInpaint}
              className="flex items-center gap-1.5 px-4 py-2 bg-[var(--surface-2)] text-[var(--text-primary)] hover:bg-[var(--surface-3)] border border-[var(--border-subtle)] rounded-xl transition-all text-sm font-medium shrink-0"
            >
              <Brush className="w-4 h-4" />
              Inpaint
            </button>
            <button
              onClick={handleSendToVideo}
              className="flex items-center gap-1.5 px-4 py-2 bg-[var(--surface-2)] text-[var(--text-primary)] hover:bg-[var(--surface-3)] border border-[var(--border-subtle)] rounded-xl transition-all text-sm font-medium shrink-0"
            >
              <Video className="w-4 h-4" />
              Video
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-1.5 px-4 py-2 bg-[var(--surface-2)] text-[var(--text-primary)] hover:bg-[var(--surface-3)] border border-[var(--border-subtle)] rounded-xl transition-all text-sm font-medium shrink-0 disabled:opacity-50"
            >
              {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {isDownloading ? 'Downloading...' : 'Download'}
            </button>
            {onDelete && (
              <button
                onClick={() => onDelete(currentImage)}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-all text-sm font-medium shrink-0 ml-auto md:ml-0"
              >
                <Trash2 className="w-4 h-4" />
                {t('common.delete', 'Delete')}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
}


