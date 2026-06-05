import { organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import {
  clearApiAccessToken,
  configureApiClient,
  setApiAccessToken,
  type ApiAccessTokenStorage,
} from "./client";

const bearerTokenKey = "flow.better-auth.bearer-token";
const betterAuthBasePath = "/api/v1/auth";

export type FlowClientConfig = {
  apiBaseUrl: string;
  authBaseUrl: string;
  tokenStorage?: ApiAccessTokenStorage;
};

export type FlowAuthClient = ReturnType<typeof createFlowAuthClient>;

let authClient: FlowAuthClient | undefined;
let flowClientConfig: Required<
  Pick<FlowClientConfig, "apiBaseUrl" | "authBaseUrl">
> = {
  apiBaseUrl: "http://localhost:3000",
  authBaseUrl: "http://localhost:3000",
};

const browserTokenStorage: ApiAccessTokenStorage = {
  get: () => globalThis.localStorage?.getItem(bearerTokenKey) ?? undefined,
  set: (token: string) => {
    globalThis.localStorage?.setItem(bearerTokenKey, token);
  },
  clear: () => {
    globalThis.localStorage?.removeItem(bearerTokenKey);
  },
};

function getBetterAuthBaseUrl(authBaseUrl: string) {
  const url = new URL(authBaseUrl);
  const path = url.pathname.replace(/\/+$/, "");

  if (!path) {
    url.pathname = betterAuthBasePath;
  }

  return url.toString().replace(/\/+$/, "");
}

export function getFlowClientConfig() {
  return flowClientConfig;
}

export function getFlowAuthEndpointUrl(path = "") {
  const baseUrl = getBetterAuthBaseUrl(flowClientConfig.authBaseUrl);
  const normalizedPath = path ? `/${path.replace(/^\/+/, "")}` : "";

  return `${baseUrl}${normalizedPath}`;
}

export function createFlowAuthClient(config: FlowClientConfig) {
  const tokenStorage = config.tokenStorage ?? browserTokenStorage;

  return createAuthClient({
    baseURL: config.authBaseUrl,
    fetchOptions: {
      timeout: 10000,
      auth: {
        token: () => tokenStorage.get() ?? "",
        type: "Bearer",
      },
      onSuccess: async (ctx) => {
        const token = ctx.response.headers.get("set-auth-token");

        if (token) {
          await setApiAccessToken(token);
        }
      },
    },
    plugins: [organizationClient()],
  });
}

export function configureFlowClients(config: FlowClientConfig) {
  const tokenStorage = config.tokenStorage ?? browserTokenStorage;

  flowClientConfig = {
    apiBaseUrl: config.apiBaseUrl,
    authBaseUrl: config.authBaseUrl,
  };

  configureApiClient({
    baseUrl: config.apiBaseUrl,
    tokenStorage,
  });

  authClient = createFlowAuthClient({
    ...config,
    tokenStorage,
  });

  return authClient;
}

export function getFlowAuthClient() {
  if (!authClient) {
    throw new Error("Flow auth client has not been configured.");
  }

  return authClient;
}

export async function clearFlowAuthState() {
  await clearApiAccessToken();
}
