import { client } from "./generated/client.gen"
import type { Config } from "./generated/client/types.gen"

export type ApiAccessTokenStorage = {
  get: () => string | Promise<string | undefined> | undefined
  set?: (token: string) => void | Promise<void>
  clear?: () => void | Promise<void>
}

export type ConfigureRestApiClientOptions = {
  baseUrl: string
  tokenStorage?: ApiAccessTokenStorage
  fetch?: Config["fetch"]
  headers?: Config["headers"]
}

export type ConfigureApiClientOptions = ConfigureRestApiClientOptions

let accessTokenStorage: ApiAccessTokenStorage | undefined
let restApiBaseUrl = "http://localhost:3000"

export function configureApiAccessTokenStorage(storage: ApiAccessTokenStorage) {
  accessTokenStorage = storage
}

export async function setApiAccessToken(token: string) {
  await accessTokenStorage?.set?.(token)
}

export async function clearApiAccessToken() {
  await accessTokenStorage?.clear?.()
}

export function getApiAccessToken() {
  return accessTokenStorage?.get()
}

export function getRestApiBaseUrl() {
  return restApiBaseUrl
}

export function configureRestApiClient({
  baseUrl,
  tokenStorage,
  fetch,
  headers,
}: ConfigureRestApiClientOptions) {
  restApiBaseUrl = baseUrl

  if (tokenStorage) {
    configureApiAccessTokenStorage(tokenStorage)
  }

  client.setConfig({
    auth: () => getApiAccessToken(),
    baseUrl,
    credentials: "include",
    fetch,
    headers,
  })

  return client
}

export const configureApiClient = configureRestApiClient

export { client as restApiClient }
export { client as apiClient }
