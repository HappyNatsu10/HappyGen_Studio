import React, { useState } from 'react';
import { Video, Film, Camera, Play, Sparkles, Upload, ShieldCheck, Zap, Download, RefreshCw } from 'lucide-react';
import { generateVideoAI } from '../services/aiService';
import { checkPromptSafety, createSafetyAuditLog } from '../services/safetyService';
import EngineSelector from './common/EngineSelector';
import { VIDEO_ENGINES, isEngineClosed } from '../config/engines';
import ModelSelector from './generate/ModelSelector';

const VIDEO_CAMERA_MOTIONS = [
  { id: 'pan_right', name: 'Pan Right', description: 'Smooth horizontal movement to the right' },
  { id: 'pan_left', name: 'Pan Left', description: 'Smooth horizontal movement to the left' },
  { id: 'tilt_up', name: 'Tilt Up', description: 'Smooth vertical movement upward' },
  { id: 'tilt_down', name: 'Tilt Down', description: 'Smooth vertical movement downward' },
  { id: 'zoom_in', name: 'Zoom In', description: 'Push in towards the subject' },
  { id: 'zoom_out', name: 'Zoom Out', description: 'Pull back from the subject' },
];

import useAppStore from '../store/useAppStore';
import useModelStore from '../store/useModelStore';
import useWorkspaceStore from '../store/useWorkspaceStore';

