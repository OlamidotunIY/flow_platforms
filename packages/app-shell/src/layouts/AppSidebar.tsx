import * as React from "react"
import type { ComponentProps } from "react"
import type { LucideIcon } from "lucide-react"
import { FolderKanban } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@flow/ui/components/sidebar"

import { type FlowDepartmentSummary, useUserStore } from "../store/userStore"
import { PATHS } from "../routing/paths"
import { NavMain } from "./NavMain"
import { NavProjects } from "./NavProjects"
import { NavSecondary } from "./NavSecondary"
import { NavUser } from "./NavUser"
import {
  sidebarNavMain,
  sidebarNavSecondary,
  type SidebarProject,
} from "./sidebar-data"
import { TeamSwitcher } from "./TeamSwitcher"

function getProjectIcon(_icon?: string | null): LucideIcon {
  return FolderKanban
}

function createEmptyDepartment(
  organizationId: string
): FlowDepartmentSummary {
  return {
    color: null,
    description: null,
    id: "no-active-department",
    name: "No department selected",
    organizationId,
    projects: [],
  }
}

export function AppSidebar({
  onSignOut,
  ...props
}: ComponentProps<typeof Sidebar> & {
  onSignOut: () => void
}) {
  const userInfo = useUserStore((state) => state.userInfo)
  const [activeOrganizationId, setActiveOrganizationId] = React.useState<
    string | null
  >(null)
  const [activeDepartmentId, setActiveDepartmentId] = React.useState<
    string | null
  >(null)

  const organizations = React.useMemo(() => {
    if (!userInfo?.activeOrganization) {
      return []
    }

    const organizationsById = new Map(
      (userInfo.organizations ?? []).map((organization) => [
        organization.id,
        organization,
      ])
    )

    organizationsById.set(
      userInfo.activeOrganization.id,
      userInfo.activeOrganization
    )

    return [...organizationsById.values()]
  }, [userInfo?.activeOrganization, userInfo?.organizations])

  const activeOrganization = React.useMemo(() => {
    return (
      organizations.find(
        (organization) => organization.id === activeOrganizationId
      ) ??
      userInfo?.activeOrganization ??
      organizations[0] ??
      null
    )
  }, [activeOrganizationId, organizations, userInfo?.activeOrganization])

  const activeDepartment = React.useMemo(() => {
    if (!activeOrganization) {
      return null
    }

    const departments = activeOrganization.departments ?? []

    return (
      departments.find((department) => department.id === activeDepartmentId) ??
      activeOrganization.activeDepartment ??
      departments[0] ??
      createEmptyDepartment(activeOrganization.id)
    )
  }, [activeDepartmentId, activeOrganization])

  React.useEffect(() => {
    if (activeOrganization && activeOrganization.id !== activeOrganizationId) {
      setActiveOrganizationId(activeOrganization.id)
    }
  }, [activeOrganization, activeOrganizationId])

  React.useEffect(() => {
    if (activeDepartment && activeDepartment.id !== activeDepartmentId) {
      setActiveDepartmentId(activeDepartment.id)
    }
  }, [activeDepartment, activeDepartmentId])

  const projects: SidebarProject[] = React.useMemo(() => {
    const activeProjects = activeDepartment?.projects

    if (!activeProjects?.length) {
      return []
    }

    return activeProjects.slice(0, 3).map((project) => ({
      id: project.id,
      name: project.name,
      url: PATHS.projects.detail(project.id),
      icon: getProjectIcon(project.icon),
    }))
  }, [activeDepartment?.projects])

  if (!userInfo || !activeOrganization) {
    return null
  }

  const resolvedDepartment =
    activeDepartment ?? createEmptyDepartment(activeOrganization.id)

  const sidebarProfile = {
    name: userInfo.user.name ?? userInfo.user.email,
    email: userInfo.user.email,
    avatar: userInfo.user.image ?? userInfo.user.avatarUrl,
  }

  function createDepartment() {
    const departmentName = window.prompt("Department name")

    if (!departmentName?.trim()) {
      return
    }

    console.warn(
      "Create department endpoint is not available in the generated API client yet.",
      {
        name: departmentName.trim(),
        organizationId: activeOrganization.id,
      }
    )
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher
          activeDepartment={resolvedDepartment}
          activeOrganization={activeOrganization}
          onCreateDepartment={createDepartment}
          onDepartmentChange={(department) => setActiveDepartmentId(department.id)}
          onOrganizationChange={(organization) => {
            setActiveOrganizationId(organization.id)
            setActiveDepartmentId(
              organization.activeDepartment?.id ??
                organization.departments?.[0]?.id ??
                null
            )
          }}
          organizations={organizations}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarNavMain} />
        <NavProjects projects={projects} />
        <NavSecondary items={sidebarNavSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser onSignOut={onSignOut} user={sidebarProfile} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
