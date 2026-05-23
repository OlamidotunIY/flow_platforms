import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import "@flow/ui/globals.css"
import { configureFlowClients } from '@flow/app-shell/auth'
import { ThemeProvider } from './components/theme-provider.tsx'

const defaultBaseUrl = import.meta.env.DEV
  ? window.location.origin
  : 'http://localhost:3000'
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? defaultBaseUrl
const authBaseUrl = import.meta.env.VITE_AUTH_BASE_URL ?? apiBaseUrl

configureFlowClients({
  apiBaseUrl,
  authBaseUrl,
  platform: 'desktop',
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)

// Use contextBridge
window.ipcRenderer.on('main-process-message', (_event, message) =>
{
  console.log(message)
})
