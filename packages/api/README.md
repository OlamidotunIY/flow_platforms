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

Use generated REST operations directly from `@flow/api`, or use `restApiClient`
for custom endpoints that are not in the OpenAPI schema yet.

Use `connectFlowSocket` for realtime events. Consumers provide the event map
they need, and the API package handles the Socket.IO URL, credentials, and
bearer-token auth:

```ts
const connection = await connectFlowSocket({
  events: {
    "workspace.setup.completed": (payload) => {
      // update app state
    },
  },
})

connection.disconnect()
```
