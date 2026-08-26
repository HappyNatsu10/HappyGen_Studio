import React from 'react';
import { Zap, Sparkles, Crown } from 'lucide-react';

const ASPECT_RATIOS = [
  { label: 'Portrait', value: '2:3', w: 512, h: 768 },
  { label: 'Square', value: '1:1', w: 576, h: 576 },
  { label: 'Landscape', value: '3:2', w: 768, h: 512 },
  { label: 'Wide', value: '16:9', w: 832, h: 468 },
  { label: 'Tall', value: '9:16', w: 468, h: 832 },
];

const QUALITY_PRESETS = [
  { id: 'fast', label: 'Fast', icon: Zap, steps: 6, cfg: 5.5, desc: '~10s' },
  { id: 'quality', label: 'Quality', icon: Sparkles, steps: 20, cfg: 6.5, desc: '~35s' },
  { id: 'ultra', label: 'Ultra', icon: Crown, steps: 30, cfg: 7.0, desc: '~60s' },
];

export default function GenerationSettings({
  mode,
  aspectRatio,
  setAspectRatio,
  qualityPreset,
  setQualityPreset,
  steps,
  setSteps,
  cfg,
  setCfg,
  seed,
  setSeed,
  batchCount,
  setBatchCount,
}) {
  // In basic mode, quality preset controls steps/cfg
  const handleQualityChange = (preset) => {
    setQualityPreset(preset.id);
    setSteps(preset.steps);
    setCfg(preset.cfg);
  };

  return (
    <div className="space-y-4">
      {/* Aspect Ratio */}
      <div>
        <label className="text-[11px] font-medium block mb-2" style={{ color: 'var(--text-tertiary)' }}>
          Aspect Ratio
        </label>
        <div className="flex flex-wrap gap-2">
          {ASPECT_RATIOS.map(ar => (
            <button
              key={ar.value}
              onClick={() => setAspectRatio(ar)}
              className={`chip flex-1 justify-center text-[11px] min-w-[70px] ${
                aspectRatio.value === ar.value ? 'active' : ''
              }`}
            >
              {ar.label}
            </button>
          ))}
        </div>
      </div>

      {/* Basic Mode: Quality Preset & Quantity */}
      {mode === 'basic' && (
        <div className="space-y-5 mt-2">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-3">
              Quality Preset
            </label>
            <div className="flex gap-3">
              {QUALITY_PRESETS.map(preset => {
                const Icon = preset.icon;
                const isActive = qualityPreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleQualityChange(preset)}
                    className={`flex-1 flex flex-col items-center py-4 rounded-xl cursor-pointer transition-all duration-300 border relative overflow-hidden group ${
                      isActive 
                        ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.15)] scale-[1.02]' 
                        : 'border-[var(--border-subtle)] bg-[var(--surface-0)] hover:bg-[var(--surface-1)] hover:border-slate-500/50'
                    }`}
                  >
                    {isActive && <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent pointer-events-none" />}
                    <Icon className={`w-5 h-5 mb-2 transition-colors ${isActive ? 'text-purple-400' : 'text-slate-400 group-hover:text-slate-300'}`} />
                    <span className={`text-sm font-bold tracking-wide transition-colors ${isActive ? 'text-white' : 'text-slate-300'}`}>
                      {preset.label}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-semibold">
                      {preset.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-3">
              Quantity
            </label>
            <div className="flex gap-3">
              {[1, 2, 4].map(qty => {
                const isActive = batchCount === qty;
                return (
                  <button
                    key={qty}
                    onClick={() => setBatchCount(qty)}
                    className={`flex-1 flex flex-col items-center py-3 rounded-xl cursor-pointer transition-all duration-300 border relative overflow-hidden group ${
                      isActive 
                        ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.15)] scale-[1.02]' 
                        : 'border-[var(--border-subtle)] bg-[var(--surface-0)] hover:bg-[var(--surface-1)] hover:border-slate-500/50'
                    }`}
                  >
                    {isActive && <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent pointer-events-none" />}
                    <span className={`text-lg font-black transition-colors ${isActive ? 'text-purple-400' : 'text-slate-300'}`}>
                      {qty}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                      IMG
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Advanced Mode: Full Controls */}
      {mode === 'advanced' && (
        <div className="space-y-5 mt-2">
          {/* Steps */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300">
                Inference Steps
              </label>
              <span className="text-xs font-mono bg-white/5 px-2 py-0.5 rounded text-purple-300">{steps}</span>
            </div>
            <input
              type="range"
              min="4"
              max="50"
              step="1"
              value={steps}
              onChange={e => setSteps(Number(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 transition-all"
            />
          </div>

          {/* CFG */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300">
                CFG Scale
              </label>
              <span className="text-xs font-mono bg-white/5 px-2 py-0.5 rounded text-purple-300">{cfg}</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="0.5"
              value={cfg}
              onChange={e => setCfg(parseFloat(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 transition-all"
            />
          </div>

          {/* Seed */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Seed
            </label>
            <input
              type="text"
              value={seed}
              onChange={e => setSeed(e.target.value)}
              placeholder="-1 for random"
              className="w-full bg-[var(--surface-0)] border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            />
          </div>

          {/* Batch */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300">
                Batch Count
              </label>
              <span className="text-xs font-mono bg-white/5 px-2 py-0.5 rounded text-purple-300">{batchCount}</span>
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
          </div>
        </div>
      )}
    </div>
  );
}

export { ASPECT_RATIOS };
