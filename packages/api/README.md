# @flow/api

Shared API package for the Flow apps.

## Generate the client

By default, codegen reads `openapi/swagger.json` and writes the generated
client, SDK functions, and types to `src/generated`.

```sh
pnpm --filter @flow/api codegen
```

To generate from a live Swagger/OpenAPI endpoint or another spec file:

```sh
FLOW_API_OPENAPI=https://localhost:3000/swagger/v1/swagger.json pnpm --filter @flow/api codegen
```

On PowerShell:

```powershell
$env:FLOW_API_OPENAPI = "https://localhost:3000/swagger/v1/swagger.json"
pnpm --filter @flow/api codegen
```

You can also put the value in `packages/api/.env` or the repo root `.env`:

```env
FLOW_API_OPENAPI=https://localhost:3000/swagger/v1/swagger.json
```

Apps can import generated operations and types from `@flow/api`, or use
`configureApiClient` once during app startup:

```ts
import { configureApiClient } from "@flow/api";

configureApiClient({
  baseUrl: "https://api.example.com",
  getAccessToken: () => localStorage.getItem("access_token") ?? undefined,
});
```
