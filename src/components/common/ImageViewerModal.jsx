import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, Sparkles, Send, Copy, Check, Loader2, ImagePlus, Brush, Video , ChevronDown } from 'lucide-react';
import { upscaleImage } from '../../services/aiService';
import useWorkspaceStore from '../../store/useWorkspaceStore';
import useAppStore from '../../store/useAppStore';

import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Media } from '@capacitor-community/media';

export default function ImageViewerModal({ image, isOpen, onClose }) {
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [currentImage, setCurrentImage] = useState(image);
  const [copiedSeed, setCopiedSeed] = useState(false);
  const [showUpscaleSettings, setShowUpscaleSettings] = useState(false);
  const [upscaleScale, setUpscaleScale] = useState(2);
  const [upscaleModel, setUpscaleModel] = useState("R-ESRGAN 4x+ Anime6B");
  const [isDownloading, setIsDownloading] = useState(false);

  // Sync currentImage when prop changes (in case gallery cycles images)
  React.useEffect(() => {
    setCurrentImage(image);
  }, [image]);

  const { addGeneratedAssets, setCanvasTargetImage, setInpaintSourceImage, setVideoSourceImage } = useWorkspaceStore();
  const { setActiveTab } = useAppStore();

  if (!isOpen || !currentImage) return null;

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
            const perm = await Media.checkPermissions();
            if (perm.publicStorage !== 'granted') {
              await Media.requestPermissions();
            }

            // Write to cache directory temporarily
            const savedFile = await Filesystem.writeFile({
              path: fileName,
              data: pureBase64,
              directory: Directory.Cache
            });
            
            // Save to native gallery in 'HappyGen Studio' folder
            await Media.savePhoto({
              path: savedFile.uri,
              album: 'HappyGen Studio'
            });
            
            // Open native share sheet so user can "Save Image" to gallery or share to other apps
            await Share.share({
              title: 'Generated Image',
              url: savedFile.uri,
              dialogTitle: 'Share Image'
            });
          } catch (err) {
            console.error("Capacitor save/share error:", err);
          } finally {
            setIsDownloading(false);
          }
        };
      } else {
        // Web fallback
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
      
      {/* Top Bar */}
      <div className="shrink-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent z-10">
        <div className="text-white/80 text-sm font-medium">Image Details</div>
        <button 
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Image Area */}
      <div className="flex-1 relative flex items-center justify-center p-4 min-h-0">
        {isUpscaling && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm rounded-lg">
            <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
            <div className="text-white font-bold tracking-widest uppercase text-sm">Enhancing...</div>
          </div>
        )}
        <img 
          src={currentImage.url} 
          alt={currentImage.prompt || 'Generated image'} 
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        />
      </div>

      {/* Bottom Bar: Metadata & Actions */}
      <div className="shrink-0 bg-[var(--surface-1)] border-t border-[var(--border-subtle)] p-4 md:px-8 pb-safe">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Info */}
          <div className="flex-1 min-w-0 max-w-2xl w-full text-center md:text-left">
            <p className="text-sm text-white font-medium truncate mb-1" title={currentImage.prompt}>
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
          <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 w-full md:w-auto hide-scrollbar">
            <button
              onClick={handleUpscale}
              disabled={isUpscaling || currentImage.isUpscaled}
              className={`flex items-center gap-1.5 px-4 py-2 border rounded-xl transition-all text-sm font-semibold disabled:opacity-50 shrink-0 ${
                currentImage.isUpscaled 
                  ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                  : 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border-purple-500/30'
              }`}
            >
              {currentImage.isUpscaled ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              {currentImage.isUpscaled ? 'Upscaled' : 'Upscale'}
            </button>
            <button
              onClick={handleSendToInpaint}
              className="flex items-center gap-1.5 px-4 py-2 bg-[var(--surface-2)] text-slate-200 hover:bg-[var(--surface-3)] border border-[var(--border-subtle)] rounded-xl transition-all text-sm font-medium shrink-0"
            >
              <Brush className="w-4 h-4" />
              Inpaint
            </button>
            <button
              onClick={handleSendToVideo}
              className="flex items-center gap-1.5 px-4 py-2 bg-[var(--surface-2)] text-slate-200 hover:bg-[var(--surface-3)] border border-[var(--border-subtle)] rounded-xl transition-all text-sm font-medium shrink-0"
            >
              <Video className="w-4 h-4" />
              Video
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-1.5 px-4 py-2 bg-[var(--surface-2)] text-slate-200 hover:bg-[var(--surface-3)] border border-[var(--border-subtle)] rounded-xl transition-all text-sm font-medium shrink-0 disabled:opacity-50"
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
