import type { Socket } from "socket.io-client"

import { connectFlowSocket } from "./client"

export const workspaceSetupCompletedEvent = "workspace.setup.completed"
export const workspaceSetupFailedEvent = "workspace.setup.failed"

export type WorkspaceSocketHandlers<TCompleted, TFailed> = {
  onCompleted: (payload: TCompleted) => void
  onFailed: (payload: TFailed) => void
}

type WorkspaceSetupSocketEvents<TCompleted, TFailed> = {
  [workspaceSetupCompletedEvent]: (payload: TCompleted) => void
  [workspaceSetupFailedEvent]: (payload: TFailed) => void
}

let workspaceSetupSocket: Socket | null = null

export async function connectWorkspaceSetupSocket<TCompleted, TFailed>({
  onCompleted,
  onFailed,
}: WorkspaceSocketHandlers<TCompleted, TFailed>) {
  workspaceSetupSocket?.disconnect()

  const connection = await connectFlowSocket<
    WorkspaceSetupSocketEvents<TCompleted, TFailed>
  >({
    events: {
      [workspaceSetupCompletedEvent]: onCompleted,
      [workspaceSetupFailedEvent]: onFailed,
    },
  })

  workspaceSetupSocket = connection.socket

  return () => {
    connection.disconnect()

    if (workspaceSetupSocket === connection.socket) {
      workspaceSetupSocket = null
    }
  }
}
