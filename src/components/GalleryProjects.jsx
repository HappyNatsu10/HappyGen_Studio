import React, { useState } from 'react';
import { Folder, Image as ImageIcon, Lock, Download, Trash2, Eye, ShieldAlert, Maximize2, Brush } from 'lucide-react';
import ImageViewerModal from './common/ImageViewerModal';
import useAppStore from '../store/useAppStore';
import useWorkspaceStore from '../store/useWorkspaceStore';

export default function GalleryProjects() {
  const { isAdultMode } = useAppStore();
  const { generatedAssets } = useWorkspaceStore();
  const isVerifiedAdult = true; // Placeholder for future auth integration
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'adult_vault'
  const [activeViewerImage, setActiveViewerImage] = useState(null);

  const filteredAssets = generatedAssets.filter(asset => 
    activeTab === 'adult_vault' ? asset.isAdult : !asset.isAdult
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 md:pb-0">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div>
          <h1 className="text-[18px] font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Folder className="w-5 h-5" style={{ color: 'var(--text-accent)' }} />
            Projects & Asset Vault
          </h1>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Isolated project partitions and encrypted asset storage.</p>
        </div>

        {/* Gallery Vault Filter */}
        <div className="mode-toggle">
          <button
            onClick={() => setActiveTab('general')}
            className={`mode-toggle-option ${activeTab === 'general' ? 'active' : ''}`}
          >
            General Gallery
          </button>
          <button
            onClick={() => setActiveTab('adult_vault')}
            className={`mode-toggle-option flex items-center gap-1 ${activeTab === 'adult_vault' ? 'active' : ''}`}
          >
            <Lock className="w-3.5 h-3.5" />
            Adult 18+ Private Vault
          </button>
        </div>
      </div>

      {/* Vault Guard check if trying to view Adult Vault unverified */}
      {activeTab === 'adult_vault' && !isVerifiedAdult ? (
        <div className="glass-panel-adult rounded-2xl p-12 text-center space-y-4 max-w-xl mx-auto">
          <Lock className="w-12 h-12 mx-auto" style={{ color: 'var(--error)' }} />
          <h2 className="text-[16px] font-semibold" style={{ color: 'var(--text-primary)' }}>Adult Vault Partition Locked</h2>
          <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
            Per PRD Section 4.5 safety rules, adult content assets are stored in an isolated, encrypted partition. Complete identity verification to unlock.
          </p>
        </div>
      ) : (
        <div>
          {filteredAssets.length === 0 ? (
            <div className="card p-12 text-center text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
              No assets stored in this gallery partition.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredAssets.map(asset => (
                <div 
                  key={asset.id} 
                  className="card card-interactive overflow-hidden group cursor-pointer"
                  onClick={() => setActiveViewerImage(asset)}
                >
                  <div className="aspect-square overflow-hidden relative img-overlay" style={{ background: 'var(--surface-2)' }}>
                    <img src={asset.url} alt={asset.prompt} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2" style={{ background: 'rgba(0,0,0,0.6)' }}>
                      <button 
                        className="btn btn-primary p-2"
                        title="View Fullscreen"
                        onClick={(e) => { e.stopPropagation(); setActiveViewerImage(asset); }}
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                      <button 
                        className="btn btn-secondary p-2 bg-white/20 hover:bg-white/40 text-white"
                        title="Send to Inpaint Studio"
                        onClick={(e) => {
                          e.stopPropagation();
                          useWorkspaceStore.getState().setInpaintSourceImage(asset.url);
                          useAppStore.getState().setActiveTab('inpaint');
                        }}
                      >
                        <Brush className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-3 space-y-1">
                    <div className="font-medium text-[12px] truncate" style={{ color: 'var(--text-primary)' }}>{asset.prompt}</div>
                    <div className="text-[10px] flex justify-between" style={{ color: 'var(--text-tertiary)' }}>
                      <span>{asset.style}</span>
                      <span>{asset.width}x{asset.height}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Image Viewer Modal */}
      <ImageViewerModal
        image={activeViewerImage}
        isOpen={!!activeViewerImage}
        onClose={() => setActiveViewerImage(null)}
      />

    </div>
  );
}
