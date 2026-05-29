import { useMemo, useState, type ComponentProps } from "react"
import { Check, ChevronsLeft, ChevronsUpDown } from "lucide-react"
import type {
  ActiveDepartmentResponseDto,
  ActiveOrganizationResponseDto,
  DepartmentSummaryResponseDto,
  OrganizationSummaryResponseDto,
} from "@flow/api"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@flow/ui/components/sidebar"
import { Button } from "@flow/ui/components/button"

import { useUserStore } from "../store/userStore"
import { NavMain } from "./NavMain"
import { NavPages, type SidebarPage, type SidebarPageTeam } from "./NavPages"
import { NavSecondary } from "./NavSecondary"
import { NavUser } from "./NavUser"
import { sidebarNavMain, sidebarNavSecondary } from "./sidebar-data"

export function AppSidebar({
  activeDepartment,
  activeOrganizationId,
  onDepartmentChange,
  onOrganizationChange,
  onSignOut,
  ...props
}: ComponentProps<typeof Sidebar> & {
  activeDepartment: ActiveDepartmentResponseDto | null
  activeOrganizationId?: string | null
  onDepartmentChange: (
    department: ActiveDepartmentResponseDto | DepartmentSummaryResponseDto
  ) => void
  onOrganizationChange: (
    organization: ActiveOrganizationResponseDto | OrganizationSummaryResponseDto
  ) => void
  onSignOut: () => void
}) {
  const userInfo = useUserStore((state) => state.userInfo)
  const [workspaceOpen, setWorkspaceOpen] = useState(false)

  const pageNavigation = useMemo(() => {
    const organization = userInfo?.activeOrganization
    const teamPages: SidebarPageTeam[] = (organization?.teams ?? [])
      .map((team) => ({
        icon: (team as { icon?: unknown }).icon,
        id: team.id,
        name: team.name,
        pages: ((team.pages ?? []) as SidebarPage[]).filter(
          (page) => page.id && page.scope === "TEAM"
        ),
      }))
      .filter((team) => team.pages.length)

    return {
      teams: teamPages,
    }
  }, [userInfo])

  if (!userInfo || !activeOrganizationId) {
    return null
  }

  const sidebarProfile = {
    name: String(userInfo.user.name ?? userInfo.user.email),
    email: userInfo.user.email,
    avatar:
      typeof userInfo.user.image === "string"
        ? userInfo.user.image
        : typeof userInfo.user.avatarUrl === "string"
          ? userInfo.user.avatarUrl
          : null,
  }
  const activeOrganization = userInfo.activeOrganization
  const organizations = userInfo.activeOrganization
    ? [
        userInfo.activeOrganization,
        ...(userInfo.organizations ?? []).filter(
          (organization) => organization.id !== userInfo.activeOrganization?.id
        ),
      ]
    : []

  return (
    <Sidebar collapsible="icon" {...props}>
      <div className="relative border-b border-sidebar-border/70 p-2 group-data-[collapsible=icon]:hidden">
        <Button
          className="h-9 w-full justify-start gap-2 px-2"
          onClick={() => setWorkspaceOpen((open) => !open)}
          type="button"
          variant="ghost"
        >
          <span className="grid size-6 shrink-0 place-items-center rounded-md bg-sidebar-accent text-xs font-semibold">
            {activeOrganization?.name?.charAt(0)?.toUpperCase() ?? "W"}
          </span>
          <span className="min-w-0 flex-1 truncate text-left font-semibold">
            {activeDepartment?.name ?? activeOrganization?.name ?? "Workspace"}
          </span>
          <ChevronsUpDown className="size-4 text-sidebar-foreground/55" />
          <ChevronsLeft className="size-4 text-sidebar-foreground/45" />
        </Button>
        {workspaceOpen ? (
          <div className="absolute top-[calc(100%-0.25rem)] right-2 left-2 z-50 rounded-lg border bg-popover p-1 text-popover-foreground shadow-xl">
            <div className="px-2 py-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Workspaces
            </div>
            {organizations.map((organization) => (
              <div key={organization.id}>
                <button
                  className="flex h-9 w-full items-center gap-2 rounded-md px-2 text-left text-sm hover:bg-muted"
                  onClick={() => {
                    setWorkspaceOpen(false)
                    onOrganizationChange(organization)
                  }}
                  type="button"
                >
                  <span className="grid size-6 place-items-center rounded bg-muted text-xs font-semibold">
                    {organization.name?.charAt(0)?.toUpperCase() ?? "O"}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {organization.name}
                  </span>
                  {organization.id === activeOrganization?.id &&
                  !activeDepartment ? (
                    <Check className="size-4 text-muted-foreground" />
                  ) : null}
                </button>
                {organization.id === activeOrganization?.id ? (
                  <div className="ml-5 border-l border-border/70 pl-1">
                    {activeOrganization?.departments.map((department) => (
                      <button
                        className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                        key={department.id}
                        onClick={() => {
                          setWorkspaceOpen(false)
                          onDepartmentChange(department)
                        }}
                        type="button"
                      >
                        <span className="min-w-0 flex-1 truncate">
                          {department.name}
                        </span>
                        {department.id === activeDepartment?.id ? (
                          <Check className="size-4" />
                        ) : null}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <SidebarContent>
        <NavMain items={sidebarNavMain} />
        <NavPages teams={pageNavigation.teams} />
        <NavSecondary items={sidebarNavSecondary} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser onSignOut={onSignOut} user={sidebarProfile} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
