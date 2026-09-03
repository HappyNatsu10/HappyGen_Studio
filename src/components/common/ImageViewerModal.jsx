import React, { useState } from 'react';
import { X, Download, Sparkles, Send, Copy, Check, Loader2, ImagePlus, Brush, Video } ChevronDown } from 'lucide-react';
import { upscaleImage } from '../../services/aiService';
import useWorkspaceStore from '../../store/useWorkspaceStore';
import useAppStore from '../../store/useAppStore';

export default function ImageViewerModal({ image, isOpen, onClose }) {
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [currentImage, setCurrentImage] = useState(image);
  const [copiedSeed, setCopiedSeed] = useState(false);
  const [showUpscaleSettings, setShowUpscaleSettings] = useState(false);
  const [upscaleScale, setUpscaleScale] = useState(2);
  const [upscaleModel, setUpscaleModel] = useState("R-ESRGAN 4x+ Anime6B");

  // Sync currentImage when prop changes (in case gallery cycles images)
  React.useEffect(() => {
    setCurrentImage(image);
  }, [image]);

  const { addGeneratedAssets, setCanvasTargetImage, setInpaintSourceImage, setVideoSourceImage } = useWorkspaceStore();
  const { setActiveTab } = useAppStore();

  if (!isOpen || !currentImage) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = currentImage.url;
    a.download = `omnigen-${currentImage.seed || Date.now()}.png`;
    a.click();
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
    setActiveTab('generate');
    // We dispatch a custom event that GeneratePage will listen to
    window.dispatchEvent(new CustomEvent('set-generation-mode', { detail: 'inpaint' }));
    onClose();
  };

  const handleSendToVideo = () => {
    setVideoSourceImage(currentImage.url);
    setActiveTab('video');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
      
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent z-10">
        <div className="text-white/80 text-sm font-medium">Image Details</div>
        <button 
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Image Area */}
      <div className="relative max-w-[90vw] max-h-[80vh] flex items-center justify-center">
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
          style={{ maxHeight: '80vh' }}
        />
      </div>

      {/* Bottom Bar: Metadata & Actions */}
      <div className="absolute bottom-0 left-0 right-0 bg-[var(--surface-1)] border-t border-[var(--border-subtle)] p-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Info */}
          <div className="flex-1 min-w-0 max-w-2xl">
            <p className="text-sm text-white font-medium truncate mb-1" title={currentImage.prompt}>
              {currentImage.prompt || 'No prompt specified'}
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              {currentImage.width && currentImage.height && (
                <span className="text-xs text-slate-400 font-mono">
                  {currentImage.width}×{currentImage.height}
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
          <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
            <button
              onClick={handleUpscale}
              disabled={isUpscaling || currentImage.isUpscaled}
              className={`flex items-center gap-1.5 px-4 py-2 border rounded-xl transition-all text-sm font-semibold disabled:opacity-50 ${
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
              className="flex items-center gap-1.5 px-4 py-2 bg-[var(--surface-2)] text-slate-200 hover:bg-[var(--surface-3)] border border-[var(--border-subtle)] rounded-xl transition-all text-sm font-medium"
            >
              <Brush className="w-4 h-4" />
              Inpaint
            </button>
            <button
              onClick={handleSendToVideo}
              className="flex items-center gap-1.5 px-4 py-2 bg-[var(--surface-2)] text-slate-200 hover:bg-[var(--surface-3)] border border-[var(--border-subtle)] rounded-xl transition-all text-sm font-medium"
            >
              <Video className="w-4 h-4" />
              Video
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 bg-[var(--surface-2)] text-slate-200 hover:bg-[var(--surface-3)] border border-[var(--border-subtle)] rounded-xl transition-all text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
