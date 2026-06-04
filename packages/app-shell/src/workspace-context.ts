import { apiClient } from "@flow/api"

import type {
  WorkspaceContext,
  WorkspaceSidebarTab,
} from "./store/userStore"

export function getWorkspaceSidebar(tab: WorkspaceSidebarTab = "home") {
  return apiClient.get<{ 200: WorkspaceContext }, unknown>({
    security: [{ scheme: "bearer", type: "http" }],
    url: "/api/v1/workspace/sidebar",
    query: { tab },
  })
}
