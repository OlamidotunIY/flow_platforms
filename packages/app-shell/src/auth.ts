import { clearApiAccessToken, configureApiClient, setApiAccessToken } from "@flow/api";
import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

const bearerTokenKey = "flow.better-auth.bearer-token";

export type FlowClientConfig = {
  apiBaseUrl: string;
  authBaseUrl: string;
};

export type FlowAuthClient = ReturnType<typeof createFlowAuthClient>;

let authClient: FlowAuthClient | undefined;

const browserTokenStorage = {
  get: () => globalThis.localStorage?.getItem(bearerTokenKey) ?? undefined,
  set: (token: string) => {
    globalThis.localStorage?.setItem(bearerTokenKey, token);
  },
  clear: () => {
    globalThis.localStorage?.removeItem(bearerTokenKey);
  },
};

export function createFlowAuthClient(config: FlowClientConfig) {
  return createAuthClient({
    baseURL: config.authBaseUrl,
    fetchOptions: {
      auth: {
        token: () => browserTokenStorage.get() ?? "",
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
  configureApiClient({
    baseUrl: config.apiBaseUrl,
    tokenStorage: browserTokenStorage,
  });

  authClient = createFlowAuthClient(config);

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
