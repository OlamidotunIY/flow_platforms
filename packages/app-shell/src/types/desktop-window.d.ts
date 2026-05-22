declare global {
  interface Window {
    flowWindow?: {
      close: () => Promise<void>
      minimize: () => Promise<void>
      openApp: () => Promise<void>
      openAuth: () => Promise<void>
      toggleMaximize: () => Promise<void>
    }
  }
}

export {}
