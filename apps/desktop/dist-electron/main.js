import { ipcMain, app, BrowserWindow } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let loadingWindow = null;
let authWindow = null;
let appWindow = null;
function loadRenderer(win, windowKind) {
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(`${VITE_DEV_SERVER_URL}?flowWindow=${windowKind}`);
    return;
  }
  win.loadFile(path.join(RENDERER_DIST, "index.html"), {
    query: { flowWindow: windowKind }
  });
}
function createBaseWindow({
  height,
  resizable,
  transparent = false,
  title,
  width
}) {
  const win = new BrowserWindow({
    width,
    height,
    backgroundColor: transparent ? "#00000000" : void 0,
    frame: false,
    hasShadow: !transparent,
    resizable,
    show: false,
    title,
    transparent,
    autoHideMenuBar: true,
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname$1, "preload.mjs")
    }
  });
  win.setMenu(null);
  win.setMenuBarVisibility(false);
  win.once("ready-to-show", () => {
    win.center();
    win.show();
  });
  return win;
}
function closeWindow(win) {
  if (win && !win.isDestroyed()) {
    win.close();
  }
}
function openLoadingWindow() {
  closeWindow(authWindow);
  closeWindow(appWindow);
  authWindow = null;
  appWindow = null;
  loadingWindow = createBaseWindow({
    width: 340,
    height: 180,
    resizable: false,
    transparent: true,
    title: "Flow Desktop"
  });
  loadRenderer(loadingWindow, "loading");
}
function openAuthWindow() {
  closeWindow(loadingWindow);
  closeWindow(appWindow);
  loadingWindow = null;
  appWindow = null;
  if (authWindow && !authWindow.isDestroyed()) {
    authWindow.focus();
    return;
  }
  authWindow = createBaseWindow({
    width: 500,
    height: 620,
    resizable: false,
    transparent: true,
    title: "Flow Desktop"
  });
  loadRenderer(authWindow, "auth");
}
function openAppWindow() {
  closeWindow(loadingWindow);
  closeWindow(authWindow);
  loadingWindow = null;
  authWindow = null;
  if (appWindow && !appWindow.isDestroyed()) {
    appWindow.focus();
    return;
  }
  appWindow = createBaseWindow({
    width: 1180,
    height: 760,
    resizable: true,
    title: "Flow Desktop"
  });
  appWindow.setMinimumSize(960, 640);
  loadRenderer(appWindow, "app");
}
function windowFromEvent(event) {
  return BrowserWindow.fromWebContents(event.sender);
}
ipcMain.handle("flow-window:minimize", (event) => {
  var _a;
  (_a = windowFromEvent(event)) == null ? void 0 : _a.minimize();
});
ipcMain.handle("flow-window:toggle-maximize", (event) => {
  const win = windowFromEvent(event);
  if (!win) {
    return;
  }
  if (win.isMaximized()) {
    win.unmaximize();
  } else {
    win.maximize();
  }
});
ipcMain.handle("flow-window:close", (event) => {
  var _a;
  (_a = windowFromEvent(event)) == null ? void 0 : _a.close();
});
ipcMain.handle("flow-window:open-auth", () => {
  openAuthWindow();
});
ipcMain.handle("flow-window:open-app", () => {
  openAppWindow();
});
ipcMain.on("flow-auth:request-failed", (_event, payload) => {
  console.error("[Flow Auth] Request failed", payload);
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    openLoadingWindow();
  }
});
app.whenReady().then(openLoadingWindow);
export {
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
