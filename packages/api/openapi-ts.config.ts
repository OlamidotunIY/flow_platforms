import { defineConfig } from "@hey-api/openapi-ts";
import { readFileSync } from "node:fs";

const env = readFileSync(new URL("./.env", import.meta.url), "utf8");
const input = env.match(/^FLOW_API_OPENAPI=(.+)$/m)?.[1]?.trim();

if (!input) {
  throw new Error("Missing FLOW_API_OPENAPI in packages/api/.env");
}

export default defineConfig({
  input,
  output: {
    clean: true,
    path: "./src/generated",
  },
  plugins: ["@hey-api/typescript", "@hey-api/sdk", "@hey-api/client-fetch"],
});
