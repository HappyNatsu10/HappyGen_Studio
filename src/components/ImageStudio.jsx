import React, { useState, useEffect } from 'react';
import { ART_STYLES, AI_MODELS, ASPECT_RATIOS, PROMPT_SUGGESTIONS, LOCAL_MODELS_FOLDER_LORAS, LOCAL_BASE_MODELS } from '../data/stylesData';
import { Sparkles, Wand2, Sliders, Image as ImageIcon, Download, Maximize2, ShieldAlert, Zap, Layers, RefreshCw, Upload, Check, Info, Lightbulb, Search, Cpu, Key, SlidersHorizontal, Settings2, HardDrive, Plus, Trash2, Sliders as SliderIcon, AlertTriangle } from 'lucide-react';
import { checkPromptSafety, classifyOutputAsset, createSafetyAuditLog } from '../services/safetyService';
import { generateImageAI, upscaleImageAI } from '../services/aiService';
import ImageToPromptModal from './ImageToPromptModal';

export default function ImageStudio({
  isAdultMode,
  onImageGenerated,
  onAddSafetyLog,
  onSendToCanvas
}) {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('score_4, score_5, score_6, source_pony, source_furry, 3d, realistic, negative_hands, bad hands, malformed hands, extra fingers, missing fingers, fused fingers, mutated hands, extra limbs, missing limbs, deformed limbs, bad anatomy, bad eyes, blurry, low quality, worst quality, mutated, text, watermark');
  const [selectedStyle, setSelectedStyle] = useState('illustrious-anime');
  const [selectedModel, setSelectedModel] = useState('illustrious-xl');
  const [selectedBaseModel, setSelectedBaseModel] = useState('crucibleRINGPonyxl_v28.safetensors');
  const [activeLoras, setActiveLoras] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [inferenceSteps, setInferenceSteps] = useState(20);
  const [guidanceScale, setGuidanceScale] = useState(6.5);
  const [styleStrength, setStyleStrength] = useState(90);
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[0]);
  const [batchCount, setBatchCount] = useState(1);
  const [seed, setSeed] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPromptAssistant, setShowPromptAssistant] = useState(false);
  const [showImageToPrompt, setShowImageToPrompt] = useState(false);
  const [showCustomModelDrawer, setShowCustomModelDrawer] = useState(false);
  const [selectedLoraToAdd, setSelectedLoraToAdd] = useState('');
  
  // Custom API Key & Model URL state (persisted in localStorage)
  const [customModelUrl, setCustomModelUrl] = useState(() => localStorage.getItem('omnigen_custom_model') || '');
  const [customApiKey, setCustomApiKey] = useState(() => localStorage.getItem('omnigen_api_key') || '');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResults, setGenerationResults] = useState([]);
  const [activeImage, setActiveImage] = useState(null);
  const [safetyError, setSafetyError] = useState(null);
  const [genError, setGenError] = useState(null);

  // Final prompt override state (user editable preview)
  const [finalPromptOverride, setFinalPromptOverride] = useState('');
  const [isEditingFinalPrompt, setIsEditingFinalPrompt] = useState(false);

  // Compute default final prompt whenever prompt or selectedStyle changes
  const activeStyleObj = ART_STYLES.find(s => s.id === selectedStyle) || ART_STYLES[0];
  const computedFinalPrompt = `${prompt}${activeStyleObj.promptSuffix || ''}`;

  // Keep finalPromptOverride synced when not actively manually modified
  useEffect(() => {
    if (!isEditingFinalPrompt) {
      setFinalPromptOverride(computedFinalPrompt);
    }
  }, [prompt, selectedStyle, isEditingFinalPrompt]);

  // Save custom model settings
  useEffect(() => {
    localStorage.setItem('omnigen_custom_model', customModelUrl);
    localStorage.setItem('omnigen_api_key', customApiKey);
  }, [customModelUrl, customApiKey]);

  const categories = ['All', 'Illustrious & Pony', 'Pixiv & Anime', 'DeviantArt & Fantasy', 'Realism', 'Sci-Fi', 'Digital', 'Classic', 'Retro'];

  const filteredStyles = selectedCategory === 'All' 
    ? ART_STYLES 
    : ART_STYLES.filter(s => s.category === selectedCategory || s.id === 'none');

  // Handle Magic Prompt Enhancement
  const handleEnhancePrompt = () => {
    if (!prompt.trim()) return;
    const enhancements = [
      ', highly detailed anime illustration, Makoto Shinkai lighting, flawless lineart, 8k resolution',
      ', epic digital matte painting, atmospheric perspective, cinematic lighting, ArtStation concept art',
      ', Riot Games splash art style, dynamic action pose, elemental spell effects, cinematic game character illustration, high detail'
    ];
    const randomEnhance = enhancements[Math.floor(Math.random() * enhancements.length)];
    setPrompt(prev => prev.trim() + randomEnhance);
  };

  // Append prompt suggestion tag
  const handleAppendSuggestion = (tagText) => {
    if (prompt.trim().length === 0) {
      setPrompt(tagText);
    } else {
      setPrompt(prev => prev.trim() + ', ' + tagText);
    }
  };

  // LoRA Stack Helpers
  const handleAddLora = (loraId) => {
    if (!loraId) return;
    const loraObj = LOCAL_MODELS_FOLDER_LORAS.find(m => m.id === loraId);
    if (!loraObj) return;

    if (activeLoras.some(l => l.id === loraId)) {
      return; // Already added
    }

    const newLoraItem = {
      ...loraObj,
      weight: 0.85
    };

    setActiveLoras(prev => [...prev, newLoraItem]);
    setSelectedLoraToAdd('');

    // Automatically append trigger keywords if present
    if (loraObj.trigger) {
      setPrompt(prev => {
        const trimmed = prev ? prev.trim() : '';
        if (!trimmed) return loraObj.trigger;
        if (trimmed.includes(loraObj.trigger)) return trimmed;
        return `${trimmed}, ${loraObj.trigger}`;
      });
    }
  };

  const handleRemoveLora = (loraId) => {
    setActiveLoras(prev => prev.filter(l => l.id !== loraId));
  };

  const handleUpdateLoraWeight = (loraId, newWeight) => {
    setActiveLoras(prev => prev.map(l => 
      l.id === loraId ? { ...l, weight: parseFloat(newWeight) } : l
    ));
  };

  // Handle Image Generation Execution
  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setSafetyError(null);
    setGenError(null);

    // 1. Input Screening
    const safetyCheck = checkPromptSafety(prompt, isAdultMode);
    onAddSafetyLog(createSafetyAuditLog('INPUT_SCAN', {
      prompt,
      safe: safetyCheck.safe,
      severity: safetyCheck.severity,
      category: safetyCheck.category,
      reason: safetyCheck.reason
    }));

    if (!safetyCheck.safe) {
      setSafetyError(safetyCheck);
      return;
    }

    setIsGenerating(true);

    try {
      const finalSeed = seed ? parseInt(seed) : Math.floor(Math.random() * 999999);
      
      const newImages = await generateImageAI({
        prompt,
        styleId: selectedStyle,
        modelId: selectedModel,
        baseModel: selectedBaseModel,
        loras: activeLoras,
        steps: inferenceSteps,
        guidanceScale: guidanceScale,
        negativePrompt: negativePrompt,
        width: aspectRatio.width,
        height: aspectRatio.height,
        seed: finalSeed,
        batchCount,
        isAdultMode,
        customApiKey,
        customModelUrl,
        finalPromptOverride: finalPromptOverride || computedFinalPrompt
      });

      // Output Classifier
      const verifiedImages = newImages.map(img => {
        const outputAudit = classifyOutputAsset(img.url, prompt, isAdultMode);
        return {
          ...img,
          c2paManifest: outputAudit.c2paManifest
        };
      });

      setGenerationResults(prev => [...verifiedImages, ...prev]);
      onImageGenerated(verifiedImages);
    } catch (err) {
      console.error(err);
      setGenError(err.message || "Generation error. Please ensure the local GPU server is active on port 8000.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Upscale
  const handleUpscale = async (imgObj) => {
    const upscaled = await upscaleImageAI(imgObj.url, 2);
    setGenerationResults(prev => prev.map(item => 
      item.id === imgObj.id ? { ...item, upscaled: true, resolution: upscaled.newResolution } : item
    ));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Top Banner / Headline */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-indigo-950/80 border border-indigo-500/30 text-indigo-300">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>High-Resolution FLUX.1 & Custom AI Model Generation Pipeline</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
          Transform Your Prompts into <span className={isAdultMode ? 'text-rose-400' : 'text-indigo-400'}>Masterpiece Artwork</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto">
          Built-in high performance FLUX/SDXL models out-of-the-box + optional custom HuggingFace/Civitai model links.
        </p>
      </div>

      {/* Main Prompt Creation Card */}
      <div className={`border-gradient-container ${isAdultMode ? 'border-gradient-adult' : ''} shadow-2xl`}>
        <div className="border-gradient-content p-5 space-y-4">
          
          {/* Prompt Input Box */}
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={isAdultMode ? "Describe your adult 18+ fantasy artwork (verified adult mode active)..." : "Describe the artwork you want to create in rich detail..."}
              rows={3}
              className="w-full bg-slate-950/90 text-white rounded-xl p-4 pr-36 text-sm sm:text-base border border-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none resize-none transition-all placeholder:text-slate-500 font-sans"
            />
            
            {/* Quick Actions in Textarea */}
            <div className="absolute right-3 bottom-3 flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setShowImageToPrompt(true)}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-purple-950/90 text-purple-300 border border-purple-500/40 hover:bg-purple-900 transition-all hover:scale-105"
                title="Image-to-Prompt Vision Interrogator"
              >
                <Search className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">Image→Prompt</span>
              </button>

              <button
                type="button"
                onClick={handleEnhancePrompt}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-950/90 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-900 transition-all hover:scale-105"
                title="AI Magic Prompt Enhancer"
              >
                <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Enhance</span>
              </button>
            </div>
          </div>

          {/* Local GPU Engine & Multi-LoRA Stack Manager */}
          <div className="p-4 rounded-xl bg-slate-950/90 border border-indigo-500/30 space-y-4 shadow-xl">
            {/* Header: Base Engine Selection & Status */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <HardDrive className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-bold text-white">Local Base Engine:</span>
              </div>
              <div className="flex items-center space-x-2">
                {LOCAL_BASE_MODELS.map(bm => (
                  <button
                    key={bm.id}
                    type="button"
                    onClick={() => {
                      setSelectedBaseModel(bm.id);
                      setInferenceSteps(bm.recommendedSteps);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                      selectedBaseModel === bm.id
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 ring-2 ring-indigo-400'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-white/5'
                    }`}
                  >
                    <span>{bm.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-indigo-200">{bm.type}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Multi-LoRA Stack Section */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    LoRA Stack (Multi-LoRA Mixer):
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-950 text-purple-300 border border-purple-500/30">
                    {activeLoras.length} Active
                  </span>
                </div>

                {/* Quick Add LoRA Controls */}
                <div className="flex items-center space-x-2 flex-grow sm:flex-grow-0">
                  <select
                    value={selectedLoraToAdd}
                    onChange={(e) => setSelectedLoraToAdd(e.target.value)}
                    className="bg-slate-900 text-slate-200 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-mono outline-none focus:border-purple-500 max-w-[220px] sm:max-w-[300px] truncate"
                  >
                    <option value="">-- Select LoRA to Add --</option>
                    {LOCAL_MODELS_FOLDER_LORAS.map(lora => (
                      <option 
                        key={lora.id} 
                        value={lora.id}
                        disabled={activeLoras.some(l => l.id === lora.id)}
                      >
                        [{lora.category}] {lora.name} {activeLoras.some(l => l.id === lora.id) ? '(Added)' : ''}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={!selectedLoraToAdd}
                    onClick={() => handleAddLora(selectedLoraToAdd)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all ${
                      selectedLoraToAdd 
                        ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md cursor-pointer' 
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add LoRA</span>
                  </button>
                </div>
              </div>

              {/* Active Stack Cards */}
              {activeLoras.length === 0 ? (
                <div className="p-3.5 rounded-lg bg-slate-900/50 border border-dashed border-white/10 text-center text-xs text-slate-400">
                  <span>No LoRAs currently stacked. Pick and blend multiple character, outfit, and style LoRAs simultaneously!</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {activeLoras.map(lora => (
                    <div 
                      key={lora.id} 
                      className="p-3 rounded-lg bg-slate-900/90 border border-purple-500/30 flex flex-col justify-between space-y-2 shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                            <span className="truncate">{lora.name}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-500/40">
                              {lora.category}
                            </span>
                          </div>
                          {lora.trigger && (
                            <p className="text-[10px] text-slate-400 font-mono truncate max-w-[280px]">
                              Triggers: {lora.trigger}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveLora(lora.id)}
                          className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                          title="Remove this LoRA"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* LoRA Weight Slider */}
                      <div className="flex items-center space-x-3 pt-1 border-t border-white/5">
                        <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">
                          Weight: <span className="text-purple-300 font-mono font-bold">{lora.weight.toFixed(2)}x</span>
                        </span>
                        <input
                          type="range"
                          min="0.1"
                          max="1.5"
                          step="0.05"
                          value={lora.weight}
                          onChange={(e) => handleUpdateLoraWeight(lora.id, e.target.value)}
                          className="w-full accent-purple-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Fine-Tuning Controls: Steps, CFG & Negative Prompt */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/10">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between mb-1">
                  <span className="flex items-center gap-1">Inference Steps: {inferenceSteps >= 20 ? <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1 py-0.5 rounded font-mono">✨ Ultra Detail</span> : (inferenceSteps <= 8 && <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1 py-0.5 rounded font-mono">⚡ ~25s</span>)}</span>
                  <span className="font-mono text-indigo-300">{inferenceSteps} steps</span>
                </label>
                <input
                  type="range"
                  min="4"
                  max="35"
                  step="1"
                  value={inferenceSteps}
                  onChange={(e) => setInferenceSteps(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between mb-1">
                  <span>Guidance Scale (CFG):</span>
                  <span className="font-mono text-indigo-300">{guidanceScale}</span>
                </label>
                <input
                  type="range"
                  min="3.0"
                  max="12.0"
                  step="0.5"
                  value={guidanceScale}
                  onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Negative Prompt:
                </label>
                <input
                  type="text"
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder="score_4, deformed, bad anatomy..."
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-slate-300 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Safety Error Notification */}
          {safetyError && (
            <div className="p-4 rounded-xl bg-rose-950/90 border border-rose-600/60 text-rose-200 flex items-start space-x-3 animate-pulse">
              <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <div className="font-bold text-rose-300 flex items-center space-x-2">
                  <span>{safetyError.category}</span>
                  <span className="px-1.5 py-0.5 bg-rose-900 text-rose-100 rounded text-[10px] uppercase font-mono">{safetyError.code}</span>
                </div>
                <p>{safetyError.reason}</p>
              </div>
            </div>
          )}

          {/* Controls Bar: Aspect Ratio, Batch, Suggestions */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/5">
            
            {/* Aspect Ratio Selector */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 max-w-full">
              <span className="text-xs font-semibold text-slate-400 mr-1">Aspect Ratio:</span>
              {ASPECT_RATIOS.map((ar) => (
                <button
                  key={ar.id}
                  onClick={() => setAspectRatio(ar)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    aspectRatio.id === ar.id
                      ? (isAdultMode ? 'bg-rose-600 text-white shadow' : 'bg-indigo-600 text-white shadow')
                      : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {ar.name}
                </button>
              ))}
            </div>

            {/* Prompt Assistant & Batch */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowPromptAssistant(!showPromptAssistant)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 border transition-all ${
                  showPromptAssistant 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-lg' 
                    : 'bg-slate-900/80 text-slate-400 border-white/10 hover:text-amber-300'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>Prompt Ideas & Suggestions</span>
              </button>

              <div className="flex items-center space-x-1 bg-slate-900/80 px-2 py-1 rounded-lg border border-white/10">
                <span className="text-xs text-slate-400 mr-1">Batch:</span>
                {[1, 2, 4].map(num => (
                  <button
                    key={num}
                    onClick={() => setBatchCount(num)}
                    className={`px-2 py-0.5 rounded text-xs font-bold transition-all ${
                      batchCount === num 
                        ? (isAdultMode ? 'bg-rose-600 text-white' : 'bg-indigo-600 text-white') 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {num}x
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`p-2 rounded-lg text-xs font-semibold flex items-center space-x-1 border transition-all ${
                  showAdvanced 
                    ? 'bg-slate-800 text-white border-white/20' 
                    : 'bg-slate-900/80 text-slate-400 border-white/10 hover:text-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Advanced</span>
              </button>
            </div>

          </div>

          {/* Prompt Assistant Suggestions Drawer */}
          {showPromptAssistant && (
            <div className="p-4 rounded-xl bg-slate-950/90 border border-amber-500/30 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center space-x-1">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>Prompt Ideas (Click tag to append to prompt)</span>
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PROMPT_SUGGESTIONS.map((section, idx) => (
                  <div key={idx} className="space-y-1.5 p-2.5 rounded-lg bg-slate-900/80 border border-white/5">
                    <div className="text-[11px] font-bold text-slate-300">{section.category}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {section.tags.map((tag, tagIdx) => (
                        <button
                          key={tagIdx}
                          onClick={() => handleAppendSuggestion(tag)}
                          className="px-2 py-1 bg-slate-800 hover:bg-amber-500/20 hover:text-amber-200 text-slate-300 rounded text-[10px] font-medium transition-all text-left truncate max-w-full"
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Advanced Drawer */}
          {showAdvanced && (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-4 text-xs animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Negative Prompt</label>
                  <input
                    type="text"
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-slate-200 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Seed (Leave blank for random)</label>
                  <input
                    type="number"
                    value={seed}
                    onChange={(e) => setSeed(e.target.value)}
                    placeholder="e.g. 849204"
                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-slate-200 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 font-semibold mb-1">
                  <span>Style Strength / Preset Influence</span>
                  <span className="text-indigo-400">{styleStrength}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={styleStrength}
                  onChange={(e) => setStyleStrength(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Final Synthesized Prompt Preview & Editor */}
          {prompt.trim().length > 0 && (
            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-indigo-500/30 space-y-2 text-xs animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-300 flex items-center space-x-1.5">
                  <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Final Synthesized Prompt (Sent to Neural Model):</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingFinalPrompt(!isEditingFinalPrompt)}
                  className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 underline"
                >
                  {isEditingFinalPrompt ? 'Done Editing' : '✏️ Edit Final Prompt'}
                </button>
              </div>

              {isEditingFinalPrompt ? (
                <textarea
                  value={finalPromptOverride}
                  onChange={(e) => setFinalPromptOverride(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-900 text-slate-200 border border-indigo-500/50 rounded-lg p-2.5 outline-none font-mono text-xs focus:ring-1 focus:ring-indigo-500"
                />
              ) : (
                <p className="p-2.5 bg-slate-900/90 rounded-lg text-slate-300 font-mono border border-white/5 break-words select-all">
                  {finalPromptOverride || computedFinalPrompt}
                </p>
              )}
            </div>
          )}

          {/* Error Banner */}
          {genError && (
            <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-red-200 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{genError}</span>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className={`w-full py-3.5 rounded-xl font-display font-extrabold text-base tracking-wide flex items-center justify-center space-x-2 shadow-xl transition-all ${
              isGenerating || !prompt.trim()
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : (isAdultMode 
                    ? 'btn-shimmer-adult text-white shadow-rose-600/30 hover:scale-[1.01] active:scale-[0.99]' 
                    : 'btn-shimmer text-white shadow-indigo-600/30 hover:scale-[1.01] active:scale-[0.99]')
            }`}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-white" />
                <span>Synthesizing High-Resolution Neural Artwork...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 fill-current" />
                <span>Generate Masterpiece ({batchCount > 1 ? `${batchCount} Variations` : '1x Output'})</span>
              </>
            )}
          </button>

        </div>
      </div>

      {/* Visual Art Style Presets Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-slate-200">Visual Art Style Presets</h2>
            <span className="text-xs text-slate-400">({ART_STYLES.length} Curated Styles)</span>
          </div>

          <div className="flex items-center space-x-1 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-white/15 text-white border border-white/20 shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filteredStyles.map((style) => {
            const isSelected = selectedStyle === style.id;
            return (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`group rounded-2xl text-left border transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? (isAdultMode 
                        ? 'bg-rose-950/90 border-rose-500 text-white ring-2 ring-rose-500/50 shadow-xl shadow-rose-950/60 scale-[1.02]' 
                        : 'bg-indigo-950/90 border-indigo-500 text-white ring-2 ring-indigo-500/50 shadow-xl shadow-indigo-950/60 scale-[1.02]')
                    : 'bg-slate-900/80 border-white/10 text-slate-300 hover:bg-slate-800/90 hover:border-white/25 hover:scale-[1.01]'
                }`}
              >
                <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                  <img
                    src={style.image}
                    alt={style.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  
                  <div className="absolute top-1.5 left-1.5">
                    <span className="text-base">{style.icon}</span>
                  </div>

                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 p-1 bg-emerald-500 rounded-full text-white shadow-md">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>

                <div className="p-2.5 space-y-0.5">
                  <div className="font-bold text-xs flex items-center justify-between">
                    <span className="truncate">{style.name}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 line-clamp-1">{style.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Output Section */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span>Generated Masterpieces</span>
            <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full font-mono">
              {generationResults.length} Assets
            </span>
          </h2>
        </div>

        {generationResults.length === 0 ? (
          <div className="border-2 border-dashed border-white/10 rounded-2xl p-12 text-center space-y-3 bg-slate-950/40">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-slate-500 flex items-center justify-center mx-auto">
              <ImageIcon className="w-6 h-6" />
            </div>
            <p className="text-slate-400 text-sm font-medium">No generated images yet. Type a prompt above to start creating.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {generationResults.map((img) => (
              <div 
                key={img.id}
                className="glass-panel rounded-2xl overflow-hidden group hover:border-white/20 transition-all duration-300 flex flex-col"
              >
                <div className="relative aspect-square overflow-hidden bg-slate-950">
                  <img
                    src={img.url}
                    alt={img.prompt}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/styles/custom_anime_illustrious.jpg';
                    }}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />

                  <div className="absolute top-3 left-3 flex flex-col space-y-1">
                    <span className="px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur text-[10px] font-bold text-slate-200 border border-white/10">
                      {img.style}
                    </span>
                    {img.upscaled && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                        Super-HD 4K
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-950/80 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono font-bold flex items-center space-x-1">
                      <span>C2PA Signed</span>
                    </span>
                  </div>

                  <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
                    <button
                      onClick={() => setActiveImage(img)}
                      className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur transition-all hover:scale-110"
                      title="Inspect Lightbox"
                    >
                      <Maximize2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleUpscale(img)}
                      className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white backdrop-blur transition-all hover:scale-110"
                      title="Upscale 2x HD"
                    >
                      <Zap className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onSendToCanvas(img.url)}
                      className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white backdrop-blur transition-all hover:scale-110"
                      title="Edit in Canvas / Inpaint"
                    >
                      <Layers className="w-5 h-5" />
                    </button>
                    <a
                      href={img.url}
                      download={`omnigen-${img.id}.png`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white backdrop-blur transition-all hover:scale-110"
                      title="Download PNG"
                    >
                      <Download className="w-5 h-5" />
                    </a>
                  </div>
                </div>

                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-slate-300 line-clamp-2 italic font-sans">"{img.prompt}"</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/5">
                    <span>Engine: {img.modelUsed}</span>
                    <span>{img.width}x{img.height}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {activeImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-4xl w-full bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl space-y-4 p-6">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <h3 className="font-bold text-lg text-white">Asset Preview & C2PA Credentials</h3>
              <button 
                onClick={() => setActiveImage(null)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-300"
              >
                Close
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl overflow-hidden bg-black flex items-center justify-center">
                <img src={activeImage.url} alt="Lightbox" className="max-h-[450px] w-auto object-contain" />
              </div>
              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Prompt</label>
                  <p className="p-3 bg-slate-950 rounded-lg text-slate-200">{activeImage.fullPrompt}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-slate-950 rounded-lg">
                    <span className="text-slate-400 block">Style</span>
                    <span className="font-bold text-white">{activeImage.style}</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-lg">
                    <span className="text-slate-400 block">Resolution</span>
                    <span className="font-bold text-white">{activeImage.width}x{activeImage.height}</span>
                  </div>
                </div>
                
                <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-500/30 space-y-2">
                  <div className="font-bold text-indigo-300 flex items-center space-x-1">
                    <Info className="w-4 h-4 text-indigo-400" />
                    <span>C2PA Content Credentials Manifest</span>
                  </div>
                  <pre className="text-[10px] font-mono text-slate-300 bg-slate-950 p-2 rounded overflow-x-auto">
                    {JSON.stringify(activeImage.c2paManifest, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image to Prompt Interrogator Modal */}
      <ImageToPromptModal
        isOpen={showImageToPrompt}
        onClose={() => setShowImageToPrompt(false)}
        onUsePrompt={(extractedPrompt) => setPrompt(extractedPrompt)}
      />

    </div>
  );
}
