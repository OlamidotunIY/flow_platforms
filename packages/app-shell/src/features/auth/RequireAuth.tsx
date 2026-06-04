import { Navigate, Outlet, useNavigate } from "react-router-dom"
import { useEffect, useRef, useState } from "react"
import {
  usersControllerGetUserInfoV1,
  workspaceSetupControllerRetryV1,
} from "@flow/api"
import { Skeleton } from "@flow/ui/components/skeleton"
import { Button } from "@flow/ui/components/button"

import { getFlowAuthClient } from "../../auth"
import { getDesktopWindowControls, isDesktopPlatform } from "../../config"
import { PATHS } from "../../routing/paths"
import {
  type WorkspaceContext,
  type FlowUser,
  useUserStore,
} from "../../store/userStore"
import { PageError } from "../../components/page-state"
import { connectWorkspaceSetupSocket } from "../../workspace-socket"
import { getWorkspaceSidebar } from "../../workspace-context"

function isMeResponse(value: unknown): value is { user: FlowUser } {
  return (
    typeof value === "object" &&
    value !== null &&
    "user" in value &&
    typeof (value as { user?: unknown }).user === "object"
  )
}

function isWorkspaceContext(value: unknown): value is WorkspaceContext {
  return (
    typeof value === "object" &&
    value !== null &&
    "workspaceSetupStatus" in value &&
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
  const replaceUserInfoFromSetup = useUserStore(
    (state) => state.replaceUserInfoFromSetup
  )
  const setUser = useUserStore((state) => state.setUser)
  const setWorkspaceContext = useUserStore((state) => state.setWorkspaceContext)
  const setUserInfoStatus = useUserStore((state) => state.setUserInfoStatus)
  const userInfo = useUserStore((state) => state.userInfo)
  const userInfoStatus = useUserStore((state) => state.userInfoStatus)
  const workspaceSetupStatus = useUserStore(
    (state) => state.workspaceSetupStatus
  )
  const isSettingUp =
    Boolean(session.data) &&
    (workspaceSetupStatus === "PENDING" ||
      workspaceSetupStatus === "PROCESSING" ||
      (userInfo?.workspaceSetupStatus
        ? ["PENDING", "PROCESSING"].includes(userInfo.workspaceSetupStatus)
        : false))

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
      setWorkspaceContext(null)
      return
    }

    const userId = session.data.user.id

    if (
      userInfoStatus === "success" &&
      activeRequestUserId.current === userId
    ) {
      return
    }

    if (
      activeRequestUserId.current === userId &&
      userInfoStatus === "loading"
    ) {
      return
    }

    activeRequestUserId.current = userId
    setUserInfoStatus("loading")

    usersControllerGetUserInfoV1()
      .then(async (result) => {
        if (result.error || !isMeResponse(result.data)) {
          activeRequestUserId.current = null
          setUserInfoStatus("error")
          return
        }

        setUser(result.data.user)
        const contextResult = await getWorkspaceSidebar("home")

        if (
          contextResult.error ||
          !isWorkspaceContext(contextResult.data)
        ) {
          activeRequestUserId.current = null
          setUserInfoStatus("error")
          return
        }

        setSetupError(null)
        setWorkspaceContext(contextResult.data)
      })
      .catch(() => {
        activeRequestUserId.current = null
        setUserInfoStatus("error")
      })
  }, [
    session.data,
    session.isPending,
    setUser,
    setUserInfoStatus,
    setWorkspaceContext,
    userInfoStatus,
  ])

  useEffect(() => {
    if (!isSettingUp) {
      return
    }

    let cleanup: (() => void) | undefined
    let cancelled = false

    connectWorkspaceSetupSocket({
      onCompleted: (payload) => {
        if (cancelled) {
          return
        }
        replaceUserInfoFromSetup(payload)
        setSetupError(null)
        navigate(PATHS.root, { replace: true })
      },
      onFailed: (payload) => {
        if (cancelled) {
          return
        }
        setSetupError(payload.errorMessage ?? "Workspace setup failed.")
      },
    }).then((disconnect) => {
      if (cancelled) {
        disconnect()
        return
      }
      cleanup = disconnect
    })

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [isSettingUp, navigate, replaceUserInfoFromSetup])

  useEffect(() => {
    if (!isSettingUp) {
      return
    }

    let cancelled = false

    async function refreshSetupState() {
      const result = await usersControllerGetUserInfoV1()

      if (cancelled || result.error || !isMeResponse(result.data)) {
        return
      }

      setUser(result.data.user)
      const contextResult = await getWorkspaceSidebar("home")
      if (
        cancelled ||
        contextResult.error ||
        !isWorkspaceContext(contextResult.data)
      ) {
        return
      }

      setWorkspaceContext(contextResult.data)

      if (
        contextResult.data.workspaceSetupStatus === "COMPLETED" &&
        contextResult.data.activeOrganization
      ) {
        replaceUserInfoFromSetup(contextResult.data)
        setSetupError(null)
        navigate(PATHS.root, { replace: true })
        return
      }

      if (contextResult.data.workspaceSetupStatus === "FAILED") {
        setSetupError("Workspace setup failed.")
      }
    }

    void refreshSetupState()
    const intervalId = window.setInterval(() => {
      void refreshSetupState()
    }, 2500)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [
    isSettingUp,
    navigate,
    replaceUserInfoFromSetup,
    setUser,
    setWorkspaceContext,
  ])

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
      <WorkspaceLoadingShell
        description="We are creating your organization pages, views, teams, docs, meetings, and default fields."
        error={setupError}
        onRetry={() => {
          setSetupError(null)
          void workspaceSetupControllerRetryV1()
        }}
        title="Setting up workspace"
      />
    )
  }

  if (
    session.isPending ||
    (session.data &&
      (userInfoStatus === "idle" || userInfoStatus === "loading"))
  ) {
    return (
      <WorkspaceLoadingShell
        description="Preparing your sidebar, dashboard, and workspace context."
        title="Loading workspace"
      />
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

function WorkspaceLoadingShell({
  description,
  error,
  onRetry,
  title,
}: {
  description: string
  error?: string | null
  onRetry?: () => void
  title: string
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
          <h1 className="font-heading text-xl font-semibold">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          {error ? (
            <>
              <p className="mt-4 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </p>
              {onRetry ? (
                <Button className="mt-4" onClick={onRetry} type="button">
                  Retry setup
                </Button>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </main>
  )
}
