const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("berakah", {
  load: () => ipcRenderer.invoke("load"),
  save: (txt) => ipcRenderer.invoke("save", txt),
  openFolder: () => ipcRenderer.invoke("openFolder"),
  getAutoStart: () => ipcRenderer.invoke("getAutoStart"),
  setAutoStart: (on) => ipcRenderer.invoke("setAutoStart", on),
  saveFile: (name, data) => ipcRenderer.invoke("saveFile", name, data)
});
