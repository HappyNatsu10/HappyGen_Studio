import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sliders, Layers, Sparkles, Copy, Check, Download, Zap } from 'lucide-react';

const LORA_OPTIONS = {
  cheongsam: {
    id: 'cheongsam',
    name: 'Traditional Silk Cheongsam v3',
    creator: 'EleganceAI',
    downloads: '68.2k',
    size: '182 MB',
    civitaiId: '#319204',
    image: '/studio/anime-cheongsam.jpg',
    triggers: ['silk_cheongsam', 'crimson_embroidery', 'wooden_armchair', 'side_braid'],
    desc: 'Bespoke high-precision embroidery and fabric folds LoRA trained on high-res historical and modern Qipao aesthetics with rich silk luster.'
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk Mecha Exosuit v3',
    creator: 'ArtStationPro',
    downloads: '42.5k',
    size: '144 MB',
    civitaiId: '#184920',
    image: '/styles/cyberpunk.png',
    triggers: ['cybernetic_armor', 'neon_highlights', 'matte_carbon_fiber'],
    desc: 'Dense sci-fi mechanical plating, fiber-optic conduits, and neon emissive rim reflections tuned for SDXL realism.'
  }
};

export function LoraWeightSimulator() {
  const [selectedLora, setSelectedLora] = useState('cheongsam');
  const [weight, setWeight] = useState(0.85);
  const [copiedTrigger, setCopiedTrigger] = useState(null);

  const current = LORA_OPTIONS[selectedLora];

  const handleCopyTrigger = (tag) => {
    navigator.clipboard.writeText(tag);
    setCopiedTrigger(tag);
    setTimeout(() => setCopiedTrigger(null), 1500);
  };

  // Compute CSS filter or styling based on weight to show immediate feedback without lag
  const getSimulatedStyle = () => {
    const contrast = 98 + (weight * 28);
    const saturate = 94 + (weight * 40);
    const brightness = 98 + (weight * 6);
    return {
      filter: `contrast(${contrast}%) saturate(${saturate}%) brightness(${brightness}%)`,
      transition: 'filter 0.15s ease-out'
    };
  };

  return (
    <div className="w-full max-w-5xl lg:max-w-[1240px] mx-auto my-14 p-6 sm:p-8 rounded-[28px] border border-[#1e2345] bg-[#0c0f24]/90 backdrop-blur-xl shadow-2xl">
      <div className="flex flex-col lg:flex-row gap-8 items-center">
        
        {/* Left Interactive Control Box */}
        <div className="w-full lg:w-1/2 flex flex-col text-left">
          <div className="flex items-center justify-between mb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-[#c084fc] bg-[#28153b] border border-[#7e22ce]/50">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>CivitAI LoRA Engine</span>
            </div>

            {/* Model Toggle */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#060815] border border-[#1a1f3c]">
              <button
                onClick={() => { setSelectedLora('cheongsam'); setWeight(0.85); }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedLora === 'cheongsam'
                    ? 'bg-[#4f46e5] text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Silk Art
              </button>
              <button
                onClick={() => { setSelectedLora('cyberpunk'); setWeight(0.75); }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedLora === 'cyberpunk'
                    ? 'bg-[#4f46e5] text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Mecha
              </button>
            </div>
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
            Stack Multiple LoRAs with Live Weight Scaling
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            Unlike basic generators that lock you into one model, HappyGen Studio lets you blend up to 5 LoRA models simultaneously with granular strength sliders (0.00 to 2.00) to craft entirely custom visual aesthetics.
          </p>

          {/* Active Model Stack Card */}
          <div className="p-4 rounded-2xl bg-[#060815] border border-[#1a1f3c] mb-6">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
              <span className="font-semibold uppercase tracking-wider">Active LoRA Model</span>
              <span className="font-mono text-purple-400">{current.size} • CivitAI {current.civitaiId}</span>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 text-lg flex-shrink-0">
                🎨
              </div>
              <div className="flex-1 truncate">
                <div className="text-sm font-bold text-white truncate">{current.name}</div>
                <div className="text-xs text-slate-400">by {current.creator} • {current.downloads} Downloads</div>
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
                max="1.2"
                step="0.05"
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#a855f7]"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>0.00 (Base Model)</span>
                <span>0.60 (Subtle Blend)</span>
                <span>1.20 (High Influence)</span>
              </div>
            </div>
          </div>

          {/* Trigger Words Pills */}
          <div>
            <div className="text-xs font-semibold text-slate-400 mb-2">Trained Trigger Words (Click to copy):</div>
            <div className="flex flex-wrap gap-2">
              {current.triggers.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleCopyTrigger(tag)}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono bg-[#060815] border border-[#1a1f3c] hover:border-purple-500/40 text-slate-300 hover:text-purple-300 transition-colors flex items-center gap-1.5 cursor-pointer"
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
          <div className="relative rounded-[22px] overflow-hidden border border-[#1e2345] bg-[#05060f] shadow-2xl aspect-[4/3] group">
            <AnimatePresence mode="wait">
              <motion.img
                key={current.id}
                src={current.image}
                alt={current.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={getSimulatedStyle()}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                loading="lazy"
              />
            </AnimatePresence>

            {/* Dynamic Overlay readout */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 pointer-events-none">
              <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-xs font-bold text-white shadow-lg">
                LoRA Weight: <span className="text-purple-400 font-mono">{weight.toFixed(2)}</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#24113e]/85 backdrop-blur-md border border-purple-500/30 text-[10px] text-purple-200">
                {weight < 0.3 ? 'Mild Accent' : weight < 0.8 ? 'Harmonious Style' : 'Maximum Stylization'}
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
