import { app, BrowserWindow, shell } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Set explicit application identity for OS toast notifications and taskbar
app.setName('HappyGen Studio');
if (process.platform === 'win32') {
  app.setAppUserModelId('HappyGen Studio');
}

// 2. Format a standard Chrome User-Agent so Google/Twitter OAuth is not blocked as "disallowed_useragent"
app.whenReady().then(() => {
  if (app.userAgentFallback) {
    app.userAgentFallback = app.userAgentFallback
      .replace(new RegExp(`Electron/${process.versions.electron}`, 'g'), '')
      .replace(/HappyGen Studio\/[0-9.]+\s*/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
});

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
};

let localServer = null;
let serverPort = null;

/**
 * Starts a lightweight local HTTP server for production desktop builds.
 * Serves the 'dist' directory over http://localhost:<port>.
 * This ensures:
 * - Origin is http://localhost (a standard Firebase-authorized web domain).
 * - Firebase Google/Twitter OAuth popups can freely communicate via postMessage with window.opener.
 * - Persistent storage (IndexedDB, LocalStorage, Auth tokens) is retained under a consistent origin.
 */
function startLocalServer(distDir, preferredPort = 28991) {
  if (localServer && serverPort) {
    return Promise.resolve(serverPort);
  }

  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const parsedUrl = new URL(req.url, `http://localhost:${preferredPort}`);
        let decodedPath = decodeURIComponent(parsedUrl.pathname);
        if (decodedPath === '/' || decodedPath === '') {
          decodedPath = '/index.html';
        }

        let safePath = path.normalize(path.join(distDir, decodedPath));
        if (!safePath.toLowerCase().startsWith(distDir.toLowerCase())) {
          res.statusCode = 403;
          return res.end('Forbidden');
        }

        // SPA fallback: return index.html if specific file does not exist
        if (!fs.existsSync(safePath) || fs.statSync(safePath).isDirectory()) {
          safePath = path.join(distDir, 'index.html');
        }

        const ext = path.extname(safePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.setHeader('Content-Type', contentType);
        res.setHeader('Access-Control-Allow-Origin', '*');
        // Allow popups to communicate back via window.opener for OAuth flows
        if (ext === '.html' || ext === '') {
          res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
        }

        const fileBuffer = fs.readFileSync(safePath);
        res.setHeader('Content-Length', fileBuffer.length);
        res.end(fileBuffer);
      } catch (err) {
        res.statusCode = 500;
        res.end('Server error');
      }
    });

    server.listen(preferredPort, 'localhost', () => {
      localServer = server;
      serverPort = server.address().port;
      resolve(serverPort);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        // Fallback to next available port if preferred port is already bound
        server.listen(0, 'localhost', () => {
          localServer = server;
          serverPort = server.address().port;
          resolve(serverPort);
        });
      } else {
        reject(err);
      }
    });
  });
}

async function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1380,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    title: "HappyGen Studio",
    backgroundColor: "#080811",
    icon: fs.existsSync(path.join(__dirname, '../dist/logo.png'))
      ? path.join(__dirname, '../dist/logo.png')
      : path.join(__dirname, '../public/logo.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false
    },
    autoHideMenuBar: true,
    show: false
  });

  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173/#/studio');
  } else {
    try {
      const distPath = path.join(__dirname, '../dist');
      const port = await startLocalServer(distPath, 28991);
      mainWindow.loadURL(`http://localhost:${port}/#/studio`);
    } catch (err) {
      console.error('Failed to start local static server, falling back to file://', err);
      mainWindow.loadFile(path.join(__dirname, '../dist/index.html'), { hash: '/studio' });
    }
  }

  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[Renderer] [level ${level}] ${message} (${sourceId}:${line})`);
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window.open (OAuth popups vs external links)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    const isOAuthPopup =
      url === 'about:blank' ||
      url.includes('firebaseapp.com') ||
      url.includes('happygenstudio.online') ||
      url.includes('accounts.google.com') ||
      url.includes('api.twitter.com') ||
      url.includes('twitter.com') ||
      url.includes('x.com') ||
      url.includes('apis.google.com') ||
      url.includes('googleusercontent.com');

    if (isOAuthPopup) {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          width: 520,
          height: 680,
          title: 'Sign In',
          autoHideMenuBar: true,
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: false
          }
        }
      };
    }

    // External hyperlinks (Discord, X marketing, docs) open in system default browser
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('did-create-window', (childWindow) => {
    // Override User-Agent in popup to look like Chrome so Twitter/Google don't block it
    childWindow.webContents.setUserAgent(
      childWindow.webContents.getUserAgent()
        .replace(new RegExp(`Electron/${process.versions.electron}`, 'g'), '')
        .replace(/HappyGen Studio\/[0-9.]+\s*/gi, '')
        .replace(/\s+/g, ' ')
        .trim()
    );

    // Allow OAuth-related navigations inside the popup to stay in-app.
    // Only send truly external (non-OAuth) links to the system browser.
    childWindow.webContents.setWindowOpenHandler(({ url }) => {
      const isOAuthRelated =
        url === 'about:blank' ||
        url.includes('firebaseapp.com') ||
        url.includes('happygenstudio.online') ||
        url.includes('accounts.google.com') ||
        url.includes('api.twitter.com') ||
        url.includes('twitter.com') ||
        url.includes('x.com') ||
        url.includes('apis.google.com') ||
        url.includes('googleusercontent.com') ||
        url.includes('localhost');

      if (isOAuthRelated) {
        return { action: 'allow' };
      }
      shell.openExternal(url);
      return { action: 'deny' };
    });

    // Also intercept will-navigate inside popup to keep OAuth redirects in the popup
    childWindow.webContents.on('will-navigate', (event, navUrl) => {
      const isOAuthRelated =
        navUrl.includes('firebaseapp.com') ||
        navUrl.includes('happygenstudio.online') ||
        navUrl.includes('accounts.google.com') ||
        navUrl.includes('api.twitter.com') ||
        navUrl.includes('twitter.com') ||
        navUrl.includes('x.com') ||
        navUrl.includes('apis.google.com') ||
        navUrl.includes('localhost');

      if (!isOAuthRelated) {
        event.preventDefault();
        shell.openExternal(navUrl);
      }
    });
  });
}

app.whenReady().then(async () => {
  await createWindow();

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (localServer) {
    try {
      localServer.close();
    } catch {}
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
