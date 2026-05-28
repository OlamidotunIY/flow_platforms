import { Navigate, Outlet, useNavigate } from "react-router-dom"
import { useEffect, useRef, useState } from "react"
import { usersControllerGetUserInfoV1, workspaceSetupControllerRetryV1 } from "@flow/api"
import { Skeleton } from "@flow/ui/components/skeleton"
import { Button } from "@flow/ui/components/button"

import { getFlowAuthClient } from "../../auth"
import { getDesktopWindowControls, isDesktopPlatform } from "../../config"
import { PATHS } from "../../routing/paths"
import { type FlowUserInfo, useUserStore } from "../../store/userStore"
import { PageError, PageLoader } from "../../components/page-state"
import { connectWorkspaceSetupSocket } from "../../workspace-socket"

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
  const navigate = useNavigate()
  const windowControls = getDesktopWindowControls()
  const activeRequestUserId = useRef<string | null>(null)
  const [setupError, setSetupError] = useState<string | null>(null)
  const replaceUserInfoFromSetup = useUserStore((state) => state.replaceUserInfoFromSetup)
  const setUserInfo = useUserStore((state) => state.setUserInfo)
  const setUserInfoStatus = useUserStore((state) => state.setUserInfoStatus)
  const userInfo = useUserStore((state) => state.userInfo)
  const userInfoStatus = useUserStore((state) => state.userInfoStatus)
  const workspaceSetupStatus = useUserStore((state) => state.workspaceSetupStatus)

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

        setSetupError(null)
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

  useEffect(() => {
    if (
      !session.data ||
      !userInfo ||
      !["PENDING", "PROCESSING"].includes(userInfo.workspaceSetupStatus)
    ) {
      return
    }

    let cleanup: (() => void) | undefined

    connectWorkspaceSetupSocket({
      onCompleted: (payload) => {
        replaceUserInfoFromSetup(payload)
        setSetupError(null)
        navigate(PATHS.root, { replace: true })
      },
      onFailed: (payload) => {
        setSetupError(payload.errorMessage ?? "Workspace setup failed.")
      },
    }).then((disconnect) => {
      cleanup = disconnect
    })

    return () => {
      cleanup?.()
    }
  }, [navigate, replaceUserInfoFromSetup, session.data, userInfo])

  const isSettingUp =
    session.data &&
    (workspaceSetupStatus === "PENDING" ||
      workspaceSetupStatus === "PROCESSING" ||
      (userInfo?.workspaceSetupStatus &&
        ["PENDING", "PROCESSING"].includes(userInfo.workspaceSetupStatus)))

  if (session.data && userInfoStatus === "error") {
    return (
      <main className="min-h-svh bg-background p-6 text-foreground">
        <PageError
          message="The user info endpoint did not return the active organization, department, and projects needed to open Flow."
          title="Could not load your workspace"
        />
      </main>
    )
  }

  if (isSettingUp) {
    return (
      <WorkspaceSetupLoading
        error={setupError}
        onRetry={() => {
          setSetupError(null)
          void workspaceSetupControllerRetryV1()
        }}
      />
    )
  }

  if (
    session.isPending ||
    (session.data &&
      (userInfoStatus === "idle" || userInfoStatus === "loading"))
  ) {
    return (
      <main className="min-h-svh bg-background p-6 text-foreground">
        <PageLoader label="Loading your workspace" />
      </main>
    )
  }

  if (!session.data) {
    if (isDesktopPlatform()) {
      return null
    }

    return <Navigate to={PATHS.auth.login} replace />
  }

  return <Outlet />
}

function WorkspaceSetupLoading({
  error,
  onRetry,
}: {
  error?: string | null
  onRetry: () => void
}) {
  return (
    <main className="relative min-h-svh overflow-hidden bg-background text-foreground">
      <div className="grid min-h-svh grid-cols-[17rem_1fr] opacity-70">
        <aside className="border-r bg-sidebar p-3">
          <Skeleton className="mb-5 h-10 rounded-lg" />
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton className="mb-2 h-8 rounded-md" key={index} />
          ))}
        </aside>
        <section className="p-6">
          <Skeleton className="mb-5 h-20 rounded-xl" />
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton className="h-32 rounded-xl" key={index} />
            ))}
          </div>
          <Skeleton className="mt-5 h-80 rounded-xl" />
        </section>
      </div>
      <div className="absolute inset-0 grid place-items-center bg-background/45 backdrop-blur-sm">
        <div className="w-full max-w-sm rounded-2xl border bg-card/95 p-6 text-center shadow-2xl">
          <div className="mx-auto mb-4 size-10 animate-pulse rounded-xl bg-primary/20" />
          <h1 className="font-heading text-xl font-semibold">Setting up workspace</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We are creating your organization pages, views, teams, docs, meetings, and default fields.
          </p>
          {error ? (
            <>
              <p className="mt-4 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </p>
              <Button className="mt-4" onClick={onRetry} type="button">
                Retry setup
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </main>
  )
}
