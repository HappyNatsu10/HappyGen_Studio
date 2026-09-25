import React, { useState } from 'react';
import { Brush, Loader2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import InpaintCanvas from './generate/InpaintCanvas';
import PromptEditor from './generate/PromptEditor';
import { inpaintImage } from '../services/aiService';
import ImageUploadZone from './generate/ImageUploadZone';

import useAppStore from '../store/useAppStore';
import useWorkspaceStore from '../store/useWorkspaceStore';
import useGenerateStore from '../store/useGenerateStore';
import useModelStore from '../store/useModelStore';
import { useAuth } from '../context/AuthContext';
export default function InpaintStudio() {
  const { t } = useTranslation();
  const { incrementGeneratedCount } = useAuth();
  const { isAdultMode, mode } = useAppStore();
  const { inpaintSourceImage: sourceImage, setInpaintSourceImage: setSourceImage, addGeneratedAssets } = useWorkspaceStore();
  const [maskImage, setMaskImage] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('bad quality, worst quality');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!sourceImage) {
      setError(t('inpaint.errorNoSource', 'Please upload a source image first.'));
      return;
    }
    if (!maskImage) {
      setError(t('inpaint.errorNoMask', 'Please draw a mask over the area you want to change.'));
      return;
    }
    if (!prompt.trim()) {
      setError(t('inpaint.errorNoPrompt', 'Please provide a prompt describing what you want to generate in the masked area.'));
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResultImage(null);

    try {
      const { baseModel, loras, embeddings } = useModelStore.getState();
      const { aspectRatio, steps, cfg, sampler } = useGenerateStore.getState();

      if (baseModel?.name?.toLowerCase().includes('anima')) {
        throw new Error("The Anima model natively operates as a Text-to-Image architecture and does not support Inpainting. Please switch to an SDXL or Pony model.");
      }
      
      // Get exact image dimensions to prevent squashing/scaling
      const img = new Image();
      img.src = sourceImage;
      await new Promise(resolve => { img.onload = resolve; });
      const width = img.naturalWidth || aspectRatio?.w || 1024;
      const height = img.naturalHeight || aspectRatio?.h || 1024;
      
      const images = await inpaintImage({
        sourceImage,
        maskImage,
        prompt,
        negativePrompt,
        isAdultMode,
        baseModel,
        loras: (loras || []),
        embeddings: (embeddings || []),
        steps: steps || 20,
        guidanceScale: cfg || 6.5,
        sampler: sampler || 'Euler a',
        width,
        height
      });
      
      setResultImage(images[0]);
      addGeneratedAssets(images);
      incrementGeneratedCount(images.length);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-3 md:gap-5 p-3 md:p-5 overflow-y-auto md:overflow-hidden md:max-h-[calc(100vh-48px)] pb-24 md:pb-5">
      {/* Left Panel: Controls & Canvas */}
      <div className="flex flex-col gap-3 md:gap-4 w-full md:flex-[3] md:min-w-0 md:overflow-y-auto md:pr-2">
        
        {/* Header */}
        <div className="card p-4">
          <h2 className="text-[16px] font-semibold flex items-center gap-2 mb-1 text-[var(--text-primary)]">
            <Brush className="w-4 h-4 text-purple-400" />
            {t('sidebar.inpaint', 'Inpaint Studio')}
          </h2>
          <p className="text-[12px] text-[var(--text-tertiary)]">
            {t('inpaint.subtitle', 'Upload an image, draw a mask over the area you want to replace, and describe what should go there.')}
          </p>
        </div>

        {/* Upload or Canvas */}
        <div className="flex-1 min-h-0 flex flex-col min-h-[300px] md:min-h-[400px]">
          {!sourceImage ? (
            <ImageUploadZone 
              label={t('inpaint.sourceLabel', 'Source Image for Inpainting')} 
              value={sourceImage} 
              onChange={setSourceImage} 
            />
          ) : (
            <div className="flex-1 min-h-0 bg-[var(--surface-1)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden flex flex-col">
              <div className="p-2 border-b border-[var(--border-subtle)] shrink-0 flex justify-between items-center bg-[var(--surface-2)]">
                <span className="text-xs font-medium text-[var(--text-secondary)] px-2">{t('inpaint.drawMask', 'Draw your mask')}</span>
                <button 
                  onClick={() => { setSourceImage(null); setMaskImage(null); setResultImage(null); }}
                  className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-500/10 transition-colors"
                >
                  {t('common.clearImage', 'Clear Image')}
                </button>
              </div>
              <div className="flex-1 min-h-0 relative p-4 flex items-center justify-center">
                <InpaintCanvas 
                  sourceImage={sourceImage}
                  onChangeSource={setSourceImage}
                  onMaskChange={setMaskImage}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Prompt & Output */}
      <div className="flex flex-col gap-3 md:gap-4 w-full md:flex-[2] md:min-w-0 md:overflow-y-auto">
        <PromptEditor
          prompt={prompt}
          setPrompt={setPrompt}
          negativePrompt={negativePrompt}
          setNegativePrompt={setNegativePrompt}
          mode={mode}
        />

        {error && (
          <div className="flex items-start gap-2 rounded-lg p-3 text-[12px]"
            style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)', color: 'var(--error)' }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="btn btn-primary btn-primary-glow w-full py-3 text-[14px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('inpaint.inpainting', 'Inpainting...')}
            </>
          ) : (
            <>
              <Brush className="w-4 h-4" />
              {t('inpaint.inpaintRegion', 'Inpaint Region')}
            </>
          )}
        </button>

        <div className="flex-1 bg-[var(--surface-1)] rounded-2xl border border-[var(--border-subtle)] flex flex-col overflow-hidden relative min-h-[250px] md:min-h-[300px]">
          {isGenerating ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--surface-1)] z-10">
              <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin mb-4" />
              <p className="text-sm text-[var(--text-secondary)] font-medium">{t('inpaint.inpaintingRegion', 'Inpainting Region...')}</p>
            </div>
          ) : resultImage ? (
            <div className="relative w-full h-full flex items-center justify-center p-4 bg-black/20">
              <img 
                src={resultImage.url} 
                alt="Inpaint Result" 
                className="max-w-full max-h-full object-contain rounded-lg shadow-xl"
              />
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
              <Brush className="w-12 h-12 text-[var(--text-tertiary)] opacity-30 mb-4" />
              <p className="text-[var(--text-secondary)] font-medium text-sm">{t('generate.waiting', 'Waiting for generation...')}</p>
              <p className="text-[var(--text-tertiary)] text-xs mt-1 max-w-[200px]">
                {t('inpaint.waitingSubtitle', 'Draw a mask and enter a prompt to see your result here.')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
