import React, { useState, useEffect, useCallback } from 'react';
import { Search, Download, ThumbsUp, Filter, X, Loader2, Heart, Clock } from 'lucide-react';
import { searchModels, formatCount } from '../../services/civitaiService';
import ModelDetailDrawer from './ModelDetailDrawer';
import FolderSelectModal from './FolderSelectModal';
import { useFavouriteModels } from '../../hooks/useFavouriteModels';
import useAppStore from '../../store/useAppStore';
import useModelStore from '../../store/useModelStore';

const BASE_MODEL_FILTERS = ['All', 'Pony', 'SDXL 1.0', 'Illustrious', 'SD 1.5', 'Flux.1 D'];
const TYPE_FILTERS = ['All', 'Checkpoint', 'LORA', 'TextualInversion'];
const SORT_OPTIONS = ['Most Downloaded', 'Highest Rated', 'Newest'];
const STYLE_TAGS = ['anime', 'realistic', 'photorealistic', '3d', 'cartoon', 'illustration', 'painting', 'sketch', 'vintage'];
const STYLE_FILTERS = ['All', 'Anime', 'Realistic', 'Photorealistic', '3D', 'Cartoon', 'Illustration'];

export default function ModelExplorer(props) {
  const storeIsAdultMode = useAppStore(state => state.isAdultMode);
  const { setBaseModel: storeSetBaseModel, addLora: storeAddLora } = useModelStore();

  const {
    onSelectBaseModel = (model) => storeSetBaseModel({ id: model.id, name: model.name, thumbnailUrl: model.thumbnailUrl, version: model.selectedVersion || model.version }),
    onAddLora = storeAddLora,
    isAdultMode = storeIsAdultMode,
    isModal = false,
    forcedBaseModel = null,
    forcedType = null
  } = props;
  const [activeTab, setActiveTab] = useState('Search'); // 'Search' | 'Favourites' | 'Recent'
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState(forcedType || 'All');
  const [baseModelFilter, setBaseModelFilter] = useState(forcedBaseModel && forcedBaseModel !== 'All' ? forcedBaseModel : 'All');
  const [styleFilter, setStyleFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Most Downloaded');
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);

  const [favSortBy, setFavSortBy] = useState('Date Added');
  const [activeFolder, setActiveFolder] = useState('All');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolder, setEditingFolder] = useState(null);
  const [editFolderName, setEditFolderName] = useState('');
  const [favModalModel, setFavModalModel] = useState(null);

  const { favourites, folders, toggleFavourite, isFavourited, createFolder, renameFolder, deleteFolder, addFavourite, removeFavourite } = useFavouriteModels();

  const handleFavouriteClick = useCallback((model, e) => {
    if (e) e.stopPropagation();
    if (isFavourited(model.id)) {
      removeFavourite(model.id);
    } else {
      setFavModalModel(model);
    }
  }, [isFavourited, removeFavourite]);

  const doSearch = useCallback(async (append = false) => {
    if (activeTab !== 'Search') return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await searchModels({
        query: query.trim() || undefined,
        type: typeFilter !== 'All' ? typeFilter : undefined,
        baseModel: baseModelFilter !== 'All' ? baseModelFilter : undefined,
        tag: styleFilter !== 'All' ? styleFilter.toLowerCase() : undefined,
        sort: sortBy,
        nsfw: isAdultMode || false,
        limit: 20,
        cursor: append ? cursor : undefined,
      });

      if (append) {
        setResults(prev => [...prev, ...data.items]);
      } else {
        setResults(data.items);
      }
      setCursor(data.metadata?.nextCursor || null);
      setHasMore(!!data.metadata?.nextCursor);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [query, typeFilter, baseModelFilter, styleFilter, sortBy, isAdultMode, cursor, activeTab]);

  // Initial load + filter changes
  useEffect(() => {
    if (activeTab === 'Search') {
      const timeout = setTimeout(() => doSearch(false), query ? 400 : 0);
      return () => clearTimeout(timeout);
    }
  }, [query, typeFilter, baseModelFilter, styleFilter, sortBy, isAdultMode, activeTab]);

  useEffect(() => {
    if (forcedBaseModel && forcedBaseModel !== 'All') {
      setBaseModelFilter(forcedBaseModel);
    }
  }, [forcedBaseModel]);

  useEffect(() => {
    if (forcedType) {
      setTypeFilter(forcedType);
    }
  }, [forcedType]);

  // Handle Tab changes
  let displayResults = activeTab === 'Search' ? results : favourites;

  if (activeTab === 'Favourites') {
    // Filter by folder
    if (activeFolder !== 'All') {
      displayResults = displayResults.filter(m => m.folder === activeFolder);
    }
    // Filter by query (local search)
    if (query.trim()) {
      const q = query.toLowerCase();
      displayResults = displayResults.filter(m => m.name.toLowerCase().includes(q) || m.creator.toLowerCase().includes(q));
    }
    // Sort
    displayResults = [...displayResults].sort((a, b) => {
      if (favSortBy === 'Name (A-Z)') return a.name.localeCompare(b.name);
      if (favSortBy === 'Most Downloaded') return (b.stats?.downloads || 0) - (a.stats?.downloads || 0);
      return (b.addedAt || 0) - (a.addedAt || 0); // Date Added (default)
    });
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Search & Tabs */}
      <div className="px-5 pt-4 pb-3 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search models & LoRAs on CivitAI..."
              className="input w-full pl-10 pr-10"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                style={{ color: 'var(--text-tertiary)' }}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="mode-toggle">
            <button
              onClick={() => setActiveTab('Search')}
              className={`mode-toggle-option ${activeTab === 'Search' ? 'active' : ''}`}
            >
              Search
            </button>
            <button
              onClick={() => setActiveTab('Favourites')}
              className={`mode-toggle-option ${activeTab === 'Favourites' ? 'active' : ''}`}
            >
              <Heart className="inline w-3 h-3 mr-1" /> Favourites
            </button>
          </div>
        </div>

        {/* Filters (only for Search) */}
        {activeTab === 'Search' && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[11px] font-medium mr-1" style={{ color: 'var(--text-tertiary)' }}>
                <Filter className="inline w-3 h-3 mr-1" />Type:
              </span>
              {TYPE_FILTERS.map(t => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`chip ${typeFilter === t ? 'active' : ''}`}
                  disabled={!!forcedType}
                  style={{ opacity: forcedType && typeFilter !== t ? 0.5 : 1, cursor: forcedType ? 'not-allowed' : 'pointer' }}
                >
                  {t === 'LORA' ? 'LoRA' : (t === 'TextualInversion' ? 'Embedding' : t)}
                </button>
              ))}

              {!forcedBaseModel && (
                <>
                  <span className="text-[11px] font-medium ml-3 mr-1" style={{ color: 'var(--text-tertiary)' }}>Base:</span>
                  {BASE_MODEL_FILTERS.map(b => (
                    <button
                      key={b}
                      onClick={() => setBaseModelFilter(b)}
                      className={`chip ${baseModelFilter === b ? 'active' : ''}`}
                    >
                      {b}
                    </button>
                  ))}
                </>
              )}
              {forcedBaseModel && forcedBaseModel !== 'All' && (
                <>
                  <span className="text-[11px] font-medium ml-3 mr-1" style={{ color: 'var(--text-tertiary)' }}>Base:</span>
                  <button className="chip active flex items-center gap-1 opacity-80 cursor-not-allowed" disabled>
                    {forcedBaseModel}
                  </button>
                </>
              )}

              <div className="ml-auto flex items-center gap-2">
                <span className="text-[11px] font-medium" style={{ color: 'var(--text-tertiary)' }}>Sort:</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="input text-xs py-1.5 px-2"
                  style={{ minWidth: 140 }}
                >
                  {SORT_OPTIONS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 items-center pb-2 border-b border-white/5">
              <span className="text-[11px] font-medium mr-1" style={{ color: 'var(--text-tertiary)' }}>
                Style:
              </span>
              {STYLE_FILTERS.map(s => (
                <button
                  key={s}
                  onClick={() => setStyleFilter(s)}
                  className={`chip ${styleFilter === s ? 'active' : ''}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Favourites Controls */}
        {activeTab === 'Favourites' && (
          <div className="flex flex-col gap-3 pb-2 border-b border-white/5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              {/* Folders */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-[11px] font-medium mr-1" style={{ color: 'var(--text-tertiary)' }}>
                  Folder:
                </span>
                {['All', ...folders].map(f => {
                  const isCustom = f !== 'All' && f !== 'Uncategorized';
                  const isActive = activeFolder === f;
                  
                  if (editingFolder === f) {
                    return (
                      <form
                        key={f}
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (editFolderName.trim() && editFolderName.trim() !== f) {
                            renameFolder(f, editFolderName.trim());
                            setActiveFolder(editFolderName.trim());
                          }
                          setEditingFolder(null);
                        }}
                        className="flex items-center gap-1"
                      >
                        <input
                          type="text"
                          autoFocus
                          value={editFolderName}
                          onChange={e => setEditFolderName(e.target.value)}
                          className="input text-[11px] py-1 px-2 h-7 w-28"
                          onBlur={() => setEditingFolder(null)}
                        />
                      </form>
                    );
                  }

                  return (
                    <div key={f} className="flex items-center">
                      <button
                        onClick={() => setActiveFolder(f)}
                        className={`chip ${isActive ? 'active' : ''} ${isCustom && isActive ? 'rounded-r-none pr-1.5' : ''}`}
                      >
                        {f}
                      </button>
                      {isCustom && isActive && (
                        <div className="flex items-center h-7 bg-[var(--surface-2)] rounded-r-full border border-l-0 border-white/10 pr-1.5">
                          <button
                            onClick={() => {
                              setEditFolderName(f);
                              setEditingFolder(f);
                            }}
                            className="p-1 hover:text-white text-white/50 cursor-pointer"
                            title="Rename Folder"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete folder "${f}"? Models inside will be moved to Uncategorized.`)) {
                                deleteFolder(f);
                                setActiveFolder('All');
                              }
                            }}
                            className="p-1 hover:text-red-400 text-white/50 cursor-pointer"
                            title="Delete Folder"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
                {isCreatingFolder ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (newFolderName.trim()) {
                        createFolder(newFolderName);
                        setActiveFolder(newFolderName.trim());
                      }
                      setIsCreatingFolder(false);
                      setNewFolderName('');
                    }}
                    className="flex items-center gap-1"
                  >
                    <input
                      type="text"
                      autoFocus
                      value={newFolderName}
                      onChange={e => setNewFolderName(e.target.value)}
                      placeholder="Folder name..."
                      className="input text-[11px] py-1 px-2 h-7 w-28"
                      onBlur={() => setIsCreatingFolder(false)}
                    />
                  </form>
                ) : (
                  <button
                    onClick={() => setIsCreatingFolder(true)}
                    className="chip opacity-60 hover:opacity-100"
                  >
                    + New
                  </button>
                )}
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium" style={{ color: 'var(--text-tertiary)' }}>Sort:</span>
                <select
                  value={favSortBy}
                  onChange={e => setFavSortBy(e.target.value)}
                  className="input text-xs py-1.5 px-2"
                  style={{ minWidth: 140 }}
                >
                  <option value="Date Added">Date Added</option>
                  <option value="Name (A-Z)">Name (A-Z)</option>
                  <option value="Most Downloaded">Most Downloaded</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Grid */}
      <div className="flex-1 overflow-y-auto px-5 pb-5">
        {error && (
          <div className="rounded-lg p-4 text-sm" style={{ background: 'rgba(248,113,113,0.1)', color: 'var(--error)' }}>
            {error}
          </div>
        )}

        {/* The Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {displayResults.map(model => (
            <ModelCard
              key={model.id}
              model={model}
              onClick={() => setSelectedModel(model)}
              isFav={isFavourited(model.id)}
              onToggleFav={(e) => handleFavouriteClick(model, e)}
            />
          ))}

          {loading && activeTab === 'Search' && Array.from({ length: 8 }).map((_, i) => (
            <div key={`skel-${i}`} className="skeleton" style={{ aspectRatio: '3/4' }} />
          ))}
        </div>

        {/* Load More */}
        {hasMore && !loading && activeTab === 'Search' && (
          <div className="flex justify-center pt-6">
            <button
              onClick={() => doSearch(true)}
              className="btn btn-secondary"
            >
              Load More
            </button>
          </div>
        )}

        {/* Empty States */}
        {!loading && activeTab === 'Search' && results.length === 0 && !error && (
          <div className="text-center py-16" style={{ color: 'var(--text-tertiary)' }}>
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--surface-2)' }}>
              <Search className="w-6 h-6 opacity-50" />
            </div>
            <p className="text-[14px] font-medium" style={{ color: 'var(--text-secondary)' }}>Search for models on CivitAI</p>
            <p className="text-[12px] mt-1">Try "anime", "realistic", or a character name</p>
          </div>
        )}

        {activeTab === 'Favourites' && displayResults.length === 0 && (
          <div className="text-center py-16" style={{ color: 'var(--text-tertiary)' }}>
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--surface-2)' }}>
              <Heart className="w-6 h-6 opacity-50 text-pink-500" />
            </div>
            <p className="text-[14px] font-medium" style={{ color: 'var(--text-secondary)' }}>No favourite models yet</p>
            <p className="text-[12px] mt-1">Click the heart icon on any model to save it here</p>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      {selectedModel && (
        <ModelDetailDrawer
          model={selectedModel}
          onClose={() => setSelectedModel(null)}
          onSelectAsBase={(model) => {
            onSelectBaseModel(model);
            setSelectedModel(null);
          }}
          onAddLora={(model) => {
            onAddLora(model);
            setSelectedModel(null);
          }}
          onAddEmbedding={(model) => {
            if (props.onAddEmbedding) props.onAddEmbedding(model);
            setSelectedModel(null);
          }}
          isFav={isFavourited(selectedModel.id)}
          onToggleFav={() => handleFavouriteClick(selectedModel)}
        />
      )}

      {favModalModel && (
        <FolderSelectModal
          model={favModalModel}
          folders={folders}
          onClose={() => setFavModalModel(null)}
          onConfirm={(folderName) => {
            addFavourite(favModalModel, folderName);
            setFavModalModel(null);
          }}
          onCreateFolder={createFolder}
        />
      )}
    </div>
  );
}

