const { app, BrowserWindow, ipcMain, shell, dialog, Menu } = require("electron");
const path = require("path");
const fs = require("fs");

const dir = path.join(app.getPath("documents"), "Al Berakah Reminders");
const file = path.join(dir, "data.json");
const bdir = path.join(dir, "backups");
const ensure = () => fs.mkdirSync(bdir, { recursive: true });

function dailyBackup(txt) {
  const day = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(path.join(bdir, "backup-" + day + ".json"), txt);
  const all = fs.readdirSync(bdir).filter(x => /^backup-.*\.json$/.test(x)).sort();
  while (all.length > 60) fs.unlinkSync(path.join(bdir, all.shift()));
}

ipcMain.handle("load", () => { ensure(); try { return fs.readFileSync(file, "utf8"); } catch (e) { return null; } });
ipcMain.handle("save", (e, txt) => {
  ensure();
  const tmp = file + ".tmp";
  fs.writeFileSync(tmp, txt);
  fs.renameSync(tmp, file);
  dailyBackup(txt);
  return true;
});
ipcMain.handle("openFolder", () => { ensure(); return shell.openPath(dir); });
ipcMain.handle("getAutoStart", () => app.getLoginItemSettings().openAtLogin);
ipcMain.handle("setAutoStart", (e, on) => { app.setLoginItemSettings({ openAtLogin: !!on }); return app.getLoginItemSettings().openAtLogin; });
ipcMain.handle("saveFile", async (e, name, data) => {
  const r = await dialog.showSaveDialog({ defaultPath: path.join(app.getPath("downloads"), name) });
  if (r.canceled || !r.filePath) return false;
  fs.writeFileSync(r.filePath, data);
  return true;
});

// Automatic updates (used when the installer comes from a GitHub Release).
let autoUpdater = null;
try { autoUpdater = require("electron-updater").autoUpdater; } catch (e) { autoUpdater = null; }
function setupUpdates(win) {
  if (!autoUpdater || !app.isPackaged) return;
  try {
    autoUpdater.autoDownload = true;
    autoUpdater.on("error", () => {});
    autoUpdater.on("update-downloaded", () => {
      dialog.showMessageBox(win, {
        type: "info", buttons: ["Restart now", "Later"], defaultId: 0, cancelId: 1,
        title: "Update ready",
        message: "A new version of Al Berakah Reminders is ready.",
        detail: "Restart the app to finish updating. Your cheques are not affected."
      }).then(r => { if (r.response === 0) autoUpdater.quitAndInstall(); });
    });
    autoUpdater.checkForUpdates().catch(() => {});
  } catch (e) { /* updates are optional - never stop the app */ }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1400, height: 900, minWidth: 900, minHeight: 600,
    title: "Al Berakah – Due Dates & Reminders",
    icon: path.join(__dirname, "icon.png"),
    webPreferences: { preload: path.join(__dirname, "preload.js"), contextIsolation: true, nodeIntegration: false }
  });
  win.loadFile(path.join(__dirname, "index.html"));
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: "deny" }; });
  win.webContents.once("did-finish-load", () => setupUpdates(win));
}

if (!app.requestSingleInstanceLock()) { app.quit(); }
else {
  app.whenReady().then(() => { Menu.setApplicationMenu(null); createWindow(); });
  app.on("window-all-closed", () => app.quit());
}
