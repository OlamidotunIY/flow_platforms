import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "@flow/ui/globals.css"
import { configureFlowClients } from "@flow/app-shell/auth"
import { App } from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"

const defaultBaseUrl = import.meta.env.DEV
  ? window.location.origin
  : "http://localhost:3500"
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? defaultBaseUrl
const authBaseUrl = import.meta.env.VITE_AUTH_BASE_URL ?? apiBaseUrl

configureFlowClients({
  apiBaseUrl,
  authBaseUrl,
  platform: "web",
})

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
)
