import { app, BrowserWindow, shell, ipcMain } from 'electron';
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

// 2. Register custom protocol for deep-linking back from web browsers
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('happygen', process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient('happygen');
}

let mainWindow = null;
let localServer = null;
let serverPort = null;

function focusMainWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  }
}

function handleDeepLink(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return;
  focusMainWindow();
}

// Single instance lock (ensures protocol callbacks open in the existing app instance on Windows/Linux)
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine) => {
    focusMainWindow();
    const deepLinkUrl = commandLine.find((arg) => arg.startsWith('happygen://'));
    if (deepLinkUrl) {
      handleDeepLink(deepLinkUrl);
    }
  });
}

// Deep linking on macOS
app.on('open-url', (event, url) => {
  event.preventDefault();
  handleDeepLink(url);
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

/**
 * Starts a lightweight local HTTP server for desktop builds.
 * Serves static assets and provides the /api/auth-callback loopback endpoint
 * so the external system browser (Chrome/Safari/Edge) can send auth tokens back into the app.
 */
function startLocalServer(distDir, preferredPort = 28991) {
  if (localServer && serverPort) {
    return Promise.resolve(serverPort);
  }

  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const parsedUrl = new URL(req.url, `http://localhost:${preferredPort}`);

        // CORS headers to permit browser loopback communication
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          return res.end();
        }

        // Loopback endpoint: External system browser posts completed auth credentials here
        if (parsedUrl.pathname === '/api/auth-callback' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const payload = JSON.parse(body);
              focusMainWindow();
              if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('desktop-auth-callback', payload);
              }
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            } catch (err) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
            }
          });
          return;
        }

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
  mainWindow = new BrowserWindow({
    width: 1380,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    title: 'HappyGen Studio',
    backgroundColor: '#080811',
    icon: fs.existsSync(path.join(__dirname, '../dist/logo.png'))
      ? path.join(__dirname, '../dist/logo.png')
      : path.join(__dirname, '../public/logo.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      preload: path.join(__dirname, 'preload.cjs'),
    },
    autoHideMenuBar: true,
    show: false,
  });

  const isDev = process.env.NODE_ENV === 'development';
  const distPath = fs.existsSync(path.join(__dirname, '../dist'))
    ? path.join(__dirname, '../dist')
    : path.join(__dirname, '../public');

  const port = await startLocalServer(distPath, 28991);

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173/#/studio');
  } else {
    mainWindow.loadURL(`http://localhost:${port}/#/studio`);
  }

  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[Renderer] [level ${level}] ${message} (${sourceId}:${line})`);
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // CRITICAL: Block all in-app popup windows. Any link or popup is opened externally in the user's default browser.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers for desktop browser authentication
ipcMain.handle('start-desktop-auth', async (event, provider) => {
  const port = serverPort || 28991;
  const authUrl = `http://localhost:${port}/auth.html?provider=${encodeURIComponent(provider)}&port=${port}`;
  await shell.openExternal(authUrl);
  return { success: true, url: authUrl };
});

ipcMain.handle('cancel-desktop-auth', () => {
  return { cancelled: true };
});

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
