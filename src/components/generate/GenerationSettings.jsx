import React from 'react';
import { useTranslation } from 'react-i18next';
import { Zap, Sparkles, Crown, HelpCircle, Save, CheckCircle2 } from 'lucide-react';
import Tooltip from '../common/Tooltip';
import CustomSelect from '../common/CustomSelect';

const ASPECT_RATIO_GROUPS = [
  {
    group: 'Normal',
    ratios: [
      { label: 'Normal Square (1024 x 1024)', value: '1:1', w: 1024, h: 1024 },
      { label: 'Normal Portrait (832 x 1216)', value: '13:19', w: 832, h: 1216 },
      { label: 'Normal Landscape (1216 x 832)', value: '19:13', w: 1216, h: 832 },
    ]
  },
  {
    group: 'Large',
    ratios: [
      { label: 'Large Square (1472 x 1472)', value: '1:1 Large', w: 1472, h: 1472 },
      { label: 'Large Portrait (1024 x 1536)', value: '2:3 Large', w: 1024, h: 1536 },
      { label: 'Large Landscape (1536 x 1024)', value: '3:2 Large', w: 1536, h: 1024 },
    ]
  },
  {
    group: 'Wallpaper',
    ratios: [
      { label: 'Wallpaper Portrait (1088 x 1920)', value: '9:16 Wall', w: 1088, h: 1920 },
      { label: 'Wallpaper Landscape (1920 x 1088)', value: '16:9 Wall', w: 1920, h: 1088 },
    ]
  },
  {
    group: 'Cinematic',
    ratios: [
      { label: 'Cinematic Wide (1536 x 640)', value: '12:5', w: 1536, h: 640 },
      { label: 'Cinematic Portrait (768 x 1344)', value: '4:7', w: 768, h: 1344 },
    ]
  },
  {
    group: 'Custom',
    ratios: [
      { label: 'Custom...', value: 'custom', w: 1024, h: 1024 }
    ]
  }
];

const ASPECT_RATIOS = ASPECT_RATIO_GROUPS.flatMap(g => g.ratios);

const SAMPLERS = [
  { id: 'Euler a', label: 'Euler a' },
  { id: 'Euler', label: 'Euler' },
  { id: 'Euler (trailing)', label: 'Euler (trailing)' },
  { id: 'Heun', label: 'Heun (2x)' },
  { id: 'DPM2', label: 'DPM2 (2x)' },
  { id: 'DPM2 a', label: 'DPM2 a (2x)' },
  { id: 'DPM++ 2M', label: 'DPM++ 2M' },
  { id: 'DPM++ 2M SDE', label: 'DPM++ 2M SDE' },
  { id: 'DPM++ 3M SDE', label: 'DPM++ 3M SDE' },
  { id: 'DPM++ SDE', label: 'DPM++ SDE (2x)' },
  { id: 'UniPC', label: 'UniPC' },
  { id: 'LMS', label: 'LMS' },
  { id: 'DDIM', label: 'DDIM' },
];

