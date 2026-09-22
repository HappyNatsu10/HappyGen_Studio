import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, Sparkles, Send, Copy, Check, Loader2, ImagePlus, Brush, Video , ChevronDown, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { upscaleImage } from '../../services/aiService';
import useWorkspaceStore from '../../store/useWorkspaceStore';
import useAppStore from '../../store/useAppStore';

import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Media } from '@capacitor-community/media';

export default function ImageViewerModal({ image, images = [], currentIndex = 0, onIndexChange, isOpen, onClose }) {
  const { t } = useTranslation();
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  // If `images` is passed, we use `images[currentIndex]`. Otherwise fallback to `image`.
  const activeImage = (images && images.length > 0) ? images[currentIndex] : image;
  const [currentImage, setCurrentImage] = useState(activeImage);
  const [toastMessage, setToastMessage] = useState('');
  
  const [isFaceFixing, setIsFaceFixing] = useState(false);
  const [faceFixEngine, setFaceFixEngine] = useState("GFPGAN");
  const [showFaceFixOptions, setShowFaceFixOptions] = useState(false);

  const [copiedSeed, setCopiedSeed] = useState(false);
  const [showUpscaleSettings, setShowUpscaleSettings] = useState(false);
  const [upscaleScale, setUpscaleScale] = useState(2);
  const [upscaleModel, setUpscaleModel] = useState("R-ESRGAN 4x+ Anime6B");
  const [isDownloading, setIsDownloading] = useState(false);

  // Sync currentImage when activeImage changes
  React.useEffect(() => {
    setCurrentImage(activeImage);
  }, [activeImage]);

  const { addGeneratedAssets, setCanvasTargetImage, setInpaintSourceImage, setVideoSourceImage } = useWorkspaceStore();
  const { setActiveTab } = useAppStore();

  if (!isOpen || !currentImage) return null;

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const hasMultiple = images && images.length > 1;
  const handlePrev = (e) => {
    e.stopPropagation();
    if (onIndexChange) {
      onIndexChange(currentIndex > 0 ? currentIndex - 1 : images.length - 1);
    }
  };
  const handleNext = (e) => {
    e.stopPropagation();
    if (onIndexChange) {
      onIndexChange(currentIndex < images.length - 1 ? currentIndex + 1 : 0);
    }
  };

  const handleFaceFix = async (e) => {
    e.stopPropagation();
    setIsFaceFixing(true);
    setShowFaceFixOptions(false);
    try {
      const { faceFixImage } = require('../../services/aiService');
      const useModelStore = require('../../store/useModelStore').default;
      const fixedImages = await faceFixImage({ 
        sourceImage: currentImage.url, 
        prompt: currentImage.prompt, 
        engine: faceFixEngine,
        baseModel: useModelStore.getState().baseModel,
        civitaiApiKey: useAppStore.getState().civitaiApiKey
      });
      if (fixedImages && fixedImages.length > 0) {
        const newImage = {
          ...currentImage,
          ...fixedImages[0],
          prompt: currentImage.prompt ? `${currentImage.prompt} (Face Fixed)` : `Face Fixed Image`,
          isFaceFixed: true
        };
        addGeneratedAssets([newImage]);
        setCurrentImage(newImage);
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
      const isNativeApp = window.Capacitor && window.Capacitor.isNativePlatform();
      
      const response = await fetch(currentImage.url);
      const blob = await response.blob();
      
      if (isNativeApp) {
        // Read blob as base64 for Capacitor
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64data = reader.result;
          const fileName = `happygen-${currentImage.seed || Date.now()}.png`;
          try {
            let pureBase64 = base64data;
            if (base64data.includes(',')) {
              pureBase64 = base64data.split(',')[1];
            }
            
            // First ensure permissions
            try {
              const perm = await Media.checkPermissions();
              if (perm.publicStorage !== 'granted') {
                await Media.requestPermissions();
              }
            } catch (permErr) {
              console.log("Permission check error (expected on some OS versions):", permErr);
              // Fallback to directly requesting
              await Media.requestPermissions().catch(e => console.log(e));
            }

            // 1. Write to cache directory first
            const cacheFile = await Filesystem.writeFile({
              path: fileName,
              data: pureBase64,
              directory: Directory.Cache
            });
            
            // 2. Save to gallery using Media plugin
            await Media.savePhoto({
              path: cacheFile.uri,
              album: 'HappyGen Studio'
            });
            
            showToast('Image successfully saved to your gallery!');
          } catch (err) {
            console.error("Capacitor save/share error:", err);
            // Fallback to share sheet if direct save fails
            try {
              // Write to cache directory temporarily for sharing
              const cacheFile = await Filesystem.writeFile({
                path: fileName,
                data: pureBase64,
                directory: Directory.Cache
              });
              
              await Share.share({
                title: 'Generated Image',
                url: cacheFile.uri,
                dialogTitle: 'Save or Share Image'
              });
            } catch (shareErr) {
              console.error("Share fallback error:", shareErr);
              showToast('Failed to save image: ' + err.message);
            }
          } finally {
            setIsDownloading(false);
          }
        };
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
        setCurrentImage(newImage); // update view to upscaled version
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

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col bg-black/90 backdrop-blur-md animate-fade-in h-[100dvh]">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[10000] bg-[var(--surface-1)] border border-[var(--border-subtle)] text-white px-4 py-2 rounded-lg shadow-xl animate-fade-in flex items-center gap-2 text-sm font-medium transition-all">
          <Check className="w-4 h-4 text-[var(--success)]" />
          {toastMessage}
        </div>
      )}

      {/* Top Bar */}
      <div className="shrink-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent z-10">
        <div className="text-white/80 text-sm font-medium">{t('viewer.imageDetails', 'Image Details')}</div>
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

      {/* Main Image Area */}
      <div className="flex-1 relative flex items-center justify-center p-4 min-h-0">
        {hasMultiple && (
          <button 
            onClick={handlePrev} 
            className="absolute left-4 z-30 p-3 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors"
          >
            <ChevronDown className="w-6 h-6 rotate-90" />
          </button>
        )}
        {isUpscaling && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm rounded-lg">
            <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
            <div className="text-white font-bold tracking-widest uppercase text-sm">{t('viewer.enhancing', 'Enhancing...')}</div>
          </div>
        )}
        {isFaceFixing && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm rounded-lg">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <div className="text-white font-bold tracking-widest uppercase text-sm">{t('viewer.fixingFace', 'Fixing Face...')}</div>
          </div>
        )}
        <img 
          src={currentImage.url} 
          alt={currentImage.prompt || 'Generated image'} 
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        />
        
        {/* Generation Details Panel */}
        {showDetails && (
          <div className="absolute right-4 top-4 bottom-4 w-72 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 overflow-y-auto z-40 text-left shadow-2xl animate-fade-in custom-scrollbar">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-purple-400" /> {t('viewer.generationDetails', 'Generation Details')}
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="text-xs text-slate-400 mb-1">{t('viewer.baseModel', 'Base Model')}</div>
                <div className="text-sm text-slate-200 font-medium break-words bg-white/5 p-2 rounded-lg border border-white/5">
                  {currentImage.model || currentImage.modelUsed || t('viewer.unknown', 'Unknown')}
                </div>
              </div>
              
              {(currentImage.lora || currentImage.loras) && (
                <div>
                  <div className="text-xs text-slate-400 mb-1">{t('viewer.lora', 'LoRA')}</div>
                  <div className="text-sm text-slate-200 font-medium break-words bg-white/5 p-2 rounded-lg border border-white/5">
                    {currentImage.lora || (currentImage.loras && currentImage.loras.join(', '))}
                  </div>
                </div>
              )}

              <div>
                <div className="text-xs text-slate-400 mb-1">{t('viewer.prompt', 'Prompt')}</div>
                <div className="text-sm text-slate-200 break-words bg-white/5 p-2 rounded-lg border border-white/5 max-h-32 overflow-y-auto custom-scrollbar">
                  {currentImage.prompt || t('viewer.none', 'None')}
                </div>
              </div>

              {currentImage.negativePrompt && (
                <div>
                  <div className="text-xs text-slate-400 mb-1">{t('viewer.negativePrompt', 'Negative Prompt')}</div>
                  <div className="text-sm text-red-200/80 break-words bg-red-500/5 p-2 rounded-lg border border-red-500/10 max-h-32 overflow-y-auto custom-scrollbar">
                    {currentImage.negativePrompt}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">{t('viewer.steps', 'Steps')}</div>
                  <div className="text-sm text-slate-200 font-mono">{currentImage.steps || 20}</div>
                </div>
                <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">{t('viewer.cfgScale', 'CFG Scale')}</div>
                  <div className="text-sm text-slate-200 font-mono">{currentImage.cfg || 7.0}</div>
                </div>
                <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">{t('viewer.sampler', 'Sampler')}</div>
                  <div className="text-sm text-slate-200 truncate" title={currentImage.sampler || 'DPM++ 2M Karras'}>
                    {currentImage.sampler || 'DPM++ 2M Karras'}
                  </div>
                </div>
                <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">{t('viewer.dimensions', 'Dimensions')}</div>
                  <div className="text-sm text-slate-200 font-mono">
                    {currentImage.width && currentImage.height ? `${currentImage.width}x${currentImage.height}` : '512x768'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {hasMultiple && (
          <button 
            onClick={handleNext} 
            className="absolute right-4 z-30 p-3 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors"
          >
            <ChevronDown className="w-6 h-6 -rotate-90" />
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
                <span className="text-xs text-slate-400 font-mono">
                  {currentImage.width}x{currentImage.height}
                </span>
              )}
              {currentImage.seed && (
                <button
                  onClick={handleCopySeed}
                  className="flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-white transition-colors"
                >
                  Seed: {currentImage.seed}
                  {copiedSeed ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                </button>
              )}
              {currentImage.modelUsed && (
                <span className="text-xs text-slate-400 truncate max-w-[150px]">
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
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{t('viewer.engine', 'Engine')}</span>
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
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
}
