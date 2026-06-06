import
{
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import
{
  ArrowLeft,
  ArrowRight,
  Bell,
  Check,
  ChevronsUpDown,
  FileText,
  Home,
  Link as LinkIcon,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Star,
  Users,
} from "lucide-react"
import
{
  departmentsControllerCreateDepartmentV1,
  departmentsControllerSetActiveDepartmentV1,
  organizationsControllerSetActiveOrganizationV1,
  type DepartmentSummaryResponseDto,
  type OrganizationSummaryResponseDto,
  type SetActiveDepartmentDto,
} from "@flow/api"
import { Button } from "@flow/ui/components/button"
import
{
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@flow/ui/components/sidebar"
import { TooltipProvider } from "@flow/ui/components/tooltip"
import { WindowTitleBar } from "@flow/ui/components/window-controls"
import { cn } from "@flow/ui/lib/utils"

import { clearFlowAuthState, getFlowAuthClient } from "@flow/api"
import { getDesktopWindowControls, isDesktopPlatform } from "../util/config"
import { PATHS } from "../routing/paths"
import
{
  type FlowUserInfo,
  type WorkspaceContext,
  type WorkspaceSidebarDepartment,
  type WorkspaceSidebarTab,
  useUserStore,
} from "../store/userStore"
import { getWorkspaceSidebar } from "../workspace-context"
import { AppSidebar } from "@flow/ui/components"

function getBreadcrumbPage(pathname: string)
{
  const labels: Record<string, string> = {
    [PATHS.app.account]: "Account",
    [PATHS.app.askAi]: "Ask AI",
    [PATHS.app.billing]: "Billing",
    [PATHS.app.calendar]: "Calendar",
    [PATHS.app.meetings]: "Meeting",
    [PATHS.app.help]: "Help",
    [PATHS.app.home]: "Home",
    [PATHS.app.inbox]: "Inbox",
    [PATHS.app.notifications]: "Notifications",
    [PATHS.app.search]: "Search",
    [PATHS.app.settings]: "Settings",
    [PATHS.app.templates]: "Templates",
    [PATHS.app.trash]: "Trash",
    [PATHS.projects.root]: "Projects",
  }

  if (pathname.startsWith(`${PATHS.projects.root}/`))
  {
    return "Project"
  }

  return labels[pathname] ?? "Workspace"
}

function getLocationKey(location: ReturnType<typeof useLocation>)
{
  return `${location.pathname}${location.search}${location.hash}`
}

function getSidebarTab(pathname: string): WorkspaceSidebarTab
{
  if (
    pathname === PATHS.app.inbox ||
    pathname.startsWith(`${PATHS.app.inbox}/`)
  )
  {
    return "inbox"
  }

  if (pathname === PATHS.app.askAi)
  {
    return "message"
  }

  if (pathname === PATHS.app.meetings || pathname === PATHS.app.calendar)
  {
    return "meeting"
  }

  return "home"
}

type WorkspaceHeaderProps = {
  activeDepartment: WorkspaceSidebarDepartment | DepartmentSummaryResponseDto | null
  activeOrganization: FlowUserInfo["activeOrganization"]
  isDesktop: boolean
  onCreateDepartment: () => void
  onDepartmentChange: (
    department: WorkspaceSidebarDepartment | DepartmentSummaryResponseDto
  ) => void
  onOrganizationChange: (
    organization:
      | NonNullable<FlowUserInfo["activeOrganization"]>
      | OrganizationSummaryResponseDto
  ) => void
  organizations: Array<
    NonNullable<FlowUserInfo["activeOrganization"]> | OrganizationSummaryResponseDto
  >
  pageIcon?: string | null
  pageTitle: string
  sidebarOffset: string
}

function WorkspaceHeader({
  activeDepartment,
  activeOrganization,
  isDesktop,
  onCreateDepartment,
  onDepartmentChange,
  onOrganizationChange,
  organizations,
  pageIcon,
  pageTitle,
  sidebarOffset,
}: WorkspaceHeaderProps)
{
  const [openMenu, setOpenMenu] = useState<
    "organization" | "department" | null
  >(null)

  useEffect(() =>
  {
    function closeMenu()
    {
      setOpenMenu(null)
    }

    window.addEventListener("click", closeMenu)
    return () => window.removeEventListener("click", closeMenu)
  }, [])

  return (
    <header
      className={cn(
        "relative z-30 flex h-11 w-full shrink-0 items-center justify-between gap-4 border-b bg-background px-3",
        "transition-[margin,width] duration-200 ease-linear md:ml-(--workspace-header-sidebar-offset) md:w-[calc(100%-var(--workspace-header-sidebar-offset))]"
      )}
      style={
        {
          "--workspace-header-sidebar-offset": sidebarOffset,
        } as CSSProperties
      }
    >
      <div className="flex min-w-0 items-center gap-1.5">
        {!isDesktop ? <HeaderSidebarToggle /> : null}
        <div className="relative">
          <Button
            aria-expanded={openMenu === "organization"}
            className="h-8 max-w-56 justify-start gap-1.5 px-2 text-sm font-medium"
            onClick={(event) =>
            {
              event.stopPropagation()
              setOpenMenu((current) =>
                current === "organization" ? null : "organization"
              )
            }}
            type="button"
            variant="ghost"
          >
            <span className="grid size-5 shrink-0 place-items-center rounded bg-amber-600/80 text-[0.65rem] font-semibold text-white">
              {activeOrganization?.name?.charAt(0)?.toUpperCase() ?? "O"}
            </span>
            <span className="truncate">
              {activeOrganization?.name ?? "Organization"}
            </span>
          </Button>
          {openMenu === "organization" ? (
            <div
              className="absolute top-[calc(100%+0.5rem)] left-0 z-[300] min-w-72 rounded-lg bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-border"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                Organizations
              </div>
              {organizations.map((organization) => (
                <button
                  className="flex min-h-9 w-full items-center gap-2 rounded-md px-2 py-1 text-left text-sm hover:bg-muted"
                  key={organization.id}
                  onClick={() =>
                  {
                    setOpenMenu(null)
                    onOrganizationChange(organization)
                  }}
                  type="button"
                >
                  <span className="min-w-0 flex-1 truncate">
                    {organization.name}
                  </span>
                  {organization.id === activeOrganization?.id ? (
                    <Check className="size-4 text-muted-foreground" />
                  ) : null}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        {activeDepartment ? (
          <>
            <span className="text-muted-foreground/60">/</span>
            <div className="relative">
              <Button
                aria-expanded={openMenu === "department"}
                className="h-8 max-w-48 justify-start gap-1.5 px-2 text-sm font-medium"
                onClick={(event) =>
                {
                  event.stopPropagation()
                  setOpenMenu((current) =>
                    current === "department" ? null : "department"
                  )
                }}
                type="button"
                variant="ghost"
              >
                <span className="grid size-5 shrink-0 place-items-center rounded border text-[0.65rem] text-muted-foreground">
                  {activeDepartment.name?.charAt(0)?.toUpperCase() ?? "D"}
                </span>
                <span className="truncate">
                  {activeDepartment?.name ?? "Department"}
                </span>
              </Button>
              {openMenu === "department" ? (
                <div
                  className="absolute top-[calc(100%+0.5rem)] left-0 z-[300] min-w-64 rounded-lg bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-border"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    Departments
                  </div>
                  {activeOrganization?.departments.map((department) => (
                    <button
                      className="flex min-h-9 w-full items-center gap-2 rounded-md px-2 py-1 text-left text-sm hover:bg-muted"
                      key={department.id}
                      onClick={() =>
                      {
                        setOpenMenu(null)
                        onDepartmentChange(department)
                      }}
                      type="button"
                    >
                      <span className="min-w-0 flex-1 truncate">
                        {department.name}
                      </span>
                      {department.id === activeDepartment?.id ? (
                        <Check className="size-4 text-muted-foreground" />
                      ) : null}
                    </button>
                  ))}
                  <div className="-mx-1 my-1 h-px bg-border/50" />
                  <button
                    className="flex min-h-9 w-full items-center gap-2 rounded-md px-2 py-1 text-left text-sm hover:bg-muted"
                    onClick={() =>
                    {
                      setOpenMenu(null)
                      onCreateDepartment()
                    }}
                    type="button"
                  >
                    <Plus className="size-4 text-muted-foreground" />
                    <span>Create department</span>
                  </button>
                </div>
              ) : null}
            </div>
          </>
        ) : null}
        <span className="text-muted-foreground/60">/</span>
        <div className="flex min-w-0 items-center gap-1.5 rounded-md px-2 py-1 text-sm font-semibold">
          <span className="grid size-5 shrink-0 place-items-center rounded border bg-muted/40 text-muted-foreground">
            {pageIcon === "home" ? (
              <Home className="size-3.5" />
            ) : (
              <FileText className="size-3.5" />
            )}
          </span>
          <span className="truncate">{pageTitle}</span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <span className="mr-2 hidden text-xs text-muted-foreground md:inline">
          Edited 1d ago
        </span>
        <Button
          className="hidden h-8 gap-1.5 md:inline-flex"
          size="sm"
          type="button"
          variant="outline"
        >
          Share
          <ChevronsUpDown className="size-3.5" />
        </Button>
        <Button
          aria-label="Search"
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <Search />
        </Button>
        <Button
          aria-label="Team switcher"
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <Users />
        </Button>
        <Button
          aria-label="Notifications"
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <Bell />
        </Button>
        <Button
          aria-label="Copy link"
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <LinkIcon className="size-4" />
        </Button>
        <Button
          aria-label="Favorite"
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <Star className="size-4" />
        </Button>
        <Button
          aria-label="More actions"
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </div>
    </header>
  )
}

function HeaderSidebarToggle()
{
  const { state, toggleSidebar } = useSidebar()

  if (state !== "collapsed")
  {
    return null
  }

  return (
    <Button
      aria-label="Expand sidebar"
      onClick={toggleSidebar}
      size="icon-sm"
      type="button"
      variant="ghost"
    >
      <Menu className="size-4" />
    </Button>
  )
}

function DesktopNavigationControls({
  canGoBack,
  canGoForward,
  onBack,
  onForward,
}: {
  canGoBack: boolean
  canGoForward: boolean
  onBack: () => void
  onForward: () => void
})
{
  const { state } = useSidebar()

  return (
    <div className="flex items-center gap-1 [-webkit-app-region:no-drag]">
      {state === "collapsed" ? (
        <SidebarTrigger className="[-webkit-app-region:no-drag]" />
      ) : null}
      <Button
        aria-label="Go back"
        className="[-webkit-app-region:no-drag]"
        disabled={!canGoBack}
        onClick={onBack}
        size="icon-sm"
        type="button"
        variant="ghost"
      >
        <ArrowLeft />
      </Button>
      <Button
        aria-label="Go forward"
        className="[-webkit-app-region:no-drag]"
        disabled={!canGoForward}
        onClick={onForward}
        size="icon-sm"
        type="button"
        variant="ghost"
      >
        <ArrowRight />
      </Button>
    </div>
  )
}

export function MainLayout()
{
  const authClient = getFlowAuthClient()
  const windowControls = getDesktopWindowControls()
  const userInfo = useUserStore((state) => state.userInfo)
  const setWorkspaceContext = useUserStore((state) => state.setWorkspaceContext)
  const location = useLocation()
  const navigate = useNavigate()
  const isDesktop = isDesktopPlatform()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [routeHistory, setRouteHistory] = useState(() => [
    getLocationKey(location),
  ])
  const [routeHistoryIndex, setRouteHistoryIndex] = useState(0)
  const navigationIntent = useRef<"back" | "forward" | null>(null)
  const currentLocationKey = getLocationKey(location)
  const activeSidebarTab = getSidebarTab(location.pathname)
  const activeOrganization = userInfo?.activeOrganization ?? null
  const organizations = userInfo?.activeOrganization
    ? [
      userInfo.activeOrganization,
      ...(userInfo.organizations ?? []).filter(
        (organization) => organization.id !== userInfo.activeOrganization?.id
      ),
    ]
    : []
  const activeDepartment = activeOrganization?.activeDepartment ?? null
  const hasSidebar = Boolean(userInfo && activeOrganization?.id)
  const currentPage = [
    ...(activeOrganization?.departments?.flatMap(
      (department) => department.pages ?? []
    ) ?? []),
    ...(activeOrganization?.teams?.flatMap((team) => team.pages ?? []) ?? []),
    ...(activeOrganization?.pages ?? []),
  ]
    .find((page) => location.pathname === PATHS.pages.detail(page.id))
  const pageTitle = currentPage?.title ?? getBreadcrumbPage(location.pathname)
  const pageIcon =
    typeof currentPage?.icon === "string" ? currentPage.icon : null
  const sidebarOffset = !hasSidebar
    ? "0px"
    : sidebarOpen
      ? "var(--sidebar-width)"
      : "0px"
  const canGoBack = routeHistoryIndex > 0 && currentLocationKey !== PATHS.root
  const canGoForward = routeHistoryIndex < routeHistory.length - 1

  useEffect(() =>
  {
    const intent = navigationIntent.current
    navigationIntent.current = null

    if (intent)
    {
      return
    }

    setRouteHistory((history) =>
    {
      if (history[routeHistoryIndex] === currentLocationKey)
      {
        return history
      }

      const nextHistory = history.slice(0, routeHistoryIndex + 1)
      nextHistory.push(currentLocationKey)
      setRouteHistoryIndex(nextHistory.length - 1)

      return nextHistory
    })
  }, [currentLocationKey, routeHistoryIndex])

  useEffect(() =>
  {
    if (!userInfo?.user)
    {
      return
    }

    let mounted = true

    getWorkspaceSidebar(activeSidebarTab).then((result) =>
    {
      if (!mounted || result.error || !result.data)
      {
        return
      }

      setWorkspaceContext(result.data as WorkspaceContext)
    })

    return () =>
    {
      mounted = false
    }
  }, [activeSidebarTab, setWorkspaceContext, userInfo?.user])

  function goBack()
  {
    if (!canGoBack)
    {
      return
    }

    const nextIndex = routeHistoryIndex - 1
    navigationIntent.current = "back"
    setRouteHistoryIndex(nextIndex)
    navigate(routeHistory[nextIndex])
  }

  function goForward()
  {
    if (!canGoForward)
    {
      return
    }

    const nextIndex = routeHistoryIndex + 1
    navigationIntent.current = "forward"
    setRouteHistoryIndex(nextIndex)
    navigate(routeHistory[nextIndex])
  }

  const signOut = useCallback(async () =>
  {
    await authClient.signOut()
    await clearFlowAuthState()

    if (isDesktopPlatform())
    {
      await windowControls?.openAuth()
      return
    }

    window.location.assign(PATHS.auth.login)
  }, [authClient, windowControls])

  async function refreshWorkspaceContext(tab: WorkspaceSidebarTab = activeSidebarTab)
  {
    const result = await getWorkspaceSidebar(tab)

    if (!result.error && result.data)
    {
      setWorkspaceContext(result.data as WorkspaceContext)
    }
  }

  async function changeOrganization(
    organization:
      | NonNullable<FlowUserInfo["activeOrganization"]>
      | OrganizationSummaryResponseDto
  )
  {
    const result = await organizationsControllerSetActiveOrganizationV1({
      body: { organizationId: organization.id },
    })
    if (!result.error && result.data)
    {
      setWorkspaceContext(result.data as unknown as WorkspaceContext)
    } else
    {
      await refreshWorkspaceContext("home")
    }
    navigate(PATHS.root)
  }

  async function changeDepartment(
    department: WorkspaceSidebarDepartment | DepartmentSummaryResponseDto
  )
  {
    const result = await departmentsControllerSetActiveDepartmentV1({
      body: { departmentId: department.id } as unknown as SetActiveDepartmentDto,
    })
    if (!result.error && result.data)
    {
      setWorkspaceContext(result.data as unknown as WorkspaceContext)
    } else
    {
      await refreshWorkspaceContext("home")
    }
    navigate(PATHS.root)
  }

  async function clearDepartment()
  {
    const result = await departmentsControllerSetActiveDepartmentV1({
      body: { departmentId: null } as unknown as SetActiveDepartmentDto,
    })
    if (!result.error && result.data)
    {
      setWorkspaceContext(result.data as unknown as WorkspaceContext)
    } else
    {
      await refreshWorkspaceContext("home")
    }
    navigate(PATHS.root)
  }

  async function createDepartment()
  {
    if (!activeOrganization)
    {
      return
    }

    const departmentName = window.prompt("Department name")

    if (!departmentName?.trim())
    {
      return
    }

    const result = await departmentsControllerCreateDepartmentV1({
      body: {
        name: departmentName.trim(),
        organizationId: activeOrganization.id,
      },
    })

    if (!result.error && result.data)
    {
      setWorkspaceContext(result.data as unknown as WorkspaceContext)
    } else
    {
      await refreshWorkspaceContext("home")
    }
  }

  return (
    <div className="min-h-svh bg-background text-foreground">
      <TooltipProvider>
        <SidebarProvider
          className="min-h-svh flex-col bg-background"
          onOpenChange={setSidebarOpen}
          open={sidebarOpen}
        >
          {isDesktop ? (
            <WindowTitleBar
              onClose={windowControls?.close}
              onMaximize={windowControls?.toggleMaximize}
              onMinimize={windowControls?.minimize}
            >
              <DesktopNavigationControls
                canGoBack={canGoBack}
                canGoForward={canGoForward}
                onBack={goBack}
                onForward={goForward}
              />
            </WindowTitleBar>
          ) : null}
          <WorkspaceHeader
            activeDepartment={activeDepartment}
            activeOrganization={activeOrganization}
            isDesktop={isDesktop}
            onCreateDepartment={createDepartment}
            onDepartmentChange={changeDepartment}
            onOrganizationChange={changeOrganization}
            organizations={organizations}
            pageIcon={pageIcon}
            pageTitle={pageTitle}
            sidebarOffset={sidebarOffset}
          />
          <div className="relative flex flex-1">
            <AppSidebar
              activeDepartment={activeDepartment}
              activeOrganizationId={activeOrganization?.id}
              className="top-0 h-svh"
              onDepartmentChange={changeDepartment}
              onDepartmentClear={clearDepartment}
              onOrganizationChange={changeOrganization}
              onSignOut={() =>
              {
                void signOut()
              }}
            />
            <SidebarInset className="min-w-0">
              <div className="flex flex-1 flex-col gap-4 p-4">
                <Outlet />
              </div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </TooltipProvider>
    </div>
  )
}
