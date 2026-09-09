import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

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

  const addFavourite = useCallback((model, folderName = 'Uncategorized') => {
    if (!currentUser) {
      openAuth('login');
      return;
    }
    if (isFavourited(model.id)) return;

    const modelDataToSave = {
      ...model,
      version: model.version || model.versions?.[0],
      versions: model.versions || (model.version ? [model.version] : []),
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

  return {
    favourites,
    folders,
    isFavourited,
    toggleFavourite,
    addFavourite,
    removeFavourite,
    createFolder,
    moveModelToFolder,
    renameFolder,
    deleteFolder,
    favouriteCount: favourites.length
  };
}
