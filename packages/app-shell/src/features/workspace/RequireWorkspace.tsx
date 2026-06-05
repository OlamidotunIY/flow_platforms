import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom"
import { useEffect, useRef, useState } from "react"
import {
  connectWorkspaceSetupSocket,
  getFlowAuthClient,
  usersControllerGetUserInfoV1,
  workspaceSetupControllerRetryV1,
} from "@flow/api"

import { PageError } from "../../components/page-state"
import { PATHS } from "../../routing/paths"
import {
  type FlowUser,
  type WorkspaceContext,
  useUserStore,
} from "../../store/userStore"
import { getWorkspaceSidebar } from "../../workspace-context"
import { WorkspaceLoadingShell } from "./components/WorkspaceLoadingShell"

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

function isWorkspaceSetupPending(
  status: WorkspaceContext["workspaceSetupStatus"] | null
) {
  return status === "PENDING" || status === "PROCESSING"
}

export function RequireWorkspace() {
  const authClient = getFlowAuthClient()
  const session = authClient.useSession()
  const location = useLocation()
  const navigate = useNavigate()
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
  const isWorkspaceRoute = location.pathname.startsWith(PATHS.workspace.root)
  const isSettingUp =
    Boolean(session.data) &&
    (isWorkspaceSetupPending(workspaceSetupStatus) ||
      (userInfo?.workspaceSetupStatus
        ? isWorkspaceSetupPending(userInfo.workspaceSetupStatus)
        : false))
  const isSetupFailed =
    workspaceSetupStatus === "FAILED" ||
    userInfo?.workspaceSetupStatus === "FAILED"
  const isWorkspaceReady =
    workspaceSetupStatus === "COMPLETED" &&
    Boolean(userInfo?.activeOrganization)

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

        if (contextResult.error || !isWorkspaceContext(contextResult.data)) {
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

    connectWorkspaceSetupSocket<WorkspaceContext, { errorMessage?: string }>({
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

  if (userInfoStatus === "error") {
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

  if (isSetupFailed) {
    if (!isWorkspaceRoute) {
      return <Navigate to={PATHS.workspace.create} replace />
    }

    return <Outlet />
  }

  if (isWorkspaceReady) {
    if (isWorkspaceRoute) {
      return <Navigate to={PATHS.root} replace />
    }

    return <Outlet />
  }

  return (
    <WorkspaceLoadingShell
      description="Preparing your sidebar, dashboard, and workspace context."
      title="Loading workspace"
    />
  )
}
