import React, { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';

export default function FolderSelectModal({ model, folders, onClose, onConfirm, onCreateFolder }) {
  const [selectedFolder, setSelectedFolder] = useState('Uncategorized');
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isCreating) {
      const name = newFolderName.trim();
      if (name) {
        onCreateFolder(name);
        onConfirm(name);
      }
    } else {
      onConfirm(selectedFolder);
    }
  };

  if (!model) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overlay-enter" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm rounded-xl border modal-enter overflow-hidden" style={{ background: 'var(--surface-1)', borderColor: 'var(--border-subtle)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
          <h3 className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>Save to Favourites</h3>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-white/10 transition-colors">
            <X className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex gap-3 mb-5">
            <div className="w-12 h-16 rounded overflow-hidden flex-shrink-0" style={{ background: 'var(--surface-2)' }}>
              {model.thumbnailUrl ? (
                <img src={model.thumbnailUrl} alt={model.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl">
                  {model.type === 'Checkpoint' ? '🧠' : '🎨'}
                </div>
              )}
            </div>
            <div>
              <h4 className="text-[13px] font-medium line-clamp-1" style={{ color: 'var(--text-primary)' }}>{model.name}</h4>
              <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>by {model.creator}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <label className="text-[11px] font-medium block mb-2" style={{ color: 'var(--text-secondary)' }}>
              Choose a folder:
            </label>
            
            {isCreating ? (
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="text"
                  autoFocus
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  placeholder="Folder name..."
                  className="input flex-1 text-xs py-2 px-3"
                />
                <button type="button" onClick={() => setIsCreating(false)} className="btn btn-secondary py-2 px-3 text-xs">
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-4">
                <select
                  value={selectedFolder}
                  onChange={e => setSelectedFolder(e.target.value)}
                  className="input flex-1 text-xs py-2 px-3"
                >
                  <option value="Uncategorized">Uncategorized</option>
                  {folders.filter(f => f !== 'Uncategorized').map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setIsCreating(true)}
                  className="btn btn-secondary py-2 px-3 flex items-center gap-1 text-xs"
                  title="Create new folder"
                >
                  <FolderPlus className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={onClose} className="btn btn-secondary py-1.5 px-4 text-xs">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary py-1.5 px-4 text-xs" disabled={isCreating && !newFolderName.trim()}>
                Save to Favourites
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
