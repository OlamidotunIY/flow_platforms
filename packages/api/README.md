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

Apps should configure the shared clients once during startup. This wires the
generated REST client, Better Auth client, and Socket.IO client with the same
base URLs and bearer-token storage:

```ts
import { configureFlowClients } from "@flow/api"

configureFlowClients({
  apiBaseUrl: "https://api.example.com",
  authBaseUrl: "https://api.example.com",
  socketBaseUrl: "https://api.example.com",
})
```

## REST API

Use generated REST operations directly from `@flow/api`. They are grouped by the
OpenAPI schema during code generation, so we do not need hand-written REST
domain files unless an endpoint needs app-specific orchestration.

Use `restApiClient` only for custom endpoints that are not in the OpenAPI schema
yet.

## Socket API

Socket code lives in `src/sockets`:

- `client.ts` owns the Socket.IO connection setup, credentials, namespace, and
  lifecycle.
- `workspace.socket.ts` owns workspace realtime events such as workspace setup.
- `index.ts` is the public socket barrel used by `@flow/api` and
  `@flow/api/socket`.

Use domain socket helpers from `@flow/api` when they exist:

```ts
const disconnect = await connectWorkspaceSetupSocket({
  onCompleted: (payload) => {
    // update workspace state
  },
  onFailed: (payload) => {
    // show setup error
  },
})

disconnect()
```
