import React from 'react';
import { createPortal } from 'react-dom';
import { X, Image as ImageIcon } from 'lucide-react';
import useWorkspaceStore from '../../store/useWorkspaceStore';
import useAppStore from '../../store/useAppStore';

export default function GalleryPickerModal({ isOpen, onClose, onSelect }) {
  const { generatedAssets } = useWorkspaceStore();
  const { isAdultMode } = useAppStore();

  if (!isOpen) return null;

  // Filter out adult images if adult mode is off, to prevent accidental selection of hidden stuff
  const visibleAssets = generatedAssets.filter(asset => isAdultMode ? true : !asset.isAdult);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-5xl h-[80vh] flex flex-col bg-[var(--surface-0)] rounded-2xl shadow-2xl border border-[var(--border-subtle)] overflow-hidden relative animate-scale-in">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--surface-1)]">
          <div>
            <h2 className="text-[18px] font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <ImageIcon className="w-5 h-5 text-purple-400" />
              Select from Gallery
            </h2>
            <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">
              Choose an image from your generated assets to import.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--surface-2)] text-[var(--text-secondary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {visibleAssets.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-[var(--text-tertiary)]">
              <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
              <p>Your gallery is empty.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {visibleAssets.map(asset => (
                <div 
                  key={asset.id}
                  onClick={() => {
                    onSelect(asset.url);
                    onClose();
                  }}
                  className="aspect-square rounded-xl overflow-hidden cursor-pointer relative group border border-transparent hover:border-[var(--accent)] transition-all bg-[var(--surface-2)]"
                >
                  <img src={asset.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-sm font-medium">
                    Select
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
