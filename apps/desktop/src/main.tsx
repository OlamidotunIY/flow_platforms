import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import "@flow/ui/globals.css"
import { configureFlowClients } from '@flow/app-shell/auth'
import { ThemeProvider } from './components/theme-provider.tsx'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'
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
