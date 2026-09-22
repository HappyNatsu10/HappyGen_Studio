import React from 'react';
import { Layers, Plus, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ActiveModelBar from '../models/ActiveModelBar';
import Tooltip from '../common/Tooltip';

export default function ModelSelector({
  baseModel,
  loras,
  embeddings = [],
  onOpenExplorerBase,
  onOpenExplorerLora,
  onOpenExplorerEmbedding,
  onRemoveLora,
  onUpdateLoraWeight,
  onClearLoras,
  onRemoveEmbedding,
  onClearEmbeddings,
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      {/* Base Model Card */}
      {baseModel ? (
        <ActiveModelBar
          baseModel={baseModel}
          loras={loras}
          embeddings={embeddings}
          onRemoveLora={onRemoveLora}
          onUpdateWeight={onUpdateLoraWeight}
          onClearLoras={onClearLoras}
          onChangeModel={onOpenExplorerBase}
          onRemoveEmbedding={onRemoveEmbedding}
          onClearEmbeddings={onClearEmbeddings}
        />
      ) : (
        <button
          onClick={onOpenExplorerBase}
          className="w-full bg-[var(--surface-0)] border border-dashed border-purple-500/30 hover:border-purple-500/80 hover:bg-purple-500/10 flex flex-col items-center justify-center gap-3 py-10 rounded-2xl cursor-pointer transition-all duration-300 group shadow-inner"
        >
          <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Layers className="w-6 h-6 text-purple-400" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm font-semibold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5">
              {t('model.selectBase', 'Select a Base Model')}
              <Tooltip text={t('model.baseTooltip', 'The core AI brain that determines the overall style and capabilities of the generation.')}>
                <HelpCircle className="w-4 h-4 text-slate-500 cursor-help" />
              </Tooltip>
            </span>
          </div>
        </button>
      )}

      {/* Add LoRA/Embedding Buttons */}
      {baseModel && (
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenExplorerLora}
            className="btn btn-ghost flex-1 text-[12px] flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            {t('model.addLora', 'Add LoRA')}
          </button>
          
          <button
            onClick={onOpenExplorerEmbedding}
            className="btn btn-ghost flex-1 text-[12px] flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            {t('model.addEmbedding', 'Add Embedding')}
          </button>
          
          <Tooltip position="right" text={t('model.modifierTooltip', 'Modifiers that sit on top of the base model. LoRAs add visual styles/characters. Embeddings (Textual Inversions) add custom words to the vocabulary.')}>
            <HelpCircle className="w-4 h-4 text-slate-500 cursor-help flex-shrink-0 mr-1" />
          </Tooltip>
        </div>
      )}
    </div>
  );
}
