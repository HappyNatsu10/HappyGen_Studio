import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, Loader2, AlertCircle, Settings, X } from 'lucide-react';
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
import useGenerateStore from '../../store/useGenerateStore';

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
    removeEmbedding, clearEmbeddings,
    modelProfiles, saveModelProfile
  } = useModelStore();
  const { addGeneratedAssets, setCanvasTargetImage } = useWorkspaceStore();
  const onSendToCanvas = (url) => {
    setCanvasTargetImage(url);
    useAppStore.getState().setActiveTab('canvas');
  };
  const [sourceImage, setSourceImage] = useState(null);
  const [maskImage, setMaskImage] = useState(null);

  const {
    generationMode, setGenerationMode,
    prompt, setPrompt,
    loraPrompt, setLoraPrompt,
    negativePrompt, setNegativePrompt,
    aspectRatio, setAspectRatio,
    qualityPreset, setQualityPreset,
    steps, setSteps,
    cfg, setCfg,
    seed, setSeed,
    batchCount, setBatchCount,
    sampler, setSampler,
    denoisingStrength, setDenoisingStrength,
    upscaleScale, setUpscaleScale,
    upscaleModel, setUpscaleModel
  } = useGenerateStore();

  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

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

  // Auto-apply custom saved model profiles or general fallbacks
  useEffect(() => {
    if (!baseModel) return;
    
    // 1. Check if user saved a custom profile for this exact model
    if (modelProfiles && modelProfiles[baseModel.id]) {
      const profile = modelProfiles[baseModel.id];
      if (profile.steps) setSteps(profile.steps);
      if (profile.cfg) setCfg(profile.cfg);
      if (profile.sampler) setSampler(profile.sampler);
      return; // Stop here, use their custom settings
    }

    // 2. Fallback to generalized settings based on architecture
    const arch = baseModel.version?.baseModel || baseModel.baseModel || "";
    const name = (baseModel.name || "").toLowerCase();

    if (name.includes('lightning')) {
      setSteps(6);
      setCfg(1.5);
      setSampler('DPM++ SDE Karras');
    } else if (name.includes('turbo') || name.includes('lcm')) {
      setSteps(6);
      setCfg(2.0);
      setSampler('Euler a');
    } else if (arch.includes('Flux')) {
      setSteps(25);
      setCfg(3.5);
      setSampler('Euler'); 
    } else if (arch.includes('SDXL') || arch.includes('Pony')) {
      setSteps(30);
      setCfg(6.5);
      setSampler('DPM++ 2M Karras');
    } else {
      setSteps(25);
      setCfg(7.0);
      setSampler('Euler a');
    }
  }, [baseModel?.id]); // Only trigger when model changes

  // Listen to custom events to change generation mode from external components (like modals)
  useEffect(() => {
    const handleSetMode = (e) => {
      setGenerationMode(e.detail);
    };
    window.addEventListener('set-generation-mode', handleSetMode);
    return () => window.removeEventListener('set-generation-mode', handleSetMode);
  }, []);

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

      if (!isAdultMode && ['create', 'draft', 'hires', 'img2img', 'variations', 'inpaint'].includes(generationMode)) {
        const explicitWords = ['nsfw', 'nude', 'naked', 'nipple', 'porn', 'sex', 'genital', 'uncensored', 'pussy', 'penis', 'breast', 'boob', 'milf', 'topless'];
        const promptLower = fullPrompt.toLowerCase();
        const foundWord = explicitWords.find(word => promptLower.includes(word));
        if (foundWord) {
          setError(`Adult mode is disabled. Please remove explicit terms like "${foundWord}" or enable the +18 switch.`);
          setIsGenerating(false);
          return;
        }
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
        sampler: sampler,
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

  const handleCreateVariant = (image) => {
    setGenerationMode('variations');
    setSourceImage(image.url);
    if (image.prompt) {
      setPrompt(image.prompt);
    }
  };

  const handleDirectUpscale = async (imageUrl) => {
    setIsGenerating(true);
    setError(null);
    try {
      const images = await upscaleImage({ sourceImage: imageUrl, scale: upscaleScale, upscalerName: upscaleModel });
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

        {/* Batch Count */}
        {!['upscale', 'facefix', 'interrogate'].includes(generationMode) && (
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[12px] font-semibold text-slate-300 flex items-center gap-1.5">
                Batch Count
              </label>
              <span className="text-[12px] font-mono bg-white/5 px-2 py-0.5 rounded text-purple-300">{batchCount}</span>
            </div>
            <input
              type="range"
              min="1"
              max="4"
              step="1"
              value={batchCount}
              onChange={e => setBatchCount(Number(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 transition-all"
            />
          </motion.div>
        )}

        {/* Settings Button */}
        {!['upscale', 'facefix', 'interrogate'].includes(generationMode) && (
          <motion.div variants={itemVariants}>
            <button
              onClick={() => setShowSettingsModal(true)}
              className="w-full flex items-center justify-center gap-2 bg-[var(--surface-0)] border border-[var(--border-subtle)] hover:border-[var(--accent)] text-white py-3 px-4 rounded-xl transition-all font-medium text-[13px]"
            >
              <Settings className="w-4 h-4 text-purple-400" />
              Advanced Settings
            </button>
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

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="card max-w-sm w-full bg-[var(--surface-1)] border border-[var(--border-subtle)] shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up">
            <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--surface-2)]">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-purple-400" />
                Advanced Settings
              </h3>
              <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto">
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
                sampler={sampler}
                setSampler={setSampler}
                baseModel={baseModel}
                hasCustomProfile={baseModel ? !!modelProfiles[baseModel.id] : false}
                onSaveProfile={() => saveModelProfile(baseModel.id, { steps, cfg, sampler })}
              />
            </div>
            <div className="px-5 py-4 border-t border-[var(--border-subtle)] bg-[var(--surface-2)]">
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="btn btn-primary w-full py-2.5 rounded-xl font-semibold text-sm"
              >
                Apply & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
