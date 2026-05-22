import { client } from "./generated/client.gen";

export type ApiAccessTokenStorage = {
  get: () => string | Promise<string | undefined> | undefined;
  set?: (token: string) => void | Promise<void>;
  clear?: () => void | Promise<void>;
};

export type ConfigureApiClientOptions = {
  baseUrl: string;
  tokenStorage?: ApiAccessTokenStorage;
};

let accessTokenStorage: ApiAccessTokenStorage | undefined;

export function configureApiAccessTokenStorage(storage: ApiAccessTokenStorage) {
  accessTokenStorage = storage;
}

export async function setApiAccessToken(token: string) {
  await accessTokenStorage?.set?.(token);
}

export async function clearApiAccessToken() {
  await accessTokenStorage?.clear?.();
}

export function getApiAccessToken() {
  return accessTokenStorage?.get();
}

export function configureApiClient({
  baseUrl,
  tokenStorage,
}: ConfigureApiClientOptions) {
  if (tokenStorage) {
    configureApiAccessTokenStorage(tokenStorage);
  }

  client.setConfig({
    auth: () => getApiAccessToken(),
    baseUrl,
    credentials: "include",
  });

  return client;
}

export { client as apiClient };
