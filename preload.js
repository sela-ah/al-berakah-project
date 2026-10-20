const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("berakah", {
  load: () => ipcRenderer.invoke("load"),
  save: (txt) => ipcRenderer.invoke("save", txt),
  openFolder: () => ipcRenderer.invoke("openFolder"),
  saveFile: (name, data) => ipcRenderer.invoke("saveFile", name, data)
});
