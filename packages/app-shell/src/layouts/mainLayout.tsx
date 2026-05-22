import { Link, Outlet } from "react-router-dom"
import { LogOut, MessageSquare, UserRound, Workflow } from "lucide-react"
import { Button } from "@flow/ui/components/button"
import { WindowTitleBar } from "@flow/ui/components/window-controls"

import { clearFlowAuthState, getFlowAuthClient } from "../auth"
import { getDesktopWindowControls, isDesktopPlatform } from "../config"
import { PATHS } from "../routing/paths"
import { useUserStore } from "../store/userStore"

export function MainLayout() {
  const authClient = getFlowAuthClient()
  const windowControls = getDesktopWindowControls()
  const user = useUserStore((state) => state.user)

  async function signOut() {
    await authClient.signOut()
    await clearFlowAuthState()

    if (isDesktopPlatform()) {
      await windowControls?.openAuth()
      return
    }

    window.location.assign(PATHS.auth.login)
  }

  return (
    <div className="min-h-svh bg-background text-foreground">
      {isDesktopPlatform() ? (
        <WindowTitleBar
          onClose={windowControls?.close}
          onMaximize={windowControls?.toggleMaximize}
          onMinimize={windowControls?.minimize}
        >
          Flow Desktop
        </WindowTitleBar>
      ) : null}
      <aside
        className={`fixed inset-y-0 left-0 hidden w-60 border-r bg-card/40 p-4 md:flex md:flex-col ${isDesktopPlatform() ? "top-10" : ""}`}
      >
        <div className="mb-8 flex items-center gap-2 text-sm font-semibold">
          <Workflow data-icon="inline-start" />
          Flow
        </div>
        <nav className="flex flex-col gap-1 text-sm">
          <Link className="rounded-md px-2 py-1.5 hover:bg-muted" to={PATHS.messages.root}>
            <MessageSquare data-icon="inline-start" />
            Messages
          </Link>
        </nav>
        <div className="mt-auto flex flex-col gap-2">
          <div className="flex items-center gap-2 rounded-md bg-muted px-2 py-2 text-xs">
            <UserRound data-icon="inline-start" />
            <span className="truncate">{user?.email}</span>
          </div>
          <Button className="justify-start" onClick={signOut} variant="ghost">
            <LogOut data-icon="inline-start" />
            Sign out
          </Button>
        </div>
      </aside>
      <main className="md:pl-60">
        <header className="flex h-14 items-center justify-between border-b px-4">
          <div className="text-sm font-medium">Flow</div>
          <Button onClick={signOut} size="sm" variant="outline">
            <LogOut data-icon="inline-start" />
            Sign out
          </Button>
        </header>
        <div className="p-4">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
