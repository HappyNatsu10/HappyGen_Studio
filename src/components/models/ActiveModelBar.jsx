import React, { useEffect } from 'react';
import { Layers, X, RefreshCw, Sliders, Sparkles, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Tooltip from '../common/Tooltip';
import useModelStore from '../../store/useModelStore';
import { getModelById, searchModels } from '../../services/civitaiService';

export default function ActiveModelBar({
  baseModel,
  loras = [],
  embeddings = [],
  onChangeModel,
  onRemoveLora,
  onUpdateWeight,
  onClearLoras,
  onRemoveEmbedding,
  onClearEmbeddings,
}) {
  const { t } = useTranslation();

  // Automatically fetch thumbnails for any LoRAs that don't have an image saved yet
  useEffect(() => {
    if (!loras || loras.length === 0) return;
    let cancelled = false;

    const enrichMissingThumbnails = async () => {
      let updated = false;
      const copy = [...loras];

      for (let i = 0; i < copy.length; i++) {
        const item = copy[i];
        const existingThumb = item.thumbnailUrl || item.imageUrl || item.version?.imageUrl;
        if (!existingThumb) {
          try {
            let foundThumb = null;
            if (item.id && (typeof item.id === 'number' || !isNaN(Number(item.id)))) {
              const res = await getModelById(item.id);
              foundThumb = res?.thumbnailUrl || res?.version?.imageUrl;
            }
            if (!foundThumb && item.name) {
              const searchRes = await searchModels({ query: item.name, type: 'LORA', limit: 1 });
              if (searchRes?.items?.[0]?.thumbnailUrl) {
                foundThumb = searchRes.items[0].thumbnailUrl;
              }
            }

            if (foundThumb && !cancelled) {
              copy[i] = { ...item, thumbnailUrl: foundThumb };
              updated = true;
            }
          } catch (e) {
            // Silently ignore network failures
          }
        }
      }

      if (updated && !cancelled) {
        localStorage.setItem('omnigen_active_loras', JSON.stringify(copy));
        useModelStore.setState({ loras: copy });
      }
    };

    enrichMissingThumbnails();
    return () => { cancelled = true; };
  }, [loras.length]);

  if (!baseModel) return null;

  const thumbnail = baseModel.thumbnailUrl || baseModel.version?.imageUrl;
  const baseArch = baseModel.version?.baseModel || baseModel.baseModel || baseModel.type || 'SDXL';

  return (
    <div className="space-y-3">
      {/* Base Model Header with Tooltip */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-purple-400" />
          {t('model.baseModel', 'Base Model')}
          <Tooltip text={t('model.baseTooltip', 'The core AI brain that determines the overall style and capabilities of the generation.')}>
            <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-purple-400 cursor-help transition-colors" />
          </Tooltip>
        </span>
      </div>

      {/* Active Base Model Card */}
      <div 
        className="card card-interactive p-3 flex items-center justify-between gap-3 group relative"
        style={{ background: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={baseModel.name}
              className="w-12 h-12 rounded-xl object-cover flex-shrink-0 shadow-md border border-[var(--border-subtle)]"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0 border border-purple-500/20">
              <Layers className="w-6 h-6 text-purple-400" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="badge badge-warning text-[10px] px-1.5 py-0.5 leading-none">
                {baseArch.replace('SDXL 1.0', 'SDXL').replace('SD 1.5', 'SD1.5')}
              </span>
              <span className="text-[10px] text-[var(--text-tertiary)] truncate">
                {baseModel.creator ? `by ${baseModel.creator}` : 'Base Model'}
              </span>
              <Tooltip text={t('model.baseTooltip', 'The core AI brain that determines the overall style and capabilities of the generation.')}>
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-purple-400 cursor-help transition-colors" />
              </Tooltip>
            </div>
            <h4 className="text-[13px] font-semibold text-[var(--text-primary)] truncate mt-0.5" title={baseModel.name}>
              {baseModel.name}
            </h4>
          </div>
        </div>

        {onChangeModel && (
          <button
            onClick={onChangeModel}
            className="btn btn-secondary px-2.5 py-1.5 text-xs flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex-shrink-0"
            title={t('model.change', 'Change Model')}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('common.change', 'Change')}</span>
          </button>
        )}
      </div>

      {/* Active LoRAs */}
      {loras && loras.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-purple-400" />
              {t('model.activeLoras', 'Active LoRAs')} ({loras.length})
            </span>
            {onClearLoras && (
              <button
                onClick={onClearLoras}
                className="text-[10px] text-red-400 hover:text-red-300 transition-colors"
              >
                {t('common.clearAll', 'Clear All')}
              </button>
            )}
          </div>

          <div className="space-y-2">
            {loras.map((lora, idx) => {
              const loraId = lora.id || lora.fileName || lora.name;
              const weight = typeof lora.weight === 'number' ? lora.weight : 0.8;
              const thumb = lora.thumbnailUrl || lora.imageUrl || lora.version?.imageUrl || (lora.images && lora.images[0]?.url) || (lora.version?.images && lora.version.images[0]?.url);

              return (
                <div
                  key={loraId || idx}
                  className="card p-2.5 flex items-center gap-3 bg-[var(--surface-0)] border border-[var(--border-subtle)] rounded-xl group relative overflow-hidden"
                >
                  {/* LoRA Image Thumbnail */}
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-[var(--surface-2)] border border-[var(--border-subtle)] relative shadow-sm">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={lora.name || 'LoRA'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full flex items-center justify-center bg-purple-500/10 text-purple-400 ${thumb ? 'hidden' : ''}`}>
                      <Sliders className="w-5 h-5" />
                    </div>
                  </div>

                  {/* LoRA Info & Weight Slider */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[12px] font-semibold text-[var(--text-primary)] truncate" title={lora.name || lora.fileName}>
                        {lora.name || lora.fileName}
                      </span>
                      <span className="text-[11px] font-mono text-purple-400 font-bold flex-shrink-0">
                        {weight.toFixed(2)}
                      </span>
                    </div>

                    <input
                      type="range"
                      min="-1"
                      max="2"
                      step="0.05"
                      value={weight}
                      onChange={(e) => onUpdateWeight?.(loraId, parseFloat(e.target.value))}
                      className="w-full accent-purple-500 h-1.5 bg-[var(--surface-2)] rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Remove Button */}
                  {onRemoveLora && (
                    <button
                      onClick={() => onRemoveLora(loraId)}
                      className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0 self-center"
                      title={t('common.remove', 'Remove')}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Embeddings */}
      {embeddings && embeddings.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              {t('model.activeEmbeddings', 'Active Embeddings')} ({embeddings.length})
            </span>
            {onClearEmbeddings && (
              <button
                onClick={onClearEmbeddings}
                className="text-[10px] text-red-400 hover:text-red-300 transition-colors"
              >
                {t('common.clearAll', 'Clear All')}
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {embeddings.map((emb, idx) => {
              const embId = emb.id || emb.fileName || emb.name;
              return (
                <div
                  key={embId || idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--surface-1)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-primary)]"
                >
                  <span className="truncate max-w-[150px]">{emb.name || emb.fileName}</span>
                  {onRemoveEmbedding && (
                    <button
                      onClick={() => onRemoveEmbedding(embId)}
                      className="text-[var(--text-tertiary)] hover:text-red-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
