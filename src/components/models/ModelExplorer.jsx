import React, { useState, useEffect, useCallback } from 'react';
import { Search, Download, ThumbsUp, Filter, X, Loader2, Heart, Clock } from 'lucide-react';
import { searchModels, formatCount } from '../../services/civitaiService';
import ModelDetailDrawer from './ModelDetailDrawer';
import { useFavouriteModels } from '../../hooks/useFavouriteModels';
import useAppStore from '../../store/useAppStore';
import useModelStore from '../../store/useModelStore';

const BASE_MODEL_FILTERS = ['All', 'Pony', 'SDXL 1.0', 'Illustrious', 'SD 1.5', 'Flux.1 D'];
const TYPE_FILTERS = ['All', 'Checkpoint', 'LORA', 'TextualInversion'];
const SORT_OPTIONS = ['Most Downloaded', 'Highest Rated', 'Newest'];

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
  const [sortBy, setSortBy] = useState('Most Downloaded');
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);

  const { favourites, toggleFavourite, isFavourited } = useFavouriteModels();

  const doSearch = useCallback(async (append = false) => {
    if (activeTab !== 'Search') return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await searchModels({
        query: query.trim() || undefined,
        type: typeFilter !== 'All' ? typeFilter : undefined,
        baseModel: baseModelFilter !== 'All' ? baseModelFilter : undefined,
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
  }, [query, typeFilter, baseModelFilter, sortBy, isAdultMode, cursor, activeTab]);

  // Initial load + filter changes
  useEffect(() => {
    if (activeTab === 'Search') {
      const timeout = setTimeout(() => doSearch(false), query ? 400 : 0);
      return () => clearTimeout(timeout);
    }
  }, [query, typeFilter, baseModelFilter, sortBy, isAdultMode, activeTab]);

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
  const displayResults = activeTab === 'Search' ? results : (activeTab === 'Favourites' ? favourites : []);

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
              onChange={e => { setQuery(e.target.value); setActiveTab('Search'); }}
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
              onToggleFav={(e) => {
                e.stopPropagation();
                toggleFavourite(model);
              }}
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
          onToggleFav={() => toggleFavourite(selectedModel)}
        />
      )}
    </div>
  );
}

function ModelCard({ model, onClick, isFav, onToggleFav }) {
  const [imgError, setImgError] = useState(false);

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
        <div className="absolute top-2 left-2">
          <span className={`badge shadow-sm ${model.type === 'Checkpoint' ? 'badge-warning' : ''}`} style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', border: 'none', color: 'white' }}>
            {model.type === 'LORA' ? 'LoRA' : (model.type === 'TextualInversion' ? 'Embedding' : model.type)}
          </span>
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
