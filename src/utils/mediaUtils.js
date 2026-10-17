import { Media } from '@capacitor-community/media';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

/**
 * Robustly saves an image to the device gallery / photo library on mobile (Android/iOS)
 * Accepts: pure base64, data URL (data:image/png;base64,...), file URI (file:///...), or remote/blob URL.
 */
export const saveImageToGallery = async (input, fileName = `happygen-${Date.now()}.png`) => {
  const ALBUM_NAME = 'HappyGen Studio';

  if (!input) {
    throw new Error('No image data provided to save.');
  }

  // Ensure clean filename
  if (!fileName.endsWith('.png') && !fileName.endsWith('.jpg') && !fileName.endsWith('.jpeg')) {
    fileName = `${fileName}.png`;
  }

  // 1. Ensure storage/media permissions on Capacitor native
  if (Capacitor.isNativePlatform()) {
    try {
      const perm = await Media.checkPermissions();
      if (perm.publicStorage !== 'granted') {
        await Media.requestPermissions();
      }
    } catch (permErr) {
      console.log('Permission check notice:', permErr);
      try {
        await Media.requestPermissions();
      } catch (_) {}
    }
  }

  let fileUri = null;

  // 2. Determine input type and prepare fileUri
  if (typeof input === 'string' && (input.startsWith('file://') || input.startsWith('content://'))) {
    // Input is already a local file URI
    fileUri = input;
  } else {
    // Input is base64, data URL, or remote/blob URL
    let pureBase64 = '';

    if (typeof input === 'string' && input.startsWith('data:')) {
      // Strip data URI scheme prefix (e.g., data:image/png;base64,) and whitespace
      pureBase64 = input.replace(/^data:image\/[a-zA-Z0-9.+_-]+;base64,/, '').replace(/\s/g, '');
    } else if (typeof input === 'string' && (input.startsWith('http://') || input.startsWith('https://') || input.startsWith('blob:'))) {
      // Remote or blob URL: fetch and convert to base64
      const response = await fetch(input);
      const blob = await response.blob();
      pureBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const res = reader.result;
          if (typeof res === 'string') {
            resolve(res.replace(/^data:image\/[a-zA-Z0-9.+_-]+;base64,/, '').replace(/\s/g, ''));
          } else {
            reject(new Error('Failed to read image blob as base64'));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } else if (typeof input === 'string') {
      // Pure base64 - strip any whitespace or accidental newlines
      pureBase64 = input.replace(/^data:image\/[a-zA-Z0-9.+_-]+;base64,/, '').replace(/\s/g, '');
    } else if (input instanceof Blob) {
      pureBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const res = reader.result;
          if (typeof res === 'string') {
            resolve(res.replace(/^data:image\/[a-zA-Z0-9.+_-]+;base64,/, '').replace(/\s/g, ''));
          } else {
            reject(new Error('Failed to read image blob as base64'));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(input);
      });
    }

    if (!pureBase64) {
      throw new Error('Image data is empty or invalid.');
    }

    // Write to temporary Cache directory so Media plugin can pick it up safely
    const cacheFile = await Filesystem.writeFile({
      path: fileName,
      data: pureBase64,
      directory: Directory.Cache
    });
    fileUri = cacheFile.uri;
  }

  // 3. Save to photo library using Media plugin
  try {
    let albumId;
    try {
      const { albums } = await Media.getAlbums();
      let album = albums?.find(a => a.name === ALBUM_NAME);
      if (!album) {
        await Media.createAlbum({ name: ALBUM_NAME });
        const newAlbums = await Media.getAlbums();
        album = newAlbums.albums?.find(a => a.name === ALBUM_NAME);
      }
      albumId = album?.identifier;
    } catch (e) {
      console.log('Media album query note:', e);
    }

    const options = { path: fileUri };
    if (albumId) {
      options.albumIdentifier = albumId;
    } else {
      options.album = ALBUM_NAME;
    }

    await Media.savePhoto(options);
    return true;
  } catch (err) {
    console.warn('Media.savePhoto failed, attempting fallback via Share sheet:', err);
    // Fallback: If direct gallery saving fails on some devices, offer native share/save sheet
    try {
      await Share.share({
        title: 'Save Image',
        text: 'Save generated image to your device',
        url: fileUri,
        dialogTitle: 'Save Image'
      });
      return true;
    } catch (shareErr) {
      console.error('Share fallback also failed:', shareErr);
      throw err;
    }
  }
};
