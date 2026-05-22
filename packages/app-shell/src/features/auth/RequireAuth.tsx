import { Navigate, Outlet } from "react-router-dom"
import { useEffect } from "react"
import { LoaderBody, ScreenLoader } from "@flow/ui/components/screen-loader"

import { getFlowAuthClient } from "../../auth"
import { getDesktopWindowControls, isDesktopPlatform } from "../../config"
import { PATHS } from "../../routing/paths"

export function RequireAuth() {
  const authClient = getFlowAuthClient()
  const session = authClient.useSession()
  const windowControls = getDesktopWindowControls()

  useEffect(() => {
    if (!isDesktopPlatform() || session.isPending) {
      return
    }

    if (session.data) {
      void windowControls?.openApp()
    } else {
      void windowControls?.openAuth()
    }
  }, [session.data, session.isPending, windowControls])

  if (session.isPending) {
    if (isDesktopPlatform()) {
      return (
        <main className="grid min-h-svh place-items-center overflow-hidden bg-background text-foreground">
          <LoaderBody />
        </main>
      )
    }

    return <ScreenLoader mode="page" />
  }

  if (!session.data) {
    if (isDesktopPlatform()) {
      return null
    }

    return <Navigate to={PATHS.auth.login} replace />
  }

  return <Outlet />
}
