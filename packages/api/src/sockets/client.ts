import {
  io,
  type ManagerOptions,
  type Socket,
  type SocketOptions,
} from "socket.io-client"

import { getApiAccessToken, type ApiAccessTokenStorage } from "../client"

type SocketIoOptions = Partial<ManagerOptions & SocketOptions>
type FlowSocketEventHandler = (...args: any[]) => void
type FlowSocketEventMap<TEvents> = {
  [TEventName in keyof TEvents]: FlowSocketEventHandler
}

export type ConfigureSocketClientOptions = {
  baseUrl: string
  path?: string
  tokenStorage?: ApiAccessTokenStorage
  socketOptions?: SocketIoOptions
}

export type ConnectFlowSocketOptions<
  TEvents extends FlowSocketEventMap<TEvents>,
> = {
  events?: Partial<TEvents>
  namespace?: string
  socketOptions?: SocketIoOptions
}

export type FlowSocketConnection = {
  socket: Socket
  disconnect: () => void
}

let socketClientConfig: ConfigureSocketClientOptions = {
  baseUrl: "http://localhost:3000",
}

function getSocketBaseUrl(baseUrl: string, namespace = "") {
  const url = new URL(baseUrl)
  const normalizedNamespace = namespace
    ? `/${namespace.replace(/^\/+/, "")}`
    : ""

  url.pathname = normalizedNamespace
  url.search = ""
  url.hash = ""

  return url.toString()
}

function getSocketPath(path?: string) {
  if (!path) {
    return undefined
  }

  return path.startsWith("/") ? path : `/${path}`
}

export function configureSocketClient(options: ConfigureSocketClientOptions) {
  socketClientConfig = {
    ...options,
    socketOptions: {
      ...options.socketOptions,
    },
  }
}

export function getSocketClientConfig() {
  return socketClientConfig
}

export async function connectFlowSocket<
  TEvents extends FlowSocketEventMap<TEvents>,
>({
  events,
  namespace,
  socketOptions,
}: ConnectFlowSocketOptions<TEvents> = {}) {
  const token = await (socketClientConfig.tokenStorage?.get() ??
    getApiAccessToken())

  const socket = io(getSocketBaseUrl(socketClientConfig.baseUrl, namespace), {
    auth: token ? { token } : undefined,
    path: getSocketPath(socketClientConfig.path),
    transports: ["websocket", "polling"],
    withCredentials: true,
    ...socketClientConfig.socketOptions,
    ...socketOptions,
  })

  for (const [eventName, handler] of Object.entries(events ?? {}) as [
    string,
    FlowSocketEventHandler | undefined,
  ][]) {
    if (handler) {
      socket.on(eventName, handler)
    }
  }

  return {
    socket,
    disconnect: () => {
      for (const [eventName, handler] of Object.entries(events ?? {}) as [
        string,
        FlowSocketEventHandler | undefined,
      ][]) {
        if (handler) {
          socket.off(eventName, handler)
        }
      }

      socket.disconnect()
    },
  } satisfies FlowSocketConnection
}
