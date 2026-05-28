import { io, type Socket } from "socket.io-client"

import { getApiAccessToken } from "@flow/api"

import { getFlowConfig } from "./config"
import type { FlowUserInfo } from "./store/userStore"

type WorkspaceSocketHandlers = {
  onCompleted: (payload: FlowUserInfo) => void
  onFailed: (payload: { errorMessage?: string }) => void
}

let socket: Socket | null = null

export async function connectWorkspaceSetupSocket({
  onCompleted,
  onFailed,
}: WorkspaceSocketHandlers) {
  const token = await getApiAccessToken()
  const url = new URL(getFlowConfig().apiBaseUrl)
  url.pathname = ""
  url.search = ""

  socket?.disconnect()
  socket = io(url.toString(), {
    auth: token ? { token } : undefined,
    transports: ["websocket", "polling"],
    withCredentials: true,
  })

  socket.on("workspace.setup.completed", onCompleted)
  socket.on("workspace.setup.failed", onFailed)

  return () => {
    socket?.off("workspace.setup.completed", onCompleted)
    socket?.off("workspace.setup.failed", onFailed)
    socket?.disconnect()
    socket = null
  }
}
