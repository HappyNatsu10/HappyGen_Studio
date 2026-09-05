import React from 'react';
import { Wand2, Lightbulb } from 'lucide-react';
import ImageToPromptModal from './ImageToPromptModal';

const QUICK_TAGS = [
  '1girl', 'solo', 'masterpiece', 'best quality', 'detailed eyes',
  'long hair', 'smile', 'outdoors', 'night sky',
  'school uniform', 'fantasy armor', 'dynamic pose', 'close-up portrait',
];

export default function PromptEditor({
  prompt,
  setPrompt,
  negativePrompt,
  setNegativePrompt,
  onEnhance,
}) {
  const [isPromptModalOpen, setIsPromptModalOpen] = React.useState(false);

  const handleAppendTag = (tag) => {
    setPrompt(prev => {
      if (!prev.trim()) return tag;
      return prev.trim() + ', ' + tag;
    });
  };

  const handleEnhance = () => {
    if (!prompt.trim()) return;
    const enhancements = [
      ', highly detailed, masterpiece, 8k resolution, cinematic lighting',
      ', intricate details, sharp focus, professional illustration, studio quality',
      ', vivid colors, atmospheric perspective, award-winning digital art',
    ];
    const pick = enhancements[Math.floor(Math.random() * enhancements.length)];
    setPrompt(prev => prev.trim() + pick);
  };

  const handleUseGeneratedPrompt = (generatedTags) => {
    setPrompt(generatedTags);
  };

  return (
    <div className="space-y-3">
      {/* Main Prompt */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-3">
            <label className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
              Prompt
            </label>
            <button
              onClick={() => setIsPromptModalOpen(true)}
              className="text-[10px] font-medium px-2 py-1 rounded bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 transition-colors flex items-center gap-1"
            >
              <Lightbulb className="w-3 h-3" />
              Image To Prompt
            </button>
          </div>
          <span className="text-[10px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
            {prompt.length} chars
          </span>
        </div>
        <div className="relative">
          <textarea
            value={prompt}
            onInput={e => setPrompt(e.target.value)}
            onChange={e => setPrompt(e.target.value)}
            onBlur={e => setPrompt(e.target.value)}
            placeholder="Describe what you want to create..."
            rows={4}
            className="w-full bg-[var(--surface-0)] border border-[var(--border-subtle)] rounded-2xl p-4 text-[13px] leading-relaxed text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none shadow-inner"
            style={{ paddingRight: '44px' }}
          />
          <button
            onClick={handleEnhance}
            disabled={!prompt.trim()}
            className="absolute right-3 bottom-3 p-2 rounded-xl cursor-pointer transition-all disabled:opacity-30 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 hover:scale-105"
            title="Enhance prompt"
          >
            <Wand2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Image to Prompt Modal */}
      <ImageToPromptModal 
        isOpen={isPromptModalOpen} 
        onClose={() => setIsPromptModalOpen(false)} 
        onUsePrompt={handleUseGeneratedPrompt} 
      />

      {/* Quick Tags — Both Modes */}
      <div>
        <label className="flex items-center gap-1 text-[11px] font-medium mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
          <Lightbulb className="w-3 h-3" />
          Quick Tags
        </label>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => handleAppendTag(tag)}
              className="px-3 py-1.5 bg-white/5 hover:bg-purple-500/20 hover:text-purple-300 border border-[var(--border-subtle)] rounded-full text-[11px] text-slate-300 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Negative Prompt */}
      <div>
          <label className="text-[11px] font-medium block mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
            Negative Prompt
          </label>
          <textarea
            value={negativePrompt}
            onChange={e => setNegativePrompt(e.target.value)}
            placeholder="Things to avoid in the generation..."
            rows={2}
            className="w-full bg-[var(--surface-0)] border border-[var(--border-subtle)] rounded-xl p-3 text-[12px] text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all resize-none shadow-inner"
          />
        </div>
    </div>
  );
}