const SCHEDULES = [
  { id: 'Automatic', label: 'Automatic' },
  { id: 'Karras', label: 'Karras' },
  { id: 'Exponential', label: 'Exponential' },
  { id: 'Beta', label: 'Beta' },
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
  schedule,
  setSchedule,
  autoFaceFix,
  setAutoFaceFix,
  baseModel,
  hasCustomProfile,
  onSaveProfile,
}) {
  const { t } = useTranslation();
  const [justSaved, setJustSaved] = React.useState(false);
  
  const isFlowMatching = baseModel && (
    (baseModel.name || "").toLowerCase().includes('flux') || 
    (baseModel.name || "").toLowerCase().includes('anima') || 
    (baseModel.version?.baseModel || "").toLowerCase().includes('flux')
  );

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
            <span className="text-[12px] font-semibold text-[var(--text-primary)] truncate max-w-[200px]">{baseModel.name}</span>
            <span className="text-[10px] text-[var(--text-secondary)]">{hasCustomProfile ? t('generate.customSettings', 'Using Custom Settings') : t('generate.standardSettings', 'Using Standard Settings')}</span>
          </div>
          <button
            onClick={handleSave}
            disabled={justSaved}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
              justSaved ? 'bg-green-500/20 text-green-500 border border-green-500/30' : 'bg-[var(--surface-1)] hover:bg-[var(--surface-2)] text-[var(--accent)] border border-[var(--border-subtle)]'
            }`}
          >
            {justSaved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {justSaved ? t('generate.saved', 'Saved!') : t('generate.saveDefault', 'Save as Default')}
          </button>
        </div>
      )}

      {/* Aspect Ratio */}
      <div>
        <label className="text-[11px] font-medium block mb-2" style={{ color: 'var(--text-tertiary)' }}>
          {t('generate.aspectRatio', 'Aspect Ratio / Canvas Size')}
        </label>
        <CustomSelect
          value={aspectRatio.label}
          onChange={(val) => {
            const selected = ASPECT_RATIOS.find(ar => ar.label === val);
            if (selected) setAspectRatio(selected);
          }}
          groups={ASPECT_RATIO_GROUPS.map(group => ({
            label: t(`generate.group_${group.group.toLowerCase()}`, group.group),
            options: group.ratios.map(ar => {
              const translatedLabel = ar.label.replace('Normal', t('generate.normal', 'Normal'))
                                             .replace('Large', t('generate.large', 'Large'))
                                             .replace('Wallpaper', t('generate.wallpaper', 'Wallpaper'))
                                             .replace('Cinematic', t('generate.cinematic', 'Cinematic'))
                                             .replace('Square', t('generate.square', 'Square'))
                                             .replace('Portrait', t('generate.portrait', 'Portrait'))
                                             .replace('Landscape', t('generate.landscape', 'Landscape'))
                                             .replace('Wide', t('generate.wide', 'Wide'))
                                             .replace('Custom...', t('generate.customAspect', 'Custom...'));
              return { label: translatedLabel, value: ar.label };
            })
          }))}
        />
        
        {aspectRatio.value === 'custom' && (
          <div className="mt-3 animate-fade-in-up">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-1 block">{t('generate.width', 'Width')}</label>
                <input 
                  type="number" 
                  value={aspectRatio.w}
                  min={256}
                  max={2048}
                  step={64}
                  onChange={e => setAspectRatio({ ...aspectRatio, w: parseInt(e.target.value) || 0 })}
                  onBlur={e => {
                    const val = parseInt(e.target.value) || 0;
                    const snapped = Math.max(256, Math.min(2048, Math.round(val / 64) * 64));
                    setAspectRatio({ ...aspectRatio, w: snapped });
                  }}
                  className="w-full bg-[var(--surface-0)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-1 block">{t('generate.height', 'Height')}</label>
                <input 
                  type="number" 
                  value={aspectRatio.h}
                  min={256}
                  max={2048}
                  step={64}
                  onChange={e => setAspectRatio({ ...aspectRatio, h: parseInt(e.target.value) || 0 })}
                  onBlur={e => {
                    const val = parseInt(e.target.value) || 0;
                    const snapped = Math.max(256, Math.min(2048, Math.round(val / 64) * 64));
                    setAspectRatio({ ...aspectRatio, h: snapped });
                  }}
                  className="w-full bg-[var(--surface-0)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>
            </div>
            <p className="text-[10px] text-[var(--text-tertiary)] mt-2">
              {t('generate.aspectRatioNote', 'Note: Canvas size must be a multiple of 64px. Values will automatically snap.')}
            </p>
          </div>
        )}
      </div>

      {/* Sampling Method & Schedule (Hidden for Flow Matching models) */}
      {!isFlowMatching && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
              {t('generate.samplingMethod', 'Sampler')}
              <Tooltip text={t('generate.samplingTooltip', 'The algorithm used to denoise the image. (2x) samplers run twice per step and take twice as long.')}>
                <HelpCircle className="w-3.5 h-3.5 text-slate-500 cursor-help" />
              </Tooltip>
            </label>
            <CustomSelect
              value={sampler}
              onChange={(val) => setSampler(val)}
              options={SAMPLERS.map(s => ({ label: s.label, value: s.id }))}
            />
          </div>
          <div className="flex-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
              {t('generate.schedule', 'Schedule')}
              <Tooltip position="right" text={t('generate.scheduleTooltip', 'The math spacing for steps (Sigma schedule). Karras is highly recommended for realistic models.')}>
                <HelpCircle className="w-3.5 h-3.5 text-slate-500 cursor-help" />
              </Tooltip>
            </label>
            <CustomSelect
              value={schedule}
              onChange={(val) => setSchedule(val)}
              options={SCHEDULES.map(s => ({ label: s.label, value: s.id }))}
            />
          </div>
        </div>
      )}

      <div className="space-y-5 mt-2">
        {/* Steps */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
              {t('generate.inferenceSteps', 'Inference Steps')}
              <Tooltip text={t('generate.stepsTooltip', 'How many refinement steps the AI takes. Higher means more detail but takes longer.')}>
                <HelpCircle className="w-3.5 h-3.5 text-[var(--text-secondary)] cursor-help" />
              </Tooltip>
            </label>
            <span className="text-xs font-mono bg-[var(--surface-3)] px-2 py-0.5 rounded text-[var(--text-primary)]">{steps}</span>
          </div>
          <input
            type="range"
            min="4"
            max="50"
            step="1"
            value={steps}
            onChange={e => setSteps(Number(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--accent)] transition-all"
          />
        </div>

        {/* CFG */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
              {t('generate.cfgScale', 'CFG Scale')}
              <Tooltip text={t('generate.cfgTooltip', 'How strictly the AI follows your prompt. Higher = stricter, Lower = more creative freedom.')}>
                <HelpCircle className="w-3.5 h-3.5 text-[var(--text-secondary)] cursor-help" />
              </Tooltip>
            </label>
            <span className="text-xs font-mono bg-[var(--surface-3)] px-2 py-0.5 rounded text-[var(--text-primary)]">{cfg}</span>
          </div>
          <input
            type="range"
            min="1"
            max="20"
            step="0.5"
            value={cfg}
            onChange={e => setCfg(parseFloat(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--accent)] transition-all"
          />
        </div>

        {/* Seed */}
        <div>
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
            {t('generate.seed', 'Seed')}
            <Tooltip text={t('generate.seedTooltip', 'A random number that generates the initial noise. Use the same seed to reproduce the exact same image.')}>
              <HelpCircle className="w-3.5 h-3.5 text-slate-500 cursor-help" />
            </Tooltip>
          </label>
          <input
            type="text"
            value={seed}
            onChange={e => setSeed(e.target.value)}
            placeholder={t('generate.seedPlaceholder', '-1 for random')}
            className="w-full bg-[var(--surface-0)] border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] placeholder-slate-500 focus:outline-none focus:border-[var(--accent)] transition-all"
          />
        </div>
      </div>
      {/* Auto Face Fix Toggle */}
      <div className="bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-xl p-4 md:p-5 mt-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--accent)]" /> {t('generate.autoFaceFix', 'Auto-Detect Face Fix')}
            </span>
            <span className="text-[11px] text-[var(--text-tertiary)] mt-1 max-w-[250px]">
              {t('generate.autoFaceFixDesc', 'Automatically uses ADetailer (for stylized) or GFPGAN (for realistic) if a face is detected in your prompt. Returns both original and fixed images.')}
            </span>
          </div>
          <button
            onClick={() => setAutoFaceFix(!autoFaceFix)}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${autoFaceFix ? 'bg-[var(--accent)]' : 'bg-[var(--surface-3)]'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${autoFaceFix ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>
    </div>
  );
}

export { ASPECT_RATIOS };
