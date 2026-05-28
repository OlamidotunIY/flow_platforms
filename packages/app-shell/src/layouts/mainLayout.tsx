import { useCallback, useEffect, useRef, useState } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Check,
  ChevronsUpDown,
  Plus,
  Search,
  Users,
} from "lucide-react"
import {
  departmentsControllerCreateDepartmentV1,
  departmentsControllerSetActiveDepartmentV1,
  organizationsControllerSetActiveOrganizationV1,
  usersControllerGetUserInfoV1,
  type ActiveDepartmentResponseDto,
  type ActiveOrganizationResponseDto,
  type DepartmentSummaryResponseDto,
  type OrganizationSummaryResponseDto,
} from "@flow/api"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@flow/ui/components/breadcrumb"
import { Button } from "@flow/ui/components/button"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@flow/ui/components/sidebar"
import { TooltipProvider } from "@flow/ui/components/tooltip"
import { WindowTitleBar } from "@flow/ui/components/window-controls"

import { clearFlowAuthState, getFlowAuthClient } from "../auth"
import { getDesktopWindowControls, isDesktopPlatform } from "../config"
import { PATHS } from "../routing/paths"
import { useUserStore } from "../store/userStore"
import { AppSidebar } from "./AppSidebar"

function getBreadcrumbPage(pathname: string) {
  const labels: Record<string, string> = {
    [PATHS.app.account]: "Account",
    [PATHS.app.askAi]: "Ask AI",
    [PATHS.app.billing]: "Billing",
    [PATHS.app.calendar]: "Calendar",
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

  if (pathname.startsWith(`${PATHS.projects.root}/`)) {
    return "Project"
  }

  return labels[pathname] ?? "Workspace"
}

function getLocationKey(location: ReturnType<typeof useLocation>) {
  return `${location.pathname}${location.search}${location.hash}`
}

type WorkspaceHeaderProps = {
  activeDepartment: ActiveDepartmentResponseDto | DepartmentSummaryResponseDto | null
  activeOrganization: ActiveOrganizationResponseDto | null
  isDesktop: boolean
  onCreateDepartment: () => void
  onDepartmentChange: (department: ActiveDepartmentResponseDto | DepartmentSummaryResponseDto) => void
  onOrganizationChange: (organization: ActiveOrganizationResponseDto | OrganizationSummaryResponseDto) => void
  organizations: Array<ActiveOrganizationResponseDto | OrganizationSummaryResponseDto>
  pageTitle: string
}

function WorkspaceHeader({
  activeDepartment,
  activeOrganization,
  isDesktop,
  onCreateDepartment,
  onDepartmentChange,
  onOrganizationChange,
  organizations,
  pageTitle,
}: WorkspaceHeaderProps) {
  const [openMenu, setOpenMenu] = useState<"organization" | "department" | null>(
    null
  )

  useEffect(() => {
    function closeMenu() {
      setOpenMenu(null)
    }

    window.addEventListener("click", closeMenu)
    return () => window.removeEventListener("click", closeMenu)
  }, [])

  return (
    <header className="relative z-30 flex h-14 w-full shrink-0 items-center justify-between gap-4 border-b bg-background px-4">
      <div className="flex min-w-0 items-center gap-3">
        {!isDesktop ? <SidebarTrigger className="-ml-1" /> : null}
        <Breadcrumb className="min-w-0">
          <BreadcrumbList className="flex-nowrap text-base text-muted-foreground">
            <BreadcrumbItem className="relative">
              <Button
                aria-expanded={openMenu === "organization"}
                className="h-8 max-w-64 justify-start gap-2 px-2 text-base"
                onClick={(event) => {
                  event.stopPropagation()
                  setOpenMenu((current) =>
                    current === "organization" ? null : "organization"
                  )
                }}
                type="button"
                variant="ghost"
              >
                <span className="truncate">
                  {activeOrganization?.name ?? "Organization"}
                </span>
                <ChevronsUpDown className="size-4 text-muted-foreground" />
              </Button>
              {openMenu === "organization" ? (
                <div
                  className="absolute left-0 top-[calc(100%+0.5rem)] z-[300] min-w-72 rounded-lg bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-border"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    Organizations
                  </div>
                  {organizations.map((organization) => (
                    <button
                      className="flex min-h-9 w-full items-center gap-2 rounded-md px-2 py-1 text-left text-sm hover:bg-muted"
                      key={organization.id}
                      onClick={() => {
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
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem className="relative">
              <Button
                aria-expanded={openMenu === "department"}
                className="h-8 max-w-56 justify-start gap-2 px-2 text-base"
                onClick={(event) => {
                  event.stopPropagation()
                  setOpenMenu((current) =>
                    current === "department" ? null : "department"
                  )
                }}
                type="button"
                variant="ghost"
              >
                <span className="truncate">
                  {activeDepartment?.name ?? "Department"}
                </span>
                <ChevronsUpDown className="size-4 text-muted-foreground" />
              </Button>
              {openMenu === "department" ? (
                <div
                  className="absolute left-0 top-[calc(100%+0.5rem)] z-[300] min-w-64 rounded-lg bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-border"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    Departments
                  </div>
                  {activeOrganization?.departments.map((department) => (
                    <button
                      className="flex min-h-9 w-full items-center gap-2 rounded-md px-2 py-1 text-left text-sm hover:bg-muted"
                      key={department.id}
                      onClick={() => {
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
                    onClick={() => {
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
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-base font-medium">
                {pageTitle}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button aria-label="Search" size="icon-sm" type="button" variant="ghost">
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
      </div>
    </header>
  )
}

export function MainLayout() {
  const authClient = getFlowAuthClient()
  const windowControls = getDesktopWindowControls()
  const userInfo = useUserStore((state) => state.userInfo)
  const setUserInfo = useUserStore((state) => state.setUserInfo)
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
  const pageTitle = getBreadcrumbPage(location.pathname)
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
  const isInboxRoute =
    location.pathname === PATHS.app.inbox ||
    location.pathname.startsWith(`${PATHS.app.inbox}/`)
  const canGoBack =
    routeHistoryIndex > 0 && currentLocationKey !== PATHS.root
  const canGoForward = routeHistoryIndex < routeHistory.length - 1

  useEffect(() => {
    const intent = navigationIntent.current
    navigationIntent.current = null

    if (intent) {
      return
    }

    setRouteHistory((history) => {
      if (history[routeHistoryIndex] === currentLocationKey) {
        return history
      }

      const nextHistory = history.slice(0, routeHistoryIndex + 1)
      nextHistory.push(currentLocationKey)
      setRouteHistoryIndex(nextHistory.length - 1)

      return nextHistory
    })
  }, [currentLocationKey, routeHistoryIndex])

  function goBack() {
    if (!canGoBack) {
      return
    }

    const nextIndex = routeHistoryIndex - 1
    navigationIntent.current = "back"
    setRouteHistoryIndex(nextIndex)
    navigate(routeHistory[nextIndex])
  }

  function goForward() {
    if (!canGoForward) {
      return
    }

    const nextIndex = routeHistoryIndex + 1
    navigationIntent.current = "forward"
    setRouteHistoryIndex(nextIndex)
    navigate(routeHistory[nextIndex])
  }

  const signOut = useCallback(async () => {
    await authClient.signOut()
    await clearFlowAuthState()

    if (isDesktopPlatform()) {
      await windowControls?.openAuth()
      return
    }

    window.location.assign(PATHS.auth.login)
  }, [authClient, windowControls])

  async function refreshUserInfo() {
    const result = await usersControllerGetUserInfoV1()

    if (!result.error && result.data) {
      setUserInfo(result.data)
    }
  }

  async function changeOrganization(
    organization: ActiveOrganizationResponseDto | OrganizationSummaryResponseDto
  ) {
    await organizationsControllerSetActiveOrganizationV1({
      body: { organizationId: organization.id },
    })
    await refreshUserInfo()
  }

  async function changeDepartment(
    department: ActiveDepartmentResponseDto | DepartmentSummaryResponseDto
  ) {
    await departmentsControllerSetActiveDepartmentV1({
      body: { departmentId: department.id },
    })
    await refreshUserInfo()
  }

  async function createDepartment() {
    if (!activeOrganization) {
      return
    }

    const departmentName = window.prompt("Department name")

    if (!departmentName?.trim()) {
      return
    }

    const result = await departmentsControllerCreateDepartmentV1({
      body: {
        name: departmentName.trim(),
        organizationId: activeOrganization.id,
      },
    })

    if (!result.error) {
      await refreshUserInfo()
    }
  }

  return (
    <div className="min-h-svh bg-background text-foreground">
      <TooltipProvider>
        <SidebarProvider
          className="min-h-svh flex-col bg-background"
          onOpenChange={(open) => {
            if (!isInboxRoute) {
              setSidebarOpen(open)
            }
          }}
          open={isInboxRoute ? false : sidebarOpen}
        >
          {isDesktop ? (
            <WindowTitleBar
              onClose={windowControls?.close}
              onMaximize={windowControls?.toggleMaximize}
              onMinimize={windowControls?.minimize}
            >
              <div className="flex items-center gap-1 [-webkit-app-region:no-drag]">
                <SidebarTrigger className="[-webkit-app-region:no-drag]" />
                <Button
                  aria-label="Go back"
                  className="[-webkit-app-region:no-drag]"
                  disabled={!canGoBack}
                  onClick={goBack}
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
                  onClick={goForward}
                  size="icon-sm"
                  type="button"
                  variant="ghost"
                >
                  <ArrowRight />
                </Button>
              </div>
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
            pageTitle={pageTitle}
          />
          <div className="relative flex flex-1">
            <AppSidebar
              activeDepartment={activeDepartment}
              activeOrganizationId={activeOrganization?.id}
              className={
                isDesktop
                  ? "top-24 h-[calc(100svh-6rem)]"
                  : "top-14 h-[calc(100svh-3.5rem)]"
              }
              onSignOut={() => {
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
