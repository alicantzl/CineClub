import { app, BrowserWindow, session, protocol, net, ipcMain } from 'electron';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ─── GPU & Performance ──────────────────────────────────────────────────────
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('force_high_performance_gpu');
app.commandLine.appendSwitch('enable-hardware-overlays');
app.commandLine.appendSwitch('enable-smooth-scrolling');
app.commandLine.appendSwitch('disable-frame-rate-limit');

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const isDev = !app.isPackaged;

// ─── Native Proxy Protocol ──────────────────────────────────────────────────
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'proxy',
    privileges: {
      standard: true, secure: true,
      supportFetchAPI: true, corsEnabled: true, stream: true
    }
  }
]);

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width:     1440,
    height:    900,
    minWidth:  1024,
    minHeight: 680,
    backgroundColor: '#030712',
    icon: path.join(__dirname, 'icon.png'),
    show: false,
    // Frameless — custom TitleBar handles chrome
    frame: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: false,
    // Round corners on Windows 11
    roundedCorners: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      powerPreference: 'high-performance',
      v8CacheOptions: 'bypassHeatCheck',
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.setMenu(null);

  // Disable right-click context menu (native app feel)
  mainWindow.webContents.on('context-menu', (e) => e.preventDefault());

  // Kill DevTools keyboard shortcut in production
  if (!isDev) {
    mainWindow.webContents.on('before-input-event', (event, input) => {
      if (input.key === 'F12') event.preventDefault();
      if (input.control && input.shift && input.key === 'I') event.preventDefault();
    });
  }

  session.defaultSession.setUserAgent(UA);

  // Proxy domain header injection
  session.defaultSession.webRequest.onBeforeSendHeaders(
    { urls: ['*://*.rapidplay.website/*', '*://rapidplay.website/*'] },
    (details, callback) => {
      const requestHeaders = { ...details.requestHeaders };
      requestHeaders['Referer']    = 'https://rapidplay.website/';
      requestHeaders['User-Agent'] = UA;
      callback({ requestHeaders });
    }
  );

  session.defaultSession.webRequest.onHeadersReceived(
    { urls: ['*://*.rapidplay.website/*', '*://rapidplay.website/*'] },
    (details, callback) => {
      const responseHeaders = { ...details.responseHeaders };
      responseHeaders['access-control-allow-origin'] = ['*'];
      delete responseHeaders['content-security-policy'];
      callback({ responseHeaders });
    }
  );

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    // Open DevTools in a detached window so it doesn't cover the app
    // mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Show when ready — prevents white flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    // Notify renderer of initial state
    if (mainWindow.isMaximized()) {
      mainWindow.webContents.send('window-state-change', 'maximized');
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    app.quit();
  });

  // Window state → CSS classes in renderer
  mainWindow.on('maximize',          () => mainWindow.webContents.send('window-state-change', 'maximized'));
  mainWindow.on('unmaximize',        () => mainWindow.webContents.send('window-state-change', 'normal'));
  mainWindow.on('enter-full-screen', () => mainWindow.webContents.send('window-state-change', 'fullscreen'));
  mainWindow.on('leave-full-screen', () => mainWindow.webContents.send('window-state-change', 'normal'));
}

app.whenReady().then(() => {

  // ─── Proxy protocol handler ────────────────────────────────────────────
  protocol.handle('proxy', async (request) => {
    const startTime = Date.now();
    try {
      let originalUrl = request.url.replace(/^proxy:\/\//, 'https://');

      const fetchHeaders = {
        'User-Agent':      UA,
        'Referer':         'https://rapidplay.website/',
        'Accept':          '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
      };

      if (request.headers.has('range')) {
        fetchHeaders['Range'] = request.headers.get('range');
      }

      const response = await net.fetch(originalUrl, {
        method: request.method,
        headers: fetchHeaders,
        bypassCustomProtocolHandlers: true,
      });

      const finalHeaders = {};
      response.headers.forEach((val, key) => { finalHeaders[key] = val; });
      finalHeaders['access-control-allow-origin']   = '*';
      finalHeaders['access-control-allow-methods']  = 'GET, POST, PUT, DELETE, OPTIONS, HEAD';
      finalHeaders['access-control-allow-headers']  = '*';
      finalHeaders['access-control-expose-headers'] = 'Content-Length, Content-Range, Content-Type';
      delete finalHeaders['content-security-policy'];
      delete finalHeaders['x-frame-options'];

      console.log(`[Proxy] ${request.method} ${response.status} (${Date.now() - startTime}ms): ${originalUrl.split('?')[0]}`);

      // HLS manifest URL rewriting
      const ct = (finalHeaders['content-type'] || '').toLowerCase();
      if ((originalUrl.includes('.m3u8') || ct.includes('mpegurl')) && response.status === 200) {
        const text = await response.text();
        return new Response(text.replace(/https?:\/\//g, 'proxy://'), {
          status: response.status,
          statusText: response.statusText,
          headers: finalHeaders,
        });
      }

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: finalHeaders,
      });
    } catch (error) {
      console.error(`[Proxy] FATAL: ${request.url}`, error);
      return new Response(`Proxy Error: ${error.message || 'Unknown'}`, {
        status: 500,
        headers: { 'access-control-allow-origin': '*' },
      });
    }
  });

  // ─── Window control IPC ────────────────────────────────────────────────
  ipcMain.on('window-control', (event, action) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return;
    if (action === 'minimize')         win.minimize();
    else if (action === 'maximize')    win.isMaximized() ? win.unmaximize() : win.maximize();
    else if (action === 'close')       win.close();
    else if (action === 'toggle-fullscreen') win.setFullScreen(!win.isFullScreen());
  });

  ipcMain.handle('is-maximized', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    return win ? win.isMaximized() : false;
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
