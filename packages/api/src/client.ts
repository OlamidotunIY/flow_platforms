import { client } from "./generated/client.gen";

export type ConfigureApiClientOptions = {
  baseUrl: string;
  getAccessToken?: () => string | Promise<string | undefined> | undefined;
};

export function configureApiClient({
  baseUrl,
  getAccessToken,
}: ConfigureApiClientOptions) {
  client.setConfig({
    auth: getAccessToken,
    baseUrl,
  });

  return client;
}

export { client as apiClient };