export default function VideoStudio({ onAddSafetyLog = () => {} }) {
  const { mode, isAdultMode, openModelModal } = useAppStore();
  const { 
    videoEngine, setVideoEngine, 
    baseModel, loras, 
    removeLora, updateLoraWeight, clearLoras 
  } = useModelStore();
  const { videoSourceImage: sourceImage, setVideoSourceImage: setSourceImage } = useWorkspaceStore();
  const [activeSubTab, setActiveSubTab] = useState('text-to-video'); // 'text-to-video' | 'image-to-video' | 'video-to-video'
  const [prompt, setPrompt] = useState('');
  const [selectedMotion, setSelectedMotion] = useState('pan_right');
  const [duration, setDuration] = useState(5);
  const [fps, setFps] = useState(30);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState([]);
  const [safetyError, setSafetyError] = useState(null);

  const handleGenerateVideo = async () => {
    if (!prompt.trim() && activeSubTab === 'text-to-video') return;
    setSafetyError(null);

    // 1. Safety Check (Elevated video risk per PRD Section 6.1 & 8)
    const safetyCheck = checkPromptSafety(prompt, isAdultMode);
    
    onAddSafetyLog?.(createSafetyAuditLog('VIDEO_SAFETY_SCAN', {
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
      const newVid = await generateVideoAI({
        prompt: prompt || 'Animate static scene into dynamic motion video clip',
        motion: selectedMotion,
        duration,
        sourceImage,
        isAdultMode,
        engine: videoEngine,
        baseModel: baseModel?.version?.fileName || baseModel?.name || '',
        loras: (loras || []).map(l => ({
          id: l.fileName || l.name,
          name: l.name,
          weight: l.weight,
        })),
      });

      setGeneratedVideos(prev => [newVid, ...prev]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setSourceImage(uploadEvent.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 pb-24 md:pb-6">
      
      {/* Banner & Engine Selector */}
      <div className="text-center space-y-4 max-w-xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-primary)] via-[var(--text-accent)] to-purple-400">
          AI Video Generation Suite
        </h1>
        <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
          Generate cinematic clips, animate static artwork, or restyle existing video footage with camera motion control.
        </p>
        
        <div className="pt-2 text-left space-y-4">
          {mode !== 'basic' && (
            <EngineSelector 
              engines={VIDEO_ENGINES} 
              selectedEngineId={videoEngine} 
              onSelectEngine={setVideoEngine} 
              label="Video Inference Engine"
            />
          )}

          {!isEngineClosed(videoEngine) && (
            <ModelSelector
              baseModel={baseModel}
              loras={loras || []}
              mode={mode || 'advanced'}
              onOpenExplorer={() => openModelModal(videoEngine)}
              onRemoveLora={removeLora}
              onUpdateLoraWeight={updateLoraWeight}
              onClearLoras={clearLoras}
            />
          )}
        </div>
      </div>

      {/* Mode Sub-Tabs */}
      <div className="flex justify-center">
        <div className="mode-toggle flex-wrap justify-center">
          <button
            onClick={() => setActiveSubTab('text-to-video')}
            className={`mode-toggle-option ${activeSubTab === 'text-to-video' ? 'active' : ''}`}
          >
            Text-to-Video
          </button>
          <button
            onClick={() => setActiveSubTab('image-to-video')}
            className={`mode-toggle-option ${activeSubTab === 'image-to-video' ? 'active' : ''}`}
          >
            Image-to-Video
          </button>
          <button
            onClick={() => setActiveSubTab('video-to-video')}
            className={`mode-toggle-option ${activeSubTab === 'video-to-video' ? 'active' : ''}`}
          >
            Video-to-Video
          </button>
        </div>
      </div>

      {/* Video Generation Studio Controls Card */}
      <div className="card p-5 sm:p-6 space-y-6">
        
        {/* Source Upload Zone for Image-to-Video / Video-to-Video */}
        {(activeSubTab === 'image-to-video' || activeSubTab === 'video-to-video') && (
          <div className="border-2 border-dashed rounded-xl p-6 text-center space-y-3 transition-all" style={{ borderColor: 'var(--border-accent)', background: 'var(--accent-muted)' }}>
            {sourceImage ? (
              <div className="relative max-w-sm mx-auto rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-default)' }}>
                <img src={sourceImage} alt="Source" className="w-full h-44 object-cover" />
                <button
                  onClick={() => setSourceImage(null)}
                  className="absolute top-2 right-2 px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded-md"
                >
                  Remove Source
                </button>
              </div>
            ) : (
              <label className="cursor-pointer block space-y-2">
                <Upload className="w-8 h-8 mx-auto" style={{ color: 'var(--text-accent)' }} />
                <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {activeSubTab === 'image-to-video' ? 'Upload Source Image to Animate' : 'Upload Source Video to Restyle'}
                </div>
                <p className="text-xs text-slate-400">PNG, JPG, MP4 supported up to 50MB</p>
                <input type="file" accept="image/*,video/*" onChange={handleImageUpload} className="hidden" />
              </label>
            )}
          </div>
        )}

        {/* Prompt Input */}
        <div className="space-y-2">
          <label className="text-[12px] font-medium block" style={{ color: 'var(--text-secondary)' }}>Video Prompt & Motion Guidance</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Drone flying over futuristic neon city under heavy rain, camera panning smoothly, 4k 60fps cinematic..."
            rows={3}
            className="input w-full text-[13px] leading-relaxed"
          />
        </div>

        {/* Camera Motion Controls Grid */}
        <div className="space-y-3">
          <label className="text-[12px] font-medium flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
            <Camera className="w-4 h-4" style={{ color: 'var(--text-accent)' }} />
            <span>Camera Motion Vector</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {VIDEO_CAMERA_MOTIONS.map((mot) => (
              <button
                key={mot.id}
                onClick={() => setSelectedMotion(mot.id)}
                className={`p-3 rounded-xl text-left transition-all ${
                  selectedMotion === mot.id
                    ? 'chip active'
                    : 'chip'
                }`}
                style={{ borderRadius: 'var(--radius-lg)', display: 'block' }}
              >
                <div className="font-semibold text-[11px]">{mot.name}</div>
                <div className="text-[10px] line-clamp-1 mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{mot.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Duration & FPS Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <div>
            <div className="flex justify-between text-[11px] font-medium mb-1.5">
              <span style={{ color: 'var(--text-secondary)' }}>Clip Duration</span>
              <span style={{ color: 'var(--text-accent)' }}>{duration} Seconds</span>
            </div>
            <input
              type="range"
              min="3"
              max="10"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>
          <div>
            <div className="flex justify-between text-[11px] font-medium mb-1.5">
              <span style={{ color: 'var(--text-secondary)' }}>Target Framerate</span>
              <span style={{ color: 'var(--text-accent)' }}>{fps} FPS</span>
            </div>
            <div className="flex space-x-2">
              {[24, 30, 60].map(f => (
                <button
                  key={f}
                  onClick={() => setFps(f)}
                  className={`chip flex-1 justify-center ${fps === f ? 'active' : ''}`}
                >
                  {f} FPS
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate Action */}
        <button
          onClick={handleGenerateVideo}
          disabled={isGenerating}
          className="btn btn-primary btn-primary-glow w-full py-3.5 text-[14px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Rendering Motion Frames & Temporal Flow...</span>
            </>
          ) : (
            <>
              <Video className="w-5 h-5" />
              <span>Generate AI Video Clip</span>
            </>
          )}
        </button>

      </div>

      {/* Generated Videos Output Section */}
      <div className="space-y-4 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <h2 className="text-[16px] font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          Rendered Video Gallery
        </h2>

        {generatedVideos.length === 0 ? (
          <div className="card p-10 text-center text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
            No video clips rendered yet. Configure your prompt and motion above.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {generatedVideos.map(vid => (
              <div key={vid.id} className="card overflow-hidden space-y-3 p-4">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-black group">
                  <video 
                    src={vid.videoUrl} 
                    poster={vid.posterUrl}
                    controls 
                    className="w-full h-full object-cover" 
                  />
                  <div className="badge absolute top-2 left-2">
                    {vid.fps} FPS • {vid.duration}s
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-[13px]" style={{ color: 'var(--text-primary)' }}>{vid.title}</div>
                  <div className="text-[11px] mt-1 flex items-center justify-between" style={{ color: 'var(--text-tertiary)' }}>
                    <span>Motion: {vid.motion}</span>
                    <span className="badge-success badge">C2PA Verified</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
