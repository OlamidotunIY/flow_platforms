import {
  clearApiAccessToken,
  configureApiClient,
  setApiAccessToken,
} from "@flow/api"
import { createAuthClient } from "better-auth/react"
import { organizationClient } from "better-auth/client/plugins"

import { getFlowConfig, setFlowConfig, type FlowClientConfig } from "./config"

const bearerTokenKey = "flow.better-auth.bearer-token"
const betterAuthBasePath = "/api/v1/auth"

export type FlowAuthClient = ReturnType<typeof createFlowAuthClient>

let authClient: FlowAuthClient | undefined

const browserTokenStorage = {
  get: () => globalThis.localStorage?.getItem(bearerTokenKey) ?? undefined,
  set: (token: string) => {
    globalThis.localStorage?.setItem(bearerTokenKey, token)
  },
  clear: () => {
    globalThis.localStorage?.removeItem(bearerTokenKey)
  },
}

function getBetterAuthBaseUrl(authBaseUrl: string) {
  const url = new URL(authBaseUrl)
  const path = url.pathname.replace(/\/+$/, "")

  if (!path) {
    url.pathname = betterAuthBasePath
  }

  return url.toString().replace(/\/+$/, "")
}

export function getFlowAuthEndpointUrl(path = "") {
  const baseUrl = getBetterAuthBaseUrl(getFlowConfig().authBaseUrl)
  const normalizedPath = path ? `/${path.replace(/^\/+/, "")}` : ""

  return `${baseUrl}${normalizedPath}`
}

export function createFlowAuthClient(config: FlowClientConfig) {
  return createAuthClient({
    baseURL: config.authBaseUrl,
    fetchOptions: {
      timeout: 10000,
      auth: {
        token: () => browserTokenStorage.get() ?? "",
        type: "Bearer",
      },
      onSuccess: async (ctx) => {
        const token = ctx.response.headers.get("set-auth-token")

        if (token) {
          await setApiAccessToken(token)
        }
      },
    },
    plugins: [organizationClient()],
  })
}

export function configureFlowClients(config: FlowClientConfig) {
  setFlowConfig(config)

  configureApiClient({
    baseUrl: config.apiBaseUrl,
    tokenStorage: browserTokenStorage,
  })

  authClient = createFlowAuthClient(config)

  return authClient
}

export function getFlowAuthClient() {
  if (!authClient) {
    throw new Error("Flow auth client has not been configured.")
  }

  return authClient
}

export async function clearFlowAuthState() {
  await clearApiAccessToken()
}
