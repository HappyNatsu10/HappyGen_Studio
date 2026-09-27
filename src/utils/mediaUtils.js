import { Media } from '@capacitor-community/media';

export const saveImageToGallery = async (uri) => {
  const ALBUM_NAME = 'HappyGen Studio';
  let albumId;
  
  try {
    const { albums } = await Media.getAlbums();
    let album = albums.find(a => a.name === ALBUM_NAME);
    
    if (!album) {
      await Media.createAlbum({ name: ALBUM_NAME });
      const newAlbums = await Media.getAlbums();
      album = newAlbums.albums.find(a => a.name === ALBUM_NAME);
    }
    
    albumId = album?.identifier;
  } catch (e) {
    console.log("Media album API error, continuing without album context", e);
  }
  
  const options = { path: uri };
  if (albumId) {
    options.albumIdentifier = albumId;
  } else {
    // Fallback for iOS / older plugins
    options.album = ALBUM_NAME;
  }
  
  await Media.savePhoto(options);
};
