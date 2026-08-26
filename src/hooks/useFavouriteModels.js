import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export function useFavouriteModels() {
  const { currentUser, updateProfile, openAuth } = useAuth();

  const favourites = currentUser?.favouriteModels || [];

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
        version: model.version || model.versions?.[0]
      };
      newFavourites = [...favourites, modelDataToSave];
    }

    updateProfile({ favouriteModels: newFavourites });
  }, [currentUser, favourites, isFavourited, updateProfile, openAuth]);

  return {
    favourites,
    isFavourited,
    toggleFavourite,
    favouriteCount: favourites.length
  };
}