function ModelCard({ model, onClick, isFav, onToggleFav }) {
  const [imgError, setImgError] = useState(false);
  const styleTag = model.tags?.find(t => STYLE_TAGS.includes(t.toLowerCase()));

  return (
    <div
      onClick={onClick}
      className="card card-rich text-left overflow-hidden cursor-pointer group flex flex-col h-full relative"
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '3/4', background: 'var(--surface-2)' }}>
        {model.thumbnailUrl && !imgError ? (
          <img
            src={model.thumbnailUrl}
            alt={model.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl" style={{ color: 'var(--text-tertiary)' }}>
            {model.type === 'Checkpoint' ? '🧠' : '🎨'}
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
          <span className={`badge shadow-sm ${model.type === 'Checkpoint' ? 'badge-warning' : ''}`} style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', border: 'none', color: 'white' }}>
            {model.type === 'LORA' ? 'LoRA' : (model.type === 'TextualInversion' ? 'Embedding' : model.type)}
          </span>
          {styleTag && (
            <span className="badge shadow-sm capitalize text-[9px] px-1.5 py-0.5" style={{ background: 'rgba(168,85,247,0.8)', backdropFilter: 'blur(4px)', border: 'none', color: 'white' }}>
              {styleTag}
            </span>
          )}
        </div>

        {/* Heart Icon Overlay */}
        <button
          onClick={onToggleFav}
          className={`absolute top-2 right-2 p-1.5 rounded-full shadow-sm transition-all transform hover:scale-110 ${isFav ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-pink-500 text-pink-500' : 'text-white'}`} />
        </button>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-[13px] font-semibold leading-tight line-clamp-2 mb-1" style={{ color: 'var(--text-primary)' }}>
          {model.name}
        </h3>
        <p className="text-[11px] mt-auto truncate" style={{ color: 'var(--text-tertiary)' }}>
          by {model.creator}
        </p>
      </div>

      {/* Stats strip */}
      <div className="px-3 py-2 flex items-center justify-between border-t" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
            <Download className="w-3 h-3" />
            {formatCount(model.stats?.downloads || 0)}
          </span>
          <span className="flex items-center gap-1 text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
            <ThumbsUp className="w-3 h-3" />
            {formatCount(model.stats?.thumbsUp || 0)}
          </span>
        </div>
        {model.version?.baseModel && (
          <span className="text-[9px] font-mono" style={{ color: 'var(--text-secondary)' }}>
            {model.version.baseModel.replace('SDXL 1.0', 'SDXL').replace('SD 1.5', 'SD1.5')}
          </span>
        )}
      </div>
    </div>
  );
}
