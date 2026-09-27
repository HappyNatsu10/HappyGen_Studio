import { Media } from '@capacitor-community/media';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

export const saveImageToGallery = async (base64Data, fileName = `happygen-${Date.now()}.png`) => {
  const ALBUM_NAME = 'HappyGen Studio';

  if (Capacitor.getPlatform() === 'android') {
    // Write directly to the Pictures folder on Android for cleaner folder structure (public visibility)
    try {
      const path = `Pictures/${ALBUM_NAME}/${fileName}`;
      await Filesystem.writeFile({
        path: path,
        data: base64Data,
        directory: Directory.ExternalStorage,
        recursive: true
      });
      return;
    } catch (err) {
      console.warn("Direct write to Pictures failed, falling back to Media plugin", err);
    }
  }

  // Fallback for iOS or if Android write failed
  try {
    // We first write it to cache so Media plugin can pick it up via URI
    const cacheFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Cache
    });
    
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
    
    const options = { path: cacheFile.uri };
    if (albumId) {
      options.albumIdentifier = albumId;
    } else {
      options.album = ALBUM_NAME;
    }
    
    await Media.savePhoto(options);
  } catch (err) {
    console.error("Save to gallery failed", err);
    throw err;
  }
};
