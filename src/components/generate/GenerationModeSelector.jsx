import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image as ImageIcon, Zap, Copy, ImagePlus, ArrowUpCircle, UserCircle, Maximize, Brush, FileSearch } from 'lucide-react';

export default function GenerationModeSelector({ currentMode, onSelectMode }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);

  const getTranslatedModes = () => [
    { id: 'create', label: t('modes.create', 'Create Image'), icon: ImageIcon, desc: t('modes.createDesc', 'Generate an AI image from text') },
    { id: 'draft', label: t('modes.draft', 'Draft'), icon: Zap, desc: t('modes.draftDesc', 'Fast generation for quick iterations') },
    { id: 'variations', label: t('modes.variations', 'Image Variations'), icon: Copy, desc: t('modes.variationsDesc', 'Generate a variation of an existing image') },
    { id: 'img2img', label: t('modes.img2img', 'Image to Image'), icon: ImagePlus, desc: t('modes.img2imgDesc', 'Generate or edit using reference images') },
    { id: 'upscale', label: t('modes.upscale', 'Upscale'), icon: ArrowUpCircle, desc: t('modes.upscaleDesc', 'Increase image resolution') },
    { id: 'facefix', label: t('modes.facefix', 'Image Face Fix'), icon: UserCircle, desc: t('modes.facefixDesc', 'Fix faces in an existing image') },
    { id: 'hires', label: t('modes.hires', 'Image Hires Fix'), icon: Maximize, desc: t('modes.hiresDesc', 'Generate a large image with enhanced details') },
  ];

  const translatedModes = getTranslatedModes();

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const activeMode = translatedModes.find(m => m.id === currentMode) || translatedModes[0];
  const ActiveIcon = activeMode.icon;

  return (
    <div className="relative mb-4" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[var(--surface-0)] border border-[var(--border-subtle)] hover:border-purple-500/50 px-4 py-3 rounded-2xl flex items-center justify-between transition-all shadow-inner group"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-subtle)] flex items-center justify-center text-[var(--accent)] group-hover:scale-110 transition-transform">
            <ActiveIcon className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="text-sm font-bold text-[var(--text-primary)] tracking-wide">{activeMode.label}</div>
            <div className="text-[11px] text-[var(--text-secondary)]">{activeMode.desc}</div>
          </div>
        </div>
        <svg className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[var(--surface-1)]/95 backdrop-blur-xl border border-[var(--border-subtle)] rounded-2xl py-2 max-h-[60vh] overflow-y-auto shadow-2xl">
          {translatedModes.map(mode => {
            const Icon = mode.icon;
            const isActive = mode.id === currentMode;
            return (
              <button
                key={mode.id}
                onClick={() => {
                  onSelectMode(mode.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--surface-2)] transition-colors text-left ${isActive ? 'bg-[var(--accent-subtle)] border-l-2 border-[var(--accent)]' : 'border-l-2 border-transparent'}`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`} />
                <div>
                  <div className={`text-sm font-semibold ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-primary)] opacity-80'}`}>{mode.label}</div>
                  <div className="text-[11px] text-[var(--text-secondary)]">{mode.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
