import { Navigate, Outlet } from "react-router-dom"
import { useEffect } from "react"

import { getFlowAuthClient } from "@flow/api"
import { getDesktopWindowControls, isDesktopPlatform } from "../../util/config"
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
    return null
  }

  if (!session.data) {
    if (isDesktopPlatform()) {
      return null
    }

    return <Navigate to={PATHS.auth.login} replace />
  }

  return <Outlet />
}
