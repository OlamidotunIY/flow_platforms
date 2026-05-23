import { ipcRenderer, contextBridge } from "electron"

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },

  // You can expose other APTs you need here.
  // ...
})

contextBridge.exposeInMainWorld("flowWindow", {
  close: () => ipcRenderer.invoke("flow-window:close"),
  minimize: () => ipcRenderer.invoke("flow-window:minimize"),
  openApp: () => ipcRenderer.invoke("flow-window:open-app"),
  openAuth: () => ipcRenderer.invoke("flow-window:open-auth"),
  toggleMaximize: () => ipcRenderer.invoke("flow-window:toggle-maximize"),
})

contextBridge.exposeInMainWorld("flowDiagnostics", {
  authRequestFailed: (payload: unknown) =>
    ipcRenderer.send("flow-auth:request-failed", payload),
})
