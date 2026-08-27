import React from 'react';
import { Layers, Plus } from 'lucide-react';
import ActiveModelBar from '../models/ActiveModelBar';

export default function ModelSelector({
  baseModel,
  loras,
  mode,
  onOpenExplorerBase,
  onOpenExplorerLora,
  onRemoveLora,
  onUpdateLoraWeight,
  onClearLoras,
}) {
  return (
    <div className="space-y-3">
      {/* Base Model Card */}
      {baseModel ? (
        <ActiveModelBar
          baseModel={baseModel}
          loras={mode === 'advanced' ? loras : []}
          onRemoveLora={onRemoveLora}
          onUpdateWeight={onUpdateLoraWeight}
          onClearLoras={onClearLoras}
          onChangeModel={onOpenExplorerBase}
        />
      ) : (
        <button
          onClick={onOpenExplorerBase}
          className="w-full bg-[var(--surface-0)] border border-dashed border-purple-500/30 hover:border-purple-500/80 hover:bg-purple-500/10 flex flex-col items-center justify-center gap-3 py-10 rounded-2xl cursor-pointer transition-all duration-300 group shadow-inner"
        >
          <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Layers className="w-6 h-6 text-purple-400" />
          </div>
          <span className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">
            Select a Base Model
          </span>
        </button>
      )}

      {/* Add LoRA Button — Advanced */}
      {mode === 'advanced' && baseModel && (
        <button
          onClick={onOpenExplorerLora}
          className="btn btn-ghost w-full text-[12px]"
        >
          <Plus className="w-3.5 h-3.5" />
          Browse & Add LoRAs
        </button>
      )}
    </div>
  );
}
