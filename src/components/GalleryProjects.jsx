import React, { useState } from 'react';
import { Folder, Image as ImageIcon, Lock, Download, Trash2, Eye, ShieldAlert } from 'lucide-react';

export default function GalleryProjects({
  generatedAssets,
  isAdultMode,
  isVerifiedAdult
}) {
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'adult_vault'

  const filteredAssets = generatedAssets.filter(asset => 
    activeTab === 'adult_vault' ? asset.isAdult : !asset.isAdult
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-display flex items-center space-x-2">
            <Folder className="w-6 h-6 text-indigo-400" />
            <span>Projects & Asset Vault</span>
          </h1>
          <p className="text-xs text-slate-400">Isolated project partitions and encrypted asset storage.</p>
        </div>

        {/* Gallery Vault Filter */}
        <div className="flex bg-slate-900/80 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'general' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            General Gallery
          </button>
          <button
            onClick={() => setActiveTab('adult_vault')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all ${
              activeTab === 'adult_vault' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Adult 18+ Private Vault</span>
          </button>
        </div>
      </div>

      {/* Vault Guard check if trying to view Adult Vault unverified */}
      {activeTab === 'adult_vault' && !isVerifiedAdult ? (
        <div className="glass-panel-adult rounded-3xl p-12 text-center space-y-4 max-w-xl mx-auto">
          <Lock className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Adult Vault Partition Locked</h2>
          <p className="text-xs text-rose-200">
            Per PRD Section 4.5 safety rules, adult content assets are stored in an isolated, encrypted partition. Complete identity verification to unlock.
          </p>
        </div>
      ) : (
        <div>
          {filteredAssets.length === 0 ? (
            <div className="border border-white/10 rounded-2xl p-12 text-center text-slate-400 text-sm">
              No assets stored in this gallery partition.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredAssets.map(asset => (
                <div key={asset.id} className="glass-panel rounded-2xl overflow-hidden group">
                  <div className="aspect-square bg-slate-950 overflow-hidden relative">
                    <img src={asset.url} alt={asset.prompt} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                      <a
                        href={asset.url}
                        download={`omnigen-${asset.id}.png`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-indigo-600 rounded-lg text-white"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                  <div className="p-3 space-y-1">
                    <div className="font-bold text-xs text-slate-200 truncate">{asset.prompt}</div>
                    <div className="text-[10px] text-slate-400 flex justify-between">
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

    </div>
  );
}
