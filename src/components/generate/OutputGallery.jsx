import React, { useState, useEffect } from 'react';
import { Download, Copy, Check, Send, Sparkles, ImagePlus } from 'lucide-react';

export default function OutputGallery({ results, isGenerating, mode, onSendToCanvas, onCreateVariant }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [copiedSeed, setCopiedSeed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!isGenerating && results.length > 0) {
      setShowSuccess(true);
      const t = setTimeout(() => setShowSuccess(false), 2000);
      return () => clearTimeout(t);
    }
  }, [isGenerating, results]);

  const activeImage = results[activeIdx] || null;

  const handleDownload = (image) => {
    const a = document.createElement('a');
    a.href = image.url;
    a.download = `omnigen-${image.seed || Date.now()}.png`;
    a.click();
  };

  const handleCopySeed = (seed) => {
    navigator.clipboard.writeText(seed.toString());
    setCopiedSeed(true);
    setTimeout(() => setCopiedSeed(false), 1500);
  };

  if (isGenerating) {
    return (
      <div className="flex-1 grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton rounded-lg overflow-hidden relative" style={{ minHeight: 250 }}>
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30">
              <Sparkles className="w-8 h-8 mb-2 text-white animate-pulse" />
              <div className="h-2 w-1/3 bg-white rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="card flex-1 flex flex-col items-center justify-center py-16 animate-fade-in-up h-full border border-[var(--border-subtle)] overflow-hidden relative rounded-[22px] shadow-xl" style={{ background: 'var(--surface-1)' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 z-0" />

        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 relative z-10 bg-[var(--surface-2)] shadow-[0_0_40px_rgba(168,85,247,0.15)] border border-[var(--border-subtle)]">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 animate-pulse" />
          <Sparkles className="w-8 h-8 text-purple-400 relative z-10" />
        </div>
        
        <h3 className="text-xl font-bold text-white relative z-10 mb-2 drop-shadow-md">
          Your Canvas Awaits
        </h3>
        <p className="text-[14px] text-slate-400 relative z-10 max-w-sm text-center leading-relaxed">
          Describe your vision, tweak your settings, and let HappyGen Studio bring it to life.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 animate-fade-in-up">
      {/* Main Preview */}
      {activeImage && (
        <div className={`card overflow-hidden transition-all duration-500 ${showSuccess ? 'shadow-[0_0_20px_rgba(52,211,153,0.3)] border-[var(--success)]' : ''}`}>
          <div className="relative img-overlay" style={{ background: 'var(--surface-2)' }}>
            <img
              src={activeImage.url}
              alt={activeImage.prompt || ''}
              className="w-full max-h-[500px] object-contain"
            />
            {/* Action overlay - Floating Pill */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10 bg-[var(--surface-1)]/80 backdrop-blur-md px-4 py-2 rounded-full border border-[var(--border-subtle)] shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={() => handleDownload(activeImage)}
                className="p-2 rounded-full cursor-pointer transition-all hover:bg-white/10 hover:text-white text-slate-300"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
              {onCreateVariant && (
                <button
                  onClick={() => onCreateVariant(activeImage.url)}
                  className="p-2 rounded-full cursor-pointer transition-all hover:bg-white/10 hover:text-white text-slate-300"
                  title="Create Variant"
                >
                  <ImagePlus className="w-4 h-4" />
                </button>
              )}
              {onSendToCanvas && (
                <button
                  onClick={() => onSendToCanvas(activeImage.url)}
                  className="p-2 rounded-full cursor-pointer transition-all hover:bg-white/10 hover:text-white text-slate-300"
                  title="Send to Canvas"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Meta — Advanced Mode */}
          {mode === 'advanced' && (
            <div className="px-3 py-2 flex items-center gap-3 flex-wrap border-t" style={{ borderColor: 'var(--border-subtle)' }}>
              {activeImage.width && (
                <span className="text-[10px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
                  {activeImage.width}×{activeImage.height}
                </span>
              )}
              {activeImage.seed && (
                <button
                  onClick={() => handleCopySeed(activeImage.seed)}
                  className="flex items-center gap-1 text-[10px] font-mono cursor-pointer hover:text-[var(--text-primary)] transition-colors"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Seed: {activeImage.seed}
                  {copiedSeed ? <Check className="w-3 h-3" style={{ color: 'var(--success)' }} /> : <Copy className="w-3 h-3 opacity-40" />}
                </button>
              )}
              {activeImage.modelUsed && (
                <span className="text-[10px] truncate" style={{ color: 'var(--text-tertiary)' }}>
                  {activeImage.modelUsed}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Thumbnail strip (if multiple) */}
      {results.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {results.map((img, i) => (
            <button
              key={img.id || i}
              onClick={() => setActiveIdx(i)}
              className="flex-shrink-0 rounded-lg overflow-hidden cursor-pointer transition-all hover:opacity-100"
              style={{
                width: 64,
                height: 64,
                border: i === activeIdx ? '2px solid var(--accent)' : '1px solid var(--border-subtle)',
                opacity: i === activeIdx ? 1 : 0.5,
              }}
            >
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
