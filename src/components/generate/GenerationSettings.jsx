import React from 'react';
import { Zap, Sparkles, Crown, HelpCircle, Save, CheckCircle2 } from 'lucide-react';
import Tooltip from '../common/Tooltip';

const ASPECT_RATIOS = [
  { label: 'Square (1024 x 1024)', value: '1:1', w: 1024, h: 1024 },
  { label: 'Portrait (896 x 1152)', value: '7:9', w: 896, h: 1152 },
  { label: 'Landscape (1152 x 896)', value: '9:7', w: 1152, h: 896 },
  { label: 'Panorama (1216 x 832)', value: '19:13', w: 1216, h: 832 },
  { label: 'Vertical Panorama (832 x 1216)', value: '13:19', w: 832, h: 1216 },
  { label: 'Cinematic Wide (1536 x 640)', value: '12:5', w: 1536, h: 640 },
  { label: 'Cinematic Portrait (768 x 1344)', value: '4:7', w: 768, h: 1344 },
  { label: 'Extended Portrait (640 x 1536)', value: '5:12', w: 640, h: 1536 },
];

const SAMPLERS = [
  { id: 'Euler a', label: 'Euler Ancestral (Euler a)' },
  { id: 'DPM++ 2M Karras', label: 'DPM++ 2M Karras' },
  { id: 'DPM++ SDE Karras', label: 'DPM++ SDE Karras' },
  { id: 'Euler', label: 'Euler' },
  { id: 'UniPC', label: 'UniPC' },
  { id: 'DDIM', label: 'DDIM' },
  { id: 'LMS Karras', label: 'LMS Karras' },
  { id: 'PNDM', label: 'PNDM' },
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
  sampler,
  setSampler,
  baseModel,
  hasCustomProfile,
  onSaveProfile,
}) {
  const [justSaved, setJustSaved] = React.useState(false);

  const handleSave = () => {
    onSaveProfile();
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  return (
    <div className="space-y-4">
      {baseModel && (
        <div className="bg-[var(--surface-0)] border border-[var(--border-subtle)] rounded-xl p-3 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[12px] font-semibold text-white truncate max-w-[200px]">{baseModel.name}</span>
            <span className="text-[10px] text-slate-400">{hasCustomProfile ? 'Using Custom Settings' : 'Using Standard Settings'}</span>
          </div>
          <button
            onClick={handleSave}
            disabled={justSaved}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
              justSaved ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-[var(--surface-1)] hover:bg-[var(--surface-2)] text-purple-300 border border-purple-500/30'
            }`}
          >
            {justSaved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {justSaved ? 'Saved!' : 'Save as Default'}
          </button>
        </div>
      )}

      {/* Aspect Ratio */}
      <div>
        <label className="text-[11px] font-medium block mb-2" style={{ color: 'var(--text-tertiary)' }}>
          Aspect Ratio / Canvas Size
        </label>
        <select
          value={aspectRatio.label}
          onChange={e => {
            const selected = ASPECT_RATIOS.find(ar => ar.label === e.target.value);
            if (selected) setAspectRatio(selected);
          }}
          className="w-full bg-[var(--surface-0)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-[13px] text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all appearance-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(255,255,255,0.5)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
        >
          {ASPECT_RATIOS.map(ar => (
            <option key={ar.label} value={ar.label} className="bg-[var(--surface-1)] text-white">
              {ar.label}
            </option>
          ))}
        </select>
      </div>

      {/* Sampling Method */}
      <div>
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
          Sampling Method
          <Tooltip text="The algorithm used to denoise the image. Different samplers yield different artistic styles and details.">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500 cursor-help" />
          </Tooltip>
        </label>
        <select
          value={sampler}
          onChange={e => setSampler(e.target.value)}
          className="w-full bg-[var(--surface-0)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-[13px] text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all appearance-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(255,255,255,0.5)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
        >
          {SAMPLERS.map(s => (
            <option key={s.id} value={s.id} className="bg-[var(--surface-1)] text-white">
              {s.label}
            </option>
          ))}
        </select>
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
      </div>
    </div>
  );
}

export { ASPECT_RATIOS };
