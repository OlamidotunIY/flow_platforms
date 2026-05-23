import { Navigate, Outlet } from "react-router-dom"
import { useEffect } from "react"
import { LoaderBody, ScreenLoader } from "@flow/ui/components/screen-loader"

import { getFlowAuthClient } from "../../auth"
import { getDesktopWindowControls, isDesktopPlatform } from "../../config"
import { PATHS } from "../../routing/paths"
import { useUserStore } from "../../store/userStore"

export function RequireAuth() {
  const authClient = getFlowAuthClient()
  const session = authClient.useSession()
  const windowControls = getDesktopWindowControls()
  const userInfoStatus = useUserStore((state) => state.userInfoStatus)

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

  if (
    session.isPending ||
    (session.data &&
      (userInfoStatus === "idle" || userInfoStatus === "loading"))
  ) {
    if (isDesktopPlatform()) {
      return (
        <main className="grid min-h-svh place-items-center overflow-hidden bg-background text-foreground">
          <LoaderBody label="Loading your workspace..." />
        </main>
      )
    }

    return <ScreenLoader label="Loading your workspace..." mode="page" />
  }

  if (!session.data) {
    if (isDesktopPlatform()) {
      return null
    }

    return <Navigate to={PATHS.auth.login} replace />
  }

  return <Outlet />
}
