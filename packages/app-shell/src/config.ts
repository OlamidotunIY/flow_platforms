export type FlowPlatform = "web" | "desktop"

export type FlowClientConfig = {
  apiBaseUrl: string
  authBaseUrl: string
  platform?: FlowPlatform
}

let flowConfig: Required<FlowClientConfig> = {
  apiBaseUrl: "http://localhost:3000",
  authBaseUrl: "http://localhost:3000",
  platform: "web",
}

export function setFlowConfig(config: FlowClientConfig) {
  flowConfig = {
    apiBaseUrl: config.apiBaseUrl,
    authBaseUrl: config.authBaseUrl,
    platform: config.platform ?? "web",
  }
}

export function getFlowConfig() {
  return flowConfig
}

export function isDesktopPlatform() {
  return flowConfig.platform === "desktop"
}

export function getDesktopWindowControls() {
  if (typeof window === "undefined") {
    return undefined
  }

  return window.flowWindow
}

export type DesktopWindowKind = "loading" | "auth" | "app"

export function getDesktopWindowKind(): DesktopWindowKind | undefined {
  if (!isDesktopPlatform() || typeof window === "undefined") {
    return undefined
  }

  const value = new URLSearchParams(window.location.search).get("flowWindow")

  if (value === "loading" || value === "auth" || value === "app") {
    return value
  }

  return undefined
}
