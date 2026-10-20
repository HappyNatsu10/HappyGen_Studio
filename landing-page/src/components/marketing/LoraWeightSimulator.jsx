import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sliders, Layers, Sparkles, Copy, Check, Download, Zap } from 'lucide-react';

export function LoraWeightSimulator() {
  const [weight, setWeight] = useState(0.75);
  const [copiedTrigger, setCopiedTrigger] = useState(null);

  const triggers = ['cybernetic_armor', 'neon_highlights', 'matte_carbon_fiber'];

  const handleCopyTrigger = (tag) => {
    navigator.clipboard.writeText(tag);
    setCopiedTrigger(tag);
    setTimeout(() => setCopiedTrigger(null), 1500);
  };

  // Compute CSS filter or styling based on weight to show immediate feedback without lag
  const getSimulatedStyle = () => {
    // 0.0 -> subtle neutral base
    // 1.0 -> intense contrast, vibrant glow
    const contrast = 100 + (weight * 25);
    const saturate = 95 + (weight * 45);
    return {
      filter: `contrast(${contrast}%) saturate(${saturate}%)`,
      transition: 'filter 0.15s ease-out'
    };
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-12 p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-950/70 backdrop-blur-xl shadow-2xl">
      <div className="flex flex-col lg:flex-row gap-8 items-center">
        
        {/* Left Interactive Control Box */}
        <div className="w-full lg:w-1/2 flex flex-col text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/20 mb-3 w-fit">
            <Layers className="w-3.5 h-3.5" />
            <span>CivitAI LoRA Engine</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
            Stack Multiple LoRAs with Live Weight Scaling
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            Unlike basic generators that lock you into one model, HappyGen Studio lets you blend up to 5 LoRA models simultaneously with granular strength sliders (0.00 to 2.00) to craft entirely custom visual aesthetics.
          </p>

          {/* Active Model Stack Card */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 mb-6">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
              <span className="font-semibold uppercase tracking-wider">Active LoRA Model</span>
              <span className="font-mono text-purple-400">144 MB • CivitAI #184920</span>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 text-lg">
                🎨
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-white">Cyberpunk Mecha Exosuit v3</div>
                <div className="text-xs text-slate-400">by ArtStationPro • 42.5k Downloads</div>
              </div>
            </div>

            {/* Interactive Weight Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Model Influence Weight</span>
                <span className="font-mono font-bold text-purple-400 text-sm">{weight.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>0.00 (Base Model)</span>
                <span>0.50 (Subtle Blend)</span>
                <span>1.00 (Full Style)</span>
              </div>
            </div>
          </div>

          {/* Trigger Words Pills */}
          <div>
            <div className="text-xs font-semibold text-slate-400 mb-2">Trained Trigger Words (Click to copy):</div>
            <div className="flex flex-wrap gap-2">
              {triggers.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleCopyTrigger(tag)}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-900 border border-slate-800 hover:border-purple-500/40 text-slate-300 hover:text-purple-300 transition-colors flex items-center gap-1.5"
                >
                  <span>{tag}</span>
                  {copiedTrigger === tag ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3 text-slate-500" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Preview Display */}
        <div className="w-full lg:w-1/2 relative">
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl aspect-[4/3] group">
            <img
              src="/styles/cyberpunk.png"
              alt="Cyberpunk LoRA Preview"
              style={getSimulatedStyle()}
              className="w-full h-full object-cover"
              loading="lazy"
            />

            {/* Dynamic Overlay readout */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 pointer-events-none">
              <span className="px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md border border-white/10 text-xs font-bold text-white shadow-lg">
                LoRA Weight: <span className="text-purple-400 font-mono">{weight.toFixed(2)}</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-purple-950/80 backdrop-blur-md border border-purple-500/30 text-[10px] text-purple-200">
                {weight < 0.3 ? 'Mild Accent' : weight < 0.7 ? 'Harmonious Style' : 'Maximum Stylization'}
              </span>
            </div>

            <div className="absolute bottom-4 right-4 z-10 pointer-events-none">
              <div className="px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-xs font-mono text-slate-300 flex items-center gap-2 shadow-lg">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>CivitAI Realtime Integration</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
