import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import PromptEditor from './PromptEditor';
import ModelSelector from './ModelSelector';
import GenerationSettings, { ASPECT_RATIOS } from './GenerationSettings';
import OutputGallery from './OutputGallery';
import GenerationModeSelector from './GenerationModeSelector';
import ImageUploadZone from './ImageUploadZone';
import InpaintCanvas from './InpaintCanvas';
import { generateImageAI, generateImg2Img, upscaleImage, faceFixImage, inpaintImage, interrogateImage } from '../../services/aiService';
import EngineSelector from '../common/EngineSelector';
import { IMAGE_ENGINES, isEngineClosed } from '../../config/engines';
import useAppStore from '../../store/useAppStore';
import useModelStore from '../../store/useModelStore';
import useWorkspaceStore from '../../store/useWorkspaceStore';

const DEFAULT_NEGATIVE = 'bad quality, low quality, blurry, bad anatomy, bad hands, extra fingers, missing fingers, deformed, watermark, text, worst quality';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 }
};

export default function GeneratePage() {
  const { isAdultMode, openModelModal } = useAppStore();
  const { 
    imageEngine, setImageEngine, 
    baseModel, loras, embeddings,
    removeLora, updateLoraWeight, clearLoras,
    removeEmbedding, clearEmbeddings
  } = useModelStore();
  const { addGeneratedAssets, setCanvasTargetImage } = useWorkspaceStore();
  const onSendToCanvas = (url) => {
    setCanvasTargetImage(url);
    useAppStore.getState().setActiveTab('canvas');
  };
  const [generationMode, setGenerationMode] = useState('create');
  const [sourceImage, setSourceImage] = useState(null);
  const [maskImage, setMaskImage] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [loraPrompt, setLoraPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState(DEFAULT_NEGATIVE);
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[0]);
  const [qualityPreset, setQualityPreset] = useState('quality');
  const [steps, setSteps] = useState(20);
  const [cfg, setCfg] = useState(6.5);
  const [seed, setSeed] = useState('-1');
  const [batchCount, setBatchCount] = useState(1);
  const [denoisingStrength, setDenoisingStrength] = useState(0.5);

  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const prevLorasRef = useRef(loras);

  useEffect(() => {
    const prevLoras = prevLorasRef.current;
    const addedLoras = loras.filter(l => !prevLoras.find(pl => pl.id === l.id));
    const removedLoras = prevLoras.filter(pl => !loras.find(l => l.id === pl.id));

    if (addedLoras.length > 0 || removedLoras.length > 0) {
      setLoraPrompt(currentPrompt => {
        let newPrompt = currentPrompt;
        
        removedLoras.forEach(lora => {
          if (lora.triggerWords && lora.triggerWords.length > 0) {
            lora.triggerWords.filter(Boolean).forEach(tw => {
              const escapedTw = tw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              const regex = new RegExp(`(^|\\s*,\\s*|\\s+)${escapedTw}(?=\\s*,|\\s+|$)`, 'gi');
              newPrompt = newPrompt.replace(regex, '');
            });
          }
        });

        // Clean up stray commas left over from removals
        newPrompt = newPrompt.replace(/^,[\s]*/, '').replace(/,[\s]*$/, '').replace(/,[\s]*,/g, ', ').trim();

        addedLoras.forEach(lora => {
          if (lora.triggerWords && lora.triggerWords.length > 0) {
            const triggers = lora.triggerWords.filter(Boolean).join(', ');
            if (triggers) {
              if (newPrompt.length > 0 && !newPrompt.endsWith(',')) {
                newPrompt += ', ';
              } else if (newPrompt.endsWith(',')) {
                newPrompt += ' ';
              }
              newPrompt += triggers;
            }
          }
        });

        return newPrompt.trim();
      });
    }
    prevLorasRef.current = loras;
  }, [loras]);

  const handleModeSelect = (newMode) => {
    setGenerationMode(newMode);
    if (newMode === 'draft') {
      setSteps(6);
      setCfg(4.5);
      setQualityPreset('fast');
    }
  };

  const handleGenerate = async () => {
    if ((generationMode !== 'upscale' && generationMode !== 'facefix' && generationMode !== 'interrogate') && !prompt.trim()) return;
    if (['variations', 'img2img', 'upscale', 'facefix', 'interrogate'].includes(generationMode) && !sourceImage) {
      setError('Please upload a source image for this mode.');
      return;
    }
    
    setIsGenerating(true);
    setError(null);

    // Handle interrogate separately — it returns a prompt string, not images
    if (generationMode === 'interrogate') {
      try {
        const caption = await interrogateImage({ sourceImage });
        setPrompt(caption);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsGenerating(false);
      }
      return;
    }

    try {
      let fullPrompt = prompt.trim();
      if (loraPrompt.trim()) {
        fullPrompt += (fullPrompt ? ', ' : '') + loraPrompt.trim();
      }

      const parsedSeed = seed === '-1' || !seed.trim()
        ? Math.floor(Math.random() * 2147483647)
        : parseInt(seed, 10);

      const params = {
        prompt: fullPrompt,
        negativePrompt,
        width: aspectRatio.w,
        height: aspectRatio.h,
        seed: parsedSeed,
        batchCount,
        steps,
        guidanceScale: cfg,
        isAdultMode,
        engine: imageEngine,
        baseModel: baseModel,
        loras: loras,
        embeddings: embeddings,
      };

      let images = [];
      
      if (['create', 'draft', 'hires'].includes(generationMode)) {
        images = await generateImageAI(params);
      } else if (['img2img', 'variations'].includes(generationMode)) {
        images = await generateImg2Img({ ...params, sourceImage, denoisingStrength: generationMode === 'variations' ? 0.7 : denoisingStrength });
      } else if (generationMode === 'upscale') {
        images = await upscaleImage({ sourceImage, scale: 2 });
      } else if (generationMode === 'facefix') {
        images = await faceFixImage({ sourceImage, prompt: fullPrompt });
      }

      setResults(images);
      addGeneratedAssets(images);
      
      const warnedImage = images.find(img => img.hasWarning);
      if (warnedImage) {
        setError("⚠️ Quality Warning: " + warnedImage.warningReason);
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateVariant = (imageUrl) => {
    setGenerationMode('variations');
    setSourceImage(imageUrl);
  };

  const handleDirectUpscale = async (imageUrl) => {
    setIsGenerating(true);
    setError(null);
    try {
      const images = await upscaleImage({ sourceImage: imageUrl, scale: 2 });
      setResults(images);
      addGeneratedAssets(images);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-5 p-5 overflow-y-auto md:overflow-hidden md:max-h-[calc(100vh-48px)] pb-24 md:pb-5 bg-[var(--surface-0)] relative">
      {/* Background Decorative Blur - Removed to fix GPU freeze on low-end hardware */}

      {/* Left Panel: Controls */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-6 w-full md:w-[400px] flex-shrink-0 md:overflow-y-auto z-10 glass-panel border border-[var(--border-subtle)] bg-[var(--surface-1)]/80 backdrop-blur-md rounded-[22px] p-6 shadow-xl relative scrollbar-hide"
      >
        
        {/* Mode Selector */}
        <motion.div variants={itemVariants}>
          <GenerationModeSelector currentMode={generationMode} onSelectMode={handleModeSelect} />
        </motion.div>

        {/* Upload Zone (conditionally shown) */}
        {['variations', 'img2img', 'upscale', 'facefix'].includes(generationMode) && (
          <motion.div variants={itemVariants}>
            <ImageUploadZone 
              label={generationMode === 'upscale' ? 'Image to Upscale' : (generationMode === 'facefix' ? 'Image to Fix' : 'Source Image')} 
              value={sourceImage} 
              onChange={setSourceImage} 
            />
          </motion.div>
        )}

        {/* Inpaint Canvas */}
        {generationMode === 'inpaint' && (
          <motion.div variants={itemVariants}>
            <InpaintCanvas
              sourceImage={sourceImage}
              onChangeSource={(img) => { setSourceImage(img); setMaskImage(null); }}
              onMaskChange={setMaskImage}
            />
          </motion.div>
        )}

        {/* Denoising Strength for Img2Img */}
        {generationMode === 'img2img' && (
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
                Denoising Strength
              </label>
              <span className="text-[11px] font-mono" style={{ color: 'var(--text-secondary)' }}>{denoisingStrength}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={denoisingStrength}
              onChange={e => setDenoisingStrength(parseFloat(e.target.value))}
            />
          </motion.div>
        )}

        {/* Engine Selection */}
        {!['upscale', 'facefix', 'interrogate'].includes(generationMode) && (
          <motion.div variants={itemVariants}>
            <EngineSelector 
              engines={IMAGE_ENGINES} 
              selectedEngineId={imageEngine} 
              onSelectEngine={setImageEngine} 
              label="Base Inference Engine"
            />
          </motion.div>
        )}

        {/* Model Selection (hidden for upscale/facefix and closed engines) */}
        {!['upscale', 'facefix', 'interrogate'].includes(generationMode) && !isEngineClosed(imageEngine) && (
          <motion.div variants={itemVariants}>
            <ModelSelector
              baseModel={baseModel}
              loras={loras}
              embeddings={embeddings}
              onOpenExplorerBase={() => openModelModal({ intent: 'base' })}
              onOpenExplorerLora={() => openModelModal({ intent: 'lora', arch: baseModel?.version?.baseModel })}
              onOpenExplorerEmbedding={() => openModelModal({ intent: 'embedding' })}
              onRemoveLora={removeLora}
              onUpdateLoraWeight={updateLoraWeight}
              onClearLoras={clearLoras}
              onRemoveEmbedding={removeEmbedding}
              onClearEmbeddings={clearEmbeddings}
            />
          </motion.div>
        )}

        {/* Prompt (hidden for upscale) */}
        {generationMode !== 'upscale' && generationMode !== 'interrogate' && (
          <motion.div variants={itemVariants}>
            <PromptEditor
              prompt={prompt}
              setPrompt={setPrompt}
              loraPrompt={loraPrompt}
              setLoraPrompt={setLoraPrompt}
              negativePrompt={negativePrompt}
              setNegativePrompt={setNegativePrompt}
            />
          </motion.div>
        )}

        {/* Settings */}
        {!['upscale', 'facefix', 'interrogate'].includes(generationMode) && (
          <motion.div variants={itemVariants}>
            <GenerationSettings
              aspectRatio={aspectRatio}
              setAspectRatio={setAspectRatio}
              qualityPreset={qualityPreset}
              setQualityPreset={setQualityPreset}
              steps={steps}
              setSteps={setSteps}
              cfg={cfg}
              setCfg={setCfg}
              seed={seed}
              setSeed={setSeed}
              batchCount={batchCount}
              setBatchCount={setBatchCount}
            />
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 rounded-lg p-3 text-[12px]"
            style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)', color: 'var(--error)' }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Generate Button */}
        <motion.div variants={itemVariants} className="sticky bottom-0 z-20 -mx-0 pt-3 pb-1 md:static md:pt-0 md:pb-0" style={{ background: 'linear-gradient(to top, var(--surface-1) 70%, transparent)' }}>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || (generationMode !== 'upscale' && generationMode !== 'facefix' && generationMode !== 'interrogate' && !prompt.trim())}
            className="btn btn-primary btn-primary-glow w-full py-4 rounded-xl text-[15px] font-bold tracking-wide disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-purple-500/20"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <ImageIcon className="w-5 h-5" />
              {generationMode === 'upscale' ? 'Upscale Image' : (generationMode === 'facefix' ? 'Fix Faces' : (generationMode === 'interrogate' ? 'Extract Prompt' : 'Generate'))}
            </>
          )}
          </button>
        </motion.div>
      </motion.div>

      {/* Right Panel: Output */}
      <div className="flex-1 min-h-[400px] z-10">
        <OutputGallery
          isGenerating={isGenerating}
          results={results}
          error={error}
          onCreateVariant={handleCreateVariant}
          onSendToCanvas={onSendToCanvas}
          onUpscale={handleDirectUpscale}
        />
      </div>
    </div>
  );
}
