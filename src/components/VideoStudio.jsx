import React, { useState } from 'react';
import { VIDEO_CAMERA_MOTIONS } from '../data/stylesData';
import { Video, Film, Camera, Play, Sparkles, Upload, ShieldCheck, Zap, Download, RefreshCw } from 'lucide-react';
import { generateVideoAI } from '../services/aiService';
import { checkPromptSafety, createSafetyAuditLog } from '../services/safetyService';

export default function VideoStudio({
  isAdultMode,
  onAddSafetyLog
}) {
  const [activeSubTab, setActiveSubTab] = useState('text-to-video'); // 'text-to-video' | 'image-to-video' | 'video-to-video'
  const [prompt, setPrompt] = useState('');
  const [selectedMotion, setSelectedMotion] = useState('pan_right');
  const [duration, setDuration] = useState(5);
  const [fps, setFps] = useState(30);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState([]);
  const [sourceImage, setSourceImage] = useState(null);
  const [safetyError, setSafetyError] = useState(null);

  const handleGenerateVideo = async () => {
    if (!prompt.trim() && activeSubTab === 'text-to-video') return;
    setSafetyError(null);

    // 1. Safety Check (Elevated video risk per PRD Section 6.1 & 8)
    const safetyCheck = checkPromptSafety(prompt, isAdultMode);
    
    onAddSafetyLog(createSafetyAuditLog('VIDEO_SAFETY_SCAN', {
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
        isAdultMode
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-950/80 border border-purple-500/30 text-purple-300">
          <Film className="w-3.5 h-3.5 text-purple-400" />
          <span>Sora & Runway Gen-3 Video Inference Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-indigo-300">
          AI Video Generation Suite
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto">
          Generate cinematic clips, animate static artwork, or restyle existing video footage with camera motion control.
        </p>
      </div>

      {/* Mode Sub-Tabs */}
      <div className="flex justify-center">
        <div className="bg-slate-900/90 p-1.5 rounded-2xl border border-white/10 flex space-x-2">
          <button
            onClick={() => setActiveSubTab('text-to-video')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeSubTab === 'text-to-video'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Text-to-Video
          </button>
          <button
            onClick={() => setActiveSubTab('image-to-video')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeSubTab === 'image-to-video'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Image-to-Video
          </button>
          <button
            onClick={() => setActiveSubTab('video-to-video')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeSubTab === 'video-to-video'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Video-to-Video
          </button>
        </div>
      </div>

      {/* Video Generation Studio Controls Card */}
      <div className="glass-panel p-6 rounded-3xl space-y-6">
        
        {/* Source Upload Zone for Image-to-Video / Video-to-Video */}
        {(activeSubTab === 'image-to-video' || activeSubTab === 'video-to-video') && (
          <div className="border-2 border-dashed border-purple-500/40 rounded-2xl p-6 text-center space-y-3 bg-purple-950/20 hover:bg-purple-950/30 transition-all">
            {sourceImage ? (
              <div className="relative max-w-sm mx-auto rounded-xl overflow-hidden border border-white/20">
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
                <Upload className="w-8 h-8 text-purple-400 mx-auto" />
                <div className="text-sm font-bold text-slate-200">
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
          <label className="text-xs font-bold text-slate-300 block">Video Prompt & Motion Guidance</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Drone flying over futuristic neon city under heavy rain, camera panning smoothly, 4k 60fps cinematic..."
            rows={3}
            className="w-full bg-slate-950 text-white rounded-xl p-3 text-sm border border-white/10 focus:border-purple-500 outline-none"
          />
        </div>

        {/* Camera Motion Controls Grid */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-300 block flex items-center space-x-1">
            <Camera className="w-4 h-4 text-purple-400" />
            <span>Camera Motion Vector</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {VIDEO_CAMERA_MOTIONS.map((mot) => (
              <button
                key={mot.id}
                onClick={() => setSelectedMotion(mot.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedMotion === mot.id
                    ? 'bg-purple-950 border-purple-500 text-white ring-2 ring-purple-500/40'
                    : 'bg-slate-900/80 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <div className="font-bold text-xs">{mot.name}</div>
                <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{mot.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Duration & FPS Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-white/5">
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
              <span>Clip Duration</span>
              <span className="text-purple-400">{duration} Seconds</span>
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
            <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
              <span>Target Framerate</span>
              <span className="text-purple-400">{fps} FPS</span>
            </div>
            <div className="flex space-x-2">
              {[24, 30, 60].map(f => (
                <button
                  key={f}
                  onClick={() => setFps(f)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    fps === f ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400'
                  }`}
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
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white font-extrabold text-base shadow-xl shadow-purple-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-2"
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
      <div className="space-y-4 pt-4 border-t border-white/10">
        <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
          <span>Rendered Video Gallery</span>
        </h2>

        {generatedVideos.length === 0 ? (
          <div className="border border-white/10 rounded-2xl p-10 text-center text-slate-400 text-sm">
            No video clips rendered yet. Configure your prompt and motion above.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {generatedVideos.map(vid => (
              <div key={vid.id} className="glass-panel rounded-2xl overflow-hidden space-y-3 p-4">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-black group">
                  <video 
                    src={vid.videoUrl} 
                    poster={vid.posterUrl}
                    controls 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 backdrop-blur rounded text-[10px] font-bold text-purple-300 border border-purple-500/30">
                    {vid.fps} FPS • {vid.duration}s
                  </div>
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-200">{vid.title}</div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
                    <span>Motion: {vid.motion}</span>
                    <span className="text-emerald-400 font-mono">C2PA Verified</span>
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
