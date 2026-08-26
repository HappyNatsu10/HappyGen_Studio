import React from 'react';
import { Image as ImageIcon, Zap, Copy, ImagePlus, ArrowUpCircle, UserCircle, Maximize, Brush } from 'lucide-react';

export const GENERATION_MODES = [
  { id: 'create', label: 'Create Image', icon: ImageIcon, desc: 'Generate an AI image from text' },
  { id: 'draft', label: 'Draft', icon: Zap, desc: 'Fast generation for quick iterations' },
  { id: 'variations', label: 'Image Variations', icon: Copy, desc: 'Generate a variation of an existing image' },
  { id: 'img2img', label: 'Image to Image', icon: ImagePlus, desc: 'Generate or edit using reference images' },
  { id: 'upscale', label: 'Upscale', icon: ArrowUpCircle, desc: 'Increase image resolution' },
  { id: 'facefix', label: 'Image Face Fix', icon: UserCircle, desc: 'Fix faces in an existing image' },
  { id: 'hires', label: 'Image Hires Fix', icon: Maximize, desc: 'Hires fix from an existing image' },
];

export default function GenerationModeSelector({ currentMode, onSelectMode }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);

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

  const activeMode = GENERATION_MODES.find(m => m.id === currentMode) || GENERATION_MODES[0];
  const ActiveIcon = activeMode.icon;

  return (
    <div className="relative mb-4" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[var(--surface-0)] border border-[var(--border-subtle)] hover:border-purple-500/50 px-4 py-3 rounded-2xl flex items-center justify-between transition-all shadow-inner group"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
            <ActiveIcon className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="text-sm font-bold text-white tracking-wide">{activeMode.label}</div>
            <div className="text-[11px] text-slate-400">{activeMode.desc}</div>
          </div>
        </div>
        <svg className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[var(--surface-1)]/95 backdrop-blur-xl border border-[var(--border-subtle)] rounded-2xl py-2 max-h-[60vh] overflow-y-auto shadow-2xl">
          {GENERATION_MODES.map(mode => {
            const Icon = mode.icon;
            const isActive = mode.id === currentMode;
            return (
              <button
                key={mode.id}
                onClick={() => {
                  onSelectMode(mode.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left ${isActive ? 'bg-purple-500/10 border-l-2 border-purple-500' : 'border-l-2 border-transparent'}`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
                <div>
                  <div className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-slate-300'}`}>{mode.label}</div>
                  <div className="text-[11px] text-slate-500">{mode.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
