declare global {
  interface Window {
    flowWindow?: {
      close: () => Promise<void>
      minimize: () => Promise<void>
      openApp: () => Promise<void>
      openAuth: () => Promise<void>
      toggleMaximize: () => Promise<void>
    }
    flowDiagnostics?: {
      authRequestFailed: (payload: unknown) => void
    }
    ipcRenderer?: {
      invoke: (channel: string, ...args: unknown[]) => Promise<unknown>
    }
  }
}

export {}
