import React from 'react';
import { Zap, Sparkles, Crown, HelpCircle } from 'lucide-react';
import Tooltip from '../common/Tooltip';

const ASPECT_RATIOS = [
  { label: 'Portrait', value: '2:3', w: 512, h: 768 },
  { label: 'Square', value: '1:1', w: 576, h: 576 },
  { label: 'Landscape', value: '3:2', w: 768, h: 512 },
  { label: 'Wide', value: '16:9', w: 832, h: 464 },
  { label: 'Tall', value: '9:16', w: 464, h: 832 },
];

const QUALITY_PRESETS = [
  { id: 'fast', label: 'Fast', icon: Zap, steps: 6, cfg: 5.5, desc: '~10s' },
  { id: 'quality', label: 'Quality', icon: Sparkles, steps: 20, cfg: 6.5, desc: '~35s' },
  { id: 'ultra', label: 'Ultra', icon: Crown, steps: 30, cfg: 7.0, desc: '~60s' },
];

export default function GenerationSettings({
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

      <div className="space-y-5 mt-2">
        {/* Steps */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              Inference Steps
              <Tooltip text="How many refinement steps the AI takes. Higher means more detail but takes longer.">
                <HelpCircle className="w-3.5 h-3.5 text-slate-500 cursor-help" />
              </Tooltip>
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
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              CFG Scale
              <Tooltip text="How strictly the AI follows your prompt. Higher = stricter, Lower = more creative freedom.">
                <HelpCircle className="w-3.5 h-3.5 text-slate-500 cursor-help" />
              </Tooltip>
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
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
            Seed
            <Tooltip text="A random number that generates the initial noise. Use the same seed to reproduce the exact same image.">
              <HelpCircle className="w-3.5 h-3.5 text-slate-500 cursor-help" />
            </Tooltip>
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
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              Batch Count
              <Tooltip text="How many images to generate at once.">
                <HelpCircle className="w-3.5 h-3.5 text-slate-500 cursor-help" />
              </Tooltip>
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
    </div>
  );
}

export { ASPECT_RATIOS };
