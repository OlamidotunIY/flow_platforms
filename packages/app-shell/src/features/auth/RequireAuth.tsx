import { Navigate, Outlet } from "react-router-dom"
import { useEffect, useRef } from "react"
import { usersControllerGetUserInfoV1 } from "@flow/api"
import { LoaderBody, ScreenLoader } from "@flow/ui/components/screen-loader"

import { getFlowAuthClient } from "../../auth"
import { getDesktopWindowControls, isDesktopPlatform } from "../../config"
import { PATHS } from "../../routing/paths"
import { type FlowUserInfo, useUserStore } from "../../store/userStore"

function isFlowUserInfo(value: unknown): value is FlowUserInfo {
  return (
    typeof value === "object" &&
    value !== null &&
    "user" in value &&
    typeof (value as { user?: unknown }).user === "object" &&
    "activeOrganization" in value
  )
}

export function RequireAuth() {
  const authClient = getFlowAuthClient()
  const session = authClient.useSession()
  const windowControls = getDesktopWindowControls()
  const activeRequestUserId = useRef<string | null>(null)
  const setUserInfo = useUserStore((state) => state.setUserInfo)
  const setUserInfoStatus = useUserStore((state) => state.setUserInfoStatus)
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

  useEffect(() => {
    if (session.isPending) {
      return
    }

    if (!session.data) {
      activeRequestUserId.current = null
      setUserInfo(null)
      return
    }

    const userId = session.data.user.id

    if (
      userInfoStatus === "success" &&
      activeRequestUserId.current === userId
    ) {
      return
    }

    if (activeRequestUserId.current === userId && userInfoStatus === "loading") {
      return
    }

    activeRequestUserId.current = userId
    setUserInfoStatus("loading")

    usersControllerGetUserInfoV1()
      .then((result) => {
        if (result.error || !isFlowUserInfo(result.data)) {
          activeRequestUserId.current = null
          setUserInfoStatus("error")
          return
        }

        setUserInfo(result.data)
      })
      .catch(() => {
        activeRequestUserId.current = null
        setUserInfoStatus("error")
      })
  }, [
    session.data,
    session.isPending,
    setUserInfo,
    setUserInfoStatus,
    userInfoStatus,
  ])

  if (session.data && userInfoStatus === "error") {
    return (
      <main className="grid min-h-svh place-items-center overflow-hidden bg-background p-6 text-foreground">
        <div className="flex min-h-32 w-full max-w-md flex-col justify-center gap-3 rounded-xl border bg-card/80 px-8 py-10 text-sm shadow-sm">
          <div className="font-medium">Could not load your workspace.</div>
          <p className="text-muted-foreground">
            The user info endpoint did not return the active organization,
            department, and projects needed to open Flow.
          </p>
        </div>
      </main>
    )
  }

  if (
    session.isPending ||
    (session.data &&
      (userInfoStatus === "idle" || userInfoStatus === "loading"))
  ) {
    if (isDesktopPlatform()) {
      return (
        <main className="grid min-h-svh place-items-center overflow-hidden bg-background p-6 text-foreground">
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
