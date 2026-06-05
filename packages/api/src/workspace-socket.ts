import { io, type Socket } from "socket.io-client";

import { getApiAccessToken } from "./client";
import { getFlowClientConfig } from "./auth";

export type WorkspaceSocketHandlers<TCompleted, TFailed> = {
  onCompleted: (payload: TCompleted) => void;
  onFailed: (payload: TFailed) => void;
};

let socket: Socket | null = null;

export async function connectWorkspaceSetupSocket<TCompleted, TFailed>({
  onCompleted,
  onFailed,
}: WorkspaceSocketHandlers<TCompleted, TFailed>) {
  const token = await getApiAccessToken();
  const url = new URL(getFlowClientConfig().apiBaseUrl);
  url.pathname = "";
  url.search = "";

  socket?.disconnect();
  socket = io(url.toString(), {
    auth: token ? { token } : undefined,
    transports: ["websocket", "polling"],
    withCredentials: true,
  });

  socket.on("workspace.setup.completed", onCompleted);
  socket.on("workspace.setup.failed", onFailed);

  return () => {
    socket?.off("workspace.setup.completed", onCompleted);
    socket?.off("workspace.setup.failed", onFailed);
    socket?.disconnect();
    socket = null;
  };
}
