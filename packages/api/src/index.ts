export {
  apiClient,
  clearApiAccessToken,
  configureApiAccessTokenStorage,
  configureApiClient,
  configureRestApiClient,
  getApiAccessToken,
  getRestApiBaseUrl,
  restApiClient,
  setApiAccessToken,
} from "./client"
export type {
  ApiAccessTokenStorage,
  ConfigureApiClientOptions,
  ConfigureRestApiClientOptions,
} from "./client"
export {
  clearFlowAuthState,
  configureFlowClients,
  createFlowAuthClient,
  getFlowAuthClient,
  getFlowAuthEndpointUrl,
} from "./auth"
export type { FlowAuthClient, FlowClientConfig } from "./auth"
export {
  connectFlowSocket,
  connectWorkspaceSetupSocket,
  configureSocketClient,
  getSocketClientConfig,
  workspaceSetupCompletedEvent,
  workspaceSetupFailedEvent,
} from "./socket"
export type {
  ConnectFlowSocketOptions,
  ConfigureSocketClientOptions,
  FlowSocketConnection,
  WorkspaceSocketHandlers,
} from "./socket"

export * from "./generated/index"
export type {
  WorkspaceSidebarActiveOrganizationDto as ActiveOrganizationResponseDto,
  WorkspaceSidebarDepartmentDto as ActiveDepartmentResponseDto,
} from "./generated/index"
