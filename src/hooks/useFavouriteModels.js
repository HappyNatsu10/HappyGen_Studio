import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getModelById } from '../services/civitaiService';

export function useFavouriteModels() {
  const { currentUser, updateProfile, openAuth } = useAuth();

  const favourites = currentUser?.favouriteModels || [];
  const folders = currentUser?.favouriteFolders || ['Uncategorized'];

  const isFavourited = useCallback((modelId) => {
    return favourites.some(m => m.id === modelId);
  }, [favourites]);

  const removeFavourite = useCallback((modelId) => {
    if (!currentUser) return;
    const newFavourites = favourites.filter(m => m.id !== modelId);
    updateProfile({ favouriteModels: newFavourites });
  }, [currentUser, favourites, updateProfile]);

  const addFavourite = useCallback(async (model, folderName = 'Uncategorized') => {
    if (!currentUser) {
      openAuth('login');
      return;
    }
    if (isFavourited(model.id)) return;

    let fullModel = model;
    try {
      const fetched = await getModelById(model.id);
      if (fetched) fullModel = fetched;
    } catch (err) {
      console.error("Failed to fetch full model for favorite:", err);
    }

    // Sanitize data for Firestore to avoid "undefined" errors and massive payload sizes
    const safeVersion = fullModel.version || fullModel.versions?.[0] || {};
    
    const modelDataToSave = {
      id: fullModel.id,
      name: fullModel.name || 'Unknown',
      type: fullModel.type || 'Unknown',
      creator: typeof fullModel.creator === 'string' ? fullModel.creator : (fullModel.creator?.username || 'Unknown'),
      thumbnailUrl: fullModel.images?.[0]?.url || fullModel.thumbnailUrl || null,
      images: fullModel.images || null,
      stats: {
        downloadCount: fullModel.stats?.downloadCount || fullModel.stats?.downloads || 0,
        thumbsUpCount: fullModel.stats?.thumbsUpCount || fullModel.stats?.thumbsUp || fullModel.stats?.favoriteCount || 0
      },
      tags: Array.isArray(fullModel.tags) ? fullModel.tags.filter(t => typeof t === 'string') : [],
      version: {
        id: safeVersion.id || null,
        name: safeVersion.name || 'Unknown',
        baseModel: safeVersion.baseModel || 'Unknown',
        downloadUrl: safeVersion.downloadUrl || null
      },
      addedAt: Date.now(),
      folder: folderName,
    };
    updateProfile({ favouriteModels: [...favourites, modelDataToSave] });
  }, [currentUser, favourites, isFavourited, updateProfile, openAuth]);

  const toggleFavourite = useCallback((model) => {
    if (!currentUser) {
      openAuth('login');
      return;
    }

    if (isFavourited(model.id)) {
      removeFavourite(model.id);
    } else {
      addFavourite(model, 'Uncategorized');
    }
  }, [currentUser, isFavourited, removeFavourite, addFavourite, openAuth]);


  const createFolder = useCallback((folderName) => {
    if (!currentUser) return;
    const name = folderName.trim();
    if (!name || folders.includes(name)) return;
    updateProfile({ favouriteFolders: [...folders, name] });
  }, [currentUser, folders, updateProfile]);

  const moveModelToFolder = useCallback((modelId, folderName) => {
    if (!currentUser) return;
    const newFavourites = favourites.map(m => 
      m.id === modelId ? { ...m, folder: folderName } : m
    );
    updateProfile({ favouriteModels: newFavourites });
  }, [currentUser, favourites, updateProfile]);

  const renameFolder = useCallback((oldName, newName) => {
    if (!currentUser) return;
    const trimmedNewName = newName.trim();
    if (!trimmedNewName || folders.includes(trimmedNewName)) return;

    const newFolders = folders.map(f => f === oldName ? trimmedNewName : f);
    const newFavourites = favourites.map(m => 
      m.folder === oldName ? { ...m, folder: trimmedNewName } : m
    );

    updateProfile({ 
      favouriteFolders: newFolders,
      favouriteModels: newFavourites
    });
  }, [currentUser, folders, favourites, updateProfile]);

  const deleteFolder = useCallback((folderName) => {
    if (!currentUser) return;
    
    const newFolders = folders.filter(f => f !== folderName);
    const newFavourites = favourites.map(m => 
      m.folder === folderName ? { ...m, folder: 'Uncategorized' } : m
    );

    updateProfile({ 
      favouriteFolders: newFolders,
      favouriteModels: newFavourites
    });
  }, [currentUser, folders, favourites, updateProfile]);

  const refreshAllFavourites = useCallback(async () => {
    if (!currentUser) return 0;
    
    let updatedCount = 0;
    const newFavourites = [...favourites];
    
    for (let i = 0; i < newFavourites.length; i++) {
      const model = newFavourites[i];
      try {
        const fullModel = await getModelById(model.id);
        if (fullModel) {
          const safeVersion = fullModel.version || fullModel.versions?.[0] || {};
          newFavourites[i] = {
            ...model,
            thumbnailUrl: fullModel.images?.[0]?.url || fullModel.thumbnailUrl || null,
            images: fullModel.images || null,
            stats: {
              downloadCount: fullModel.stats?.downloadCount || fullModel.stats?.downloads || 0,
              thumbsUpCount: fullModel.stats?.thumbsUpCount || fullModel.stats?.thumbsUp || fullModel.stats?.favoriteCount || 0
            },
            version: {
              id: safeVersion.id || null,
              name: safeVersion.name || 'Unknown',
              baseModel: safeVersion.baseModel || 'Unknown',
              downloadUrl: safeVersion.downloadUrl || null
            }
          };
          updatedCount++;
        }
      } catch (err) {
        console.error("Failed to refresh model:", model.id, err);
      }
    }
    
    if (updatedCount > 0) {
      updateProfile({ favouriteModels: newFavourites });
    }
    return updatedCount;
  }, [currentUser, favourites, updateProfile]);

  return {
    favourites,
    folders,
    isFavourited,
    toggleFavourite,
    addFavourite,
    removeFavourite,
    refreshAllFavourites,
    createFolder,
    moveModelToFolder,
    renameFolder,
    deleteFolder,
    favouriteCount: favourites.length
  };
}
