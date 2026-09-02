/**
 * HappyGen Studio v2.0 — CivitAI REST API Service
 * Wraps CivitAI's public API for model/LoRA browsing.
 */

import useAppStore from '../store/useAppStore';

const getBaseUrl = () => {
  const isAdultMode = useAppStore.getState().isAdultMode;
  return isAdultMode ? 'https://civitai.red/api/v1' : 'https://civitai.com/api/v1';
};

// In-memory session cache
const cache = new Map();

function cacheKey(url) {
  return url;
}

async function cachedFetch(url, ttlMs = 120000) {
  const key = cacheKey(url);
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < ttlMs) {
    return cached.data;
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`CivitAI API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  cache.set(key, { data, ts: Date.now() });
  return data;
}

/**
 * Search models on CivitAI.
 * @param {Object} params
 * @param {string} params.query - Search term
 * @param {string} params.type - "Checkpoint" | "LORA" | "TextualInversion" | undefined (all)
 * @param {string} params.baseModel - "SDXL 1.0" | "Pony" | "SD 1.5" | "Illustrious" | undefined
 * @param {string} params.sort - "Highest Rated" | "Most Downloaded" | "Newest"
 * @param {boolean} params.nsfw - include NSFW results
 * @param {number} params.limit - results per page (max 100)
 * @param {string} params.cursor - pagination cursor
 */
export async function searchModels({
  query = '',
  type,
  baseModel,
  sort = 'Most Downloaded',
  nsfw = false,
  limit = 20,
  tag,
  cursor,
} = {}) {
  const params = new URLSearchParams();
  if (query) params.set('query', query);
  if (type) params.set('types', type);
  if (baseModel) params.set('baseModels', baseModel);
  if (tag) params.set('tag', tag);
  if (sort) params.set('sort', sort);
  
  // If we're on the .red domain, nsfw is effectively implied/allowed, but we can pass it anyway
  // If we're on .com, it'll respect it up to their safety limits
  params.set('nsfw', (nsfw || useAppStore.getState().isAdultMode).toString());
  params.set('limit', limit.toString());
  if (cursor) params.set('cursor', cursor);

  const url = `${getBaseUrl()}/models?${params.toString()}`;
  const data = await cachedFetch(url, query ? 60000 : 300000);

  return {
    items: (data.items || []).map(normalizeModel),
    metadata: data.metadata || {},
  };
}

/**
 * Get a single model by ID.
 */
export async function getModelById(modelId) {
  const url = `${getBaseUrl()}/models/${modelId}`;
  const data = await cachedFetch(url, 300000);
  return normalizeModel(data);
}

/**
 * Get a model version by version ID.
 */
export async function getModelVersionById(versionId) {
  const url = `${getBaseUrl()}/model-versions/${versionId}`;
  const data = await cachedFetch(url, 300000);
  return normalizeVersion(data);
}

/**
 * Normalize a CivitAI model response into a clean shape.
 */
function normalizeModel(raw) {
  const latestVersion = raw.modelVersions?.[0];
  const previewImage = latestVersion?.images?.[0];

  return {
    id: raw.id,
    name: raw.name,
    type: raw.type, // "Checkpoint" | "LORA" | "TextualInversion"
    nsfw: raw.nsfw,
    nsfwLevel: raw.nsfwLevel,
    creator: raw.creator?.username || 'Unknown',
    creatorAvatar: raw.creator?.image || null,
    tags: raw.tags || [],
    baseModels: raw.baseModels || [],
    stats: {
      downloads: raw.stats?.downloadCount || 0,
      thumbsUp: raw.stats?.thumbsUpCount || 0,
      rating: raw.stats?.thumbsUpCount
        ? Math.round((raw.stats.thumbsUpCount / (raw.stats.thumbsUpCount + (raw.stats?.thumbsDownCount || 0))) * 100)
        : 0,
    },
    // Latest version info
    version: latestVersion ? (() => {
      const primaryFile = latestVersion.files?.find(f => f.primary) || latestVersion.files?.find(f => f.type === 'Model') || latestVersion.files?.[0];
      return {
        id: latestVersion.id,
        name: latestVersion.name,
        baseModel: latestVersion.baseModel,
        trainedWords: latestVersion.trainedWords || [],
        downloadUrl: primaryFile?.downloadUrl || null,
        fileSize: primaryFile?.sizeKB
          ? Math.round(primaryFile.sizeKB / 1024)
          : null,
        fileName: primaryFile?.name || null,
      };
    })() : null,
    // All versions
    versions: (raw.modelVersions || []).map(normalizeVersion),
    // Preview
    thumbnailUrl: previewImage?.url
      ? getImageUrl(previewImage.url, 320)
      : null,
    previewUrl: previewImage?.url
      ? getImageUrl(previewImage.url, 768)
      : null,
    previewNsfwLevel: previewImage?.nsfwLevel || 1,
    // Description
    description: stripHtml(raw.description || ''),
  };
}

function normalizeVersion(v) {
  const primaryFile = v.files?.find(f => f.primary) || v.files?.find(f => f.type === 'Model') || v.files?.[0];
  return {
    id: v.id,
    name: v.name,
    baseModel: v.baseModel,
    trainedWords: v.trainedWords || [],
    downloadUrl: primaryFile?.downloadUrl || null,
    fileSize: primaryFile?.sizeKB
      ? Math.round(primaryFile.sizeKB / 1024)
      : null,
    fileName: primaryFile?.name || null,
    images: (v.images || []).slice(0, 6).map(img => ({
      url: getImageUrl(img.url, 512),
      nsfwLevel: img.nsfwLevel || 1,
      width: img.width,
      height: img.height,
    })),
    stats: {
      downloads: v.stats?.downloadCount || 0,
      thumbsUp: v.stats?.thumbsUpCount || 0,
    },
  };
}

/**
 * CivitAI image URLs support width transformation.
 */
function getImageUrl(url, width = 320) {
  if (!url) return null;
  // CivitAI images support /width=X/ transforms
  return url.replace('/original=true/', `/width=${width}/`);
}

/**
 * Strip HTML tags from CivitAI descriptions.
 */
function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
}

/**
 * Format download count for display.
 */
export function formatCount(num) {
  if (!num) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}
