import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export function useFavouriteModels() {
  const { currentUser, updateProfile, openAuth } = useAuth();

  const favourites = currentUser?.favouriteModels || [];
  const folders = currentUser?.favouriteFolders || ['Uncategorized'];

  const isFavourited = useCallback((modelId) => {
    return favourites.some(m => m.id === modelId);
  }, [favourites]);

  const toggleFavourite = useCallback((model) => {
    if (!currentUser) {
      openAuth('login');
      return;
    }

    const exists = isFavourited(model.id);
    let newFavourites;

    if (exists) {
      newFavourites = favourites.filter(m => m.id !== model.id);
    } else {
      // Save essential data for rendering the card later
      const modelDataToSave = {
        id: model.id,
        name: model.name,
        type: model.type,
        thumbnailUrl: model.thumbnailUrl,
        creator: model.creator,
        stats: model.stats,
        version: model.version || model.versions?.[0],
        versions: model.versions || (model.version ? [model.version] : []),
        addedAt: Date.now(),
        folder: 'Uncategorized',
      };
      newFavourites = [...favourites, modelDataToSave];
    }

    updateProfile({ favouriteModels: newFavourites });
  }, [currentUser, favourites, isFavourited, updateProfile, openAuth]);

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

  return {
    favourites,
    folders,
    isFavourited,
    toggleFavourite,
    createFolder,
    moveModelToFolder,
    favouriteCount: favourites.length
  };
}
