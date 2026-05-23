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

import { useUserStore } from "../store/userStore"
import { NavMain } from "./NavMain"
import { NavProjects } from "./NavProjects"
import { NavUser } from "./NavUser"
import {
  sidebarNavMain,
  sidebarOrganizations,
  sidebarUser,
  type SidebarOrganization,
  type SidebarProject,
} from "./sidebar-data"
import { TeamSwitcher } from "./TeamSwitcher"

function getProjectIcon(_icon?: string | null): LucideIcon {
  return FolderKanban
}

export function AppSidebar({
  onSignOut,
  ...props
}: ComponentProps<typeof Sidebar> & {
  onSignOut: () => void
}) {
  const user = useUserStore((state) => state.user)
  const userInfo = useUserStore((state) => state.userInfo)
  const [activeOrganization, setActiveOrganization] =
    React.useState<SidebarOrganization>(sidebarOrganizations[0])
  const [activeDepartment, setActiveDepartment] = React.useState(
    sidebarOrganizations[0].departments[0]
  )

  const sidebarProfile = {
    name: userInfo?.user.name ?? user?.name ?? sidebarUser.name,
    email: userInfo?.user.email ?? user?.email ?? sidebarUser.email,
    avatar: userInfo?.user.image ?? user?.image ?? sidebarUser.avatar,
  }

  const projects: SidebarProject[] = React.useMemo(() => {
    const activeProjects =
      userInfo?.activeOrganization?.activeDepartment?.projects

    if (!activeProjects?.length) {
      return activeDepartment.projects.slice(0, 3)
    }

    return activeProjects.slice(0, 3).map((project) => ({
      name: project.name,
      url: project.url,
      icon: getProjectIcon(project.icon),
    }))
  }, [activeDepartment.projects, userInfo?.activeOrganization?.activeDepartment])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher
          activeDepartment={activeDepartment}
          activeOrganization={activeOrganization}
          onDepartmentChange={setActiveDepartment}
          onOrganizationChange={setActiveOrganization}
          organizations={sidebarOrganizations}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarNavMain} />
        <NavProjects
          departmentName={activeDepartment.name}
          projects={projects}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser onSignOut={onSignOut} user={sidebarProfile} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
