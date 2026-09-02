import React, { useState } from 'react';
import { X, Download, ThumbsUp, Copy, Check, ExternalLink, Heart, FolderPlus } from 'lucide-react';
import { formatCount } from '../../services/civitaiService';
import { useFavouriteModels } from '../../hooks/useFavouriteModels';

export default function ModelDetailDrawer({ model, onClose, onSelectAsBase, onAddLora, onAddEmbedding, isFav, onToggleFav }) {
  const [selectedVersionIdx, setSelectedVersionIdx] = useState(0);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [copiedWord, setCopiedWord] = useState(null);
  
  const { folders, moveModelToFolder, favourites } = useFavouriteModels();
  const currentFav = favourites.find(m => m.id === model.id);

  if (!model) return null;

  const version = model.versions?.[selectedVersionIdx] || model.version;
  const triggerWords = version?.trainedWords || [];

  const handleCopyWord = (word) => {
    navigator.clipboard.writeText(word);
    setCopiedWord(word);
    setTimeout(() => setCopiedWord(null), 1500);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 overlay-enter"
        style={{ background: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 bottom-0 z-50 flex flex-col drawer-enter overflow-hidden"
        style={{
          width: 'min(440px, 90vw)',
          backgroundColor: 'var(--surface-1)',
          borderLeft: '1px solid var(--border-subtle)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-14 border-b flex-shrink-0"
          style={{ borderColor: 'var(--border-subtle)' }}>
          <h2 className="text-[14px] font-semibold truncate pr-4 flex-1" style={{ color: 'var(--text-primary)' }}>
            {model.name}
          </h2>
          <div className="flex items-center gap-1">
            {isFav && (
              <select
                value={currentFav?.folder || 'Uncategorized'}
                onChange={e => moveModelToFolder(model.id, e.target.value)}
                className="input text-[10px] py-1 px-1.5 h-7 bg-transparent border-transparent hover:bg-white/5 max-w-[100px]"
                title="Move to Folder"
              >
                {folders.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            )}
            <button onClick={onToggleFav} className="btn-ghost p-1.5 rounded-md cursor-pointer" title={isFav ? "Remove from Favourites" : "Save to Favourites"}>
              <Heart className={`w-4 h-4 ${isFav ? 'fill-pink-500 text-pink-500' : 'text-slate-400'}`} />
            </button>
            <button onClick={onClose} className="btn-ghost p-1.5 rounded-md cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Preview Image */}
          {(version?.images?.length > 0 || model.previewUrl) && (
            <div className="px-5 pt-4">
              <div className="rounded-lg overflow-hidden flex items-center justify-center bg-black" style={{ minHeight: '300px' }}>
                <img
                  src={version?.images?.[selectedImageIdx]?.url || model.previewUrl}
                  alt={model.name}
                  className="w-full max-h-[400px] object-contain"
                />
              </div>
              {/* Image thumbnails */}
              {version?.images?.length > 1 && (
                <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1 custom-scrollbar">
                  {version.images.map((img, i) => (
                    <img
                      key={i}
                      src={img.url}
                      alt=""
                      onClick={() => setSelectedImageIdx(i)}
                      className={`w-14 h-14 rounded object-cover flex-shrink-0 cursor-pointer transition-opacity ${selectedImageIdx === i ? 'border-2 border-[var(--primary)] opacity-100' : 'opacity-50 hover:opacity-100'}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="px-5 py-4 space-y-4">
            {/* Meta */}
            <div className="flex items-center gap-4 flex-wrap">
              <span className={`badge ${model.type === 'Checkpoint' ? 'badge-warning' : ''}`}>
                {model.type === 'LORA' ? 'LoRA' : (model.type === 'TextualInversion' ? 'Embedding' : model.type)}
              </span>
              {version?.baseModel && (
                <span className="badge badge-neutral">{version.baseModel}</span>
              )}
              <span className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                <Download className="w-3 h-3" />
                {formatCount(model.stats.downloads)}
              </span>
              <span className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                <ThumbsUp className="w-3 h-3" />
                {model.stats.rating}% positive
              </span>
            </div>

            {/* Creator */}
            <div className="flex items-center gap-2">
              <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>by</span>
              <span className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                {model.creator}
              </span>
              <a
                href={`https://civitai.com/models/${model.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto flex items-center gap-1 text-[11px] font-medium"
                style={{ color: 'var(--text-accent)' }}
              >
                View on CivitAI <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Version Selector */}
            {model.versions?.length > 1 && (
              <div>
                <label className="text-[11px] font-medium block mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
                  Version
                </label>
                <select
                  value={selectedVersionIdx}
                  onChange={e => {
                    setSelectedVersionIdx(Number(e.target.value));
                    setSelectedImageIdx(0); // Reset image index when version changes
                  }}
                  className="input w-full text-xs"
                >
                  {model.versions.map((v, i) => (
                    <option key={v.id} value={i}>
                      {v.name} — {v.baseModel} {v.fileSize ? `(${v.fileSize} MB)` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Trigger Words */}
            {triggerWords.length > 0 && (
              <div>
                <label className="text-[11px] font-medium block mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
                  Trigger Words
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {triggerWords.map((word, i) => (
                    <button
                      key={i}
                      onClick={() => handleCopyWord(word)}
                      className="chip text-[11px] gap-1"
                    >
                      {word.length > 40 ? word.slice(0, 40) + '…' : word}
                      {copiedWord === word ? <Check className="w-3 h-3" style={{ color: 'var(--success)' }} /> : <Copy className="w-3 h-3 opacity-40" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* File Info */}
            {version?.fileSize && (
              <div className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                File: {version.fileName || 'model.safetensors'} • {version.fileSize} MB
              </div>
            )}

            {/* Description */}
            {model.description && (
              <div>
                <label className="text-[11px] font-medium block mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
                  Description
                </label>
                <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {model.description.length > 500 ? model.description.slice(0, 500) + '…' : model.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="px-5 py-3 border-t flex gap-2 flex-shrink-0" style={{ borderColor: 'var(--border-subtle)' }}>
          {model.type === 'Checkpoint' ? (
            <button
              onClick={() => onSelectAsBase({
                ...model,
                selectedVersion: version,
              })}
              className="btn btn-primary flex-1"
            >
              Use as Base Model
            </button>
          ) : model.type === 'TextualInversion' ? (
            <button
              onClick={() => onAddEmbedding({
                id: model.id,
                versionId: version?.id,
                name: model.name,
                triggerWords: version?.trainedWords || [],
                thumbnailUrl: model.thumbnailUrl,
                baseModel: version?.baseModel,
                downloadUrl: version?.downloadUrl,
                fileName: version?.fileName,
              })}
              className="btn btn-primary flex-1 bg-blue-500 hover:bg-blue-600 border-none"
            >
              Add Embedding
            </button>
          ) : (
            <button
              onClick={() => onAddLora({
                id: model.id,
                versionId: version?.id,
                name: model.name,
                weight: 0.8,
                triggerWords: version?.trainedWords || [],
                thumbnailUrl: model.thumbnailUrl,
                baseModel: version?.baseModel,
                downloadUrl: version?.downloadUrl,
                fileName: version?.fileName,
              })}
              className="btn btn-primary flex-1"
            >
              Add to LoRA Stack
            </button>
          )}
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
