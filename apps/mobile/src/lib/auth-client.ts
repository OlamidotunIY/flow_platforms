import { configureApiClient, setApiAccessToken } from "@flow/api";
import { expoClient } from "@better-auth/expo/client";
import { organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

const apiAccessTokenKey = "flow.better-auth.bearer-token";
const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000";
const authBaseUrl = process.env.EXPO_PUBLIC_AUTH_BASE_URL ?? apiBaseUrl;

export const mobileApiTokenStorage = {
  get: async () => (await SecureStore.getItemAsync(apiAccessTokenKey)) ?? undefined,
  set: (token: string) => SecureStore.setItemAsync(apiAccessTokenKey, token),
  clear: () => SecureStore.deleteItemAsync(apiAccessTokenKey),
};

configureApiClient({
  baseUrl: apiBaseUrl,
  tokenStorage: mobileApiTokenStorage,
});

export const authClient = createAuthClient({
  baseURL: authBaseUrl,
  fetchOptions: {
    auth: {
      token: () => mobileApiTokenStorage.get(),
      type: "Bearer",
    },
    onSuccess: async (ctx) => {
      const token = ctx.response.headers.get("set-auth-token");

      if (token) {
        await setApiAccessToken(token);
      }
    },
  },
  plugins: [
    organizationClient(),
    expoClient({
      scheme: "mobile",
      storage: SecureStore,
      storagePrefix: "flow",
    }),
  ],
});

export async function clearMobileAuthState() {
  await mobileApiTokenStorage.clear();
}
